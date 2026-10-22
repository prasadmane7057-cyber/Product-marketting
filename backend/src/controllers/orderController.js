import { prisma } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

export const checkout = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress,
      paymentMethod = 'COD',
      couponCode,
      notes,
      items: rawItems,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      return errorResponse(res, 'Customer name, email, phone, and shipping address are required', 400);
    }

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return errorResponse(res, 'Checkout requires at least one order item', 400);
    }

    // Server-side recalculation and stock validation
    let subtotal = 0;
    const validatedItems = [];

    for (const raw of rawItems) {
      const product = await prisma.product.findUnique({
        where: { id: raw.productId },
        include: { variants: true },
      });

      if (!product || product.status !== 'PUBLISHED') {
        return errorResponse(res, `Product ${raw.productName || raw.productId} is not available`, 400);
      }

      let variant = null;
      let unitPrice = product.sellingPrice;
      let availableStock = product.stockQuantity;
      let sku = product.sku;
      let variantName = null;

      if (raw.variantId) {
        variant = product.variants.find((v) => v.id === raw.variantId);
        if (!variant) {
          return errorResponse(res, `Variant selected for ${product.name} no longer exists`, 400);
        }
        unitPrice = variant.price;
        availableStock = variant.stockQuantity;
        sku = variant.sku;
        variantName = variant.name;
      }

      const qty = parseInt(raw.quantity, 10);
      if (qty <= 0) {
        return errorResponse(res, 'Quantity must be at least 1', 400);
      }

      if (availableStock < qty) {
        return errorResponse(
          res,
          `Insufficient stock for "${product.name}${variantName ? ' - ' + variantName : ''}". Only ${availableStock} units remaining.`,
          400
        );
      }

      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        variantId: variant?.id || null,
        productName: product.name,
        productSku: sku,
        variantName,
        unitPrice,
        quantity: qty,
        subtotal: Number(lineTotal.toFixed(2)),
      });
    }

    // Coupon calculation
    let discountTotal = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (coupon && coupon.isActive && new Date() <= new Date(coupon.endDate)) {
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountTotal = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discountTotal > coupon.maxDiscountAmount) {
              discountTotal = coupon.maxDiscountAmount;
            }
          } else {
            discountTotal = Math.min(subtotal, coupon.discountValue);
          }
          appliedCoupon = coupon;
        }
      }
    }

    // Shipping and Tax rules
    const shippingTotal = subtotal >= 100 ? 0 : 15.0; // Free shipping over $100
    const taxableAmount = Math.max(0, subtotal - discountTotal);
    const taxTotal = Number((taxableAmount * 0.05).toFixed(2)); // 5% tax
    const grandTotal = Number((taxableAmount + shippingTotal + taxTotal).toFixed(2));

    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Initial payment status
    const isOnlinePayment = paymentMethod === 'RAZORPAY' || paymentMethod === 'TEST_CARD';
    const paymentStatus = isOnlinePayment ? 'PAID' : 'PENDING';
    const orderStatus = 'PROCESSING';

    // Execute database transaction: Order, Items, Stock decrements, Inventory logs, Coupon increment
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : shippingAddress,
          billingAddress: typeof billingAddress === 'object' ? JSON.stringify(billingAddress) : (billingAddress || null),
          subtotal: Number(subtotal.toFixed(2)),
          discountTotal: Number(discountTotal.toFixed(2)),
          shippingTotal,
          taxTotal,
          grandTotal,
          couponCode: appliedCoupon?.code || null,
          status: orderStatus,
          paymentStatus,
          paymentMethod,
          paymentId: isOnlinePayment ? `pay_demo_${Date.now()}` : null,
          customerNotes: notes || null,
          items: {
            create: validatedItems,
          },
          payments: {
            create: [
              {
                paymentMethod,
                transactionId: isOnlinePayment ? `txn_auth_${Date.now()}` : `cod_pending_${Date.now()}`,
                amount: grandTotal,
                status: isOnlinePayment ? 'SUCCESS' : 'PENDING',
              },
            ],
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // 2. Decrement stock & record inventory logs
      for (const item of validatedItems) {
        if (item.variantId) {
          const v = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          const newQty = Math.max(0, v.stockQuantity - item.quantity);
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: newQty },
          });
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              changeAmount: -item.quantity,
              previousStock: v.stockQuantity,
              newStock: newQty,
              reason: 'ORDER_PURCHASE',
              referenceId: newOrder.orderNumber,
            },
          });
        }

        const p = await tx.product.findUnique({ where: { id: item.productId } });
        const newProdQty = Math.max(0, p.stockQuantity - item.quantity);
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: newProdQty },
        });
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            changeAmount: -item.quantity,
            previousStock: p.stockQuantity,
            newStock: newProdQty,
            reason: 'ORDER_PURCHASE',
            referenceId: newOrder.orderNumber,
          },
        });
      }

      // 3. Update coupon usage
      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      // 4. Clear user cart if authenticated
      if (userId) {
        const userCart = await tx.cart.findUnique({ where: { userId } });
        if (userCart) {
          await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
        }
      }

      // 5. Record Analytics Event
      await tx.analyticsEvent.create({
        data: {
          eventType: 'PURCHASE',
          userId,
          entityId: newOrder.id,
          metadata: JSON.stringify({
            orderNumber: newOrder.orderNumber,
            grandTotal: newOrder.grandTotal,
            itemCount: validatedItems.length,
            paymentMethod,
          }),
        },
      });

      return newOrder;
    });

    // Send confirmation email asynchronously
    sendOrderConfirmationEmail(order).catch((err) => console.error('Email dispatch error:', err));

    return successResponse(res, order, 'Order placed successfully! Thank you for your business.', 201);
  } catch (error) {
    console.error('Checkout error:', error);
    return errorResponse(res, 'Failed to complete checkout: ' + error.message, 500);
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, orders, 'Orders loaded');
  } catch (error) {
    console.error('getCustomerOrders error:', error);
    return errorResponse(res, 'Failed to fetch orders', 500);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { idOrNumber } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
      },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Access authorization check
    if (!isAdmin && order.userId && order.userId !== userId) {
      return errorResponse(res, 'Unauthorized to view this order', 403);
    }

    return successResponse(res, order, 'Order details loaded');
  } catch (error) {
    console.error('getOrderById error:', error);
    return errorResponse(res, 'Failed to fetch order', 500);
  }
};

export const trackPublicOrder = async (req, res) => {
  try {
    const { orderNumber, email } = req.query;
    if (!orderNumber || !email) {
      return errorResponse(res, 'Order number and customer email are required for tracking', 400);
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.trim(),
        customerEmail: email.toLowerCase().trim(),
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        trackingNumber: true,
        trackingCarrier: true,
        trackingUrl: true,
        createdAt: true,
        updatedAt: true,
        grandTotal: true,
        items: {
          select: {
            productName: true,
            quantity: true,
            unitPrice: true,
            variantName: true,
          },
        },
      },
    });

    if (!order) {
      return errorResponse(res, 'No matching order found with the provided details', 404);
    }

    return successResponse(res, order, 'Tracking information loaded');
  } catch (error) {
    console.error('trackPublicOrder error:', error);
    return errorResponse(res, 'Failed to track order', 500);
  }
};
