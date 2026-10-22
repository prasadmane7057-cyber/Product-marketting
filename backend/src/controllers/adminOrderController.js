import { prisma } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const adminGetOrders = async (req, res) => {
  try {
    const { q, status, paymentStatus, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * pageSize;

    const where = {};
    if (q) {
      where.OR = [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerEmail: { contains: q } },
      ];
    }
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payments: true,
        },
      }),
    ]);

    return successResponse(res, {
      items: orders,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('adminGetOrders error:', error);
    return errorResponse(res, 'Failed to fetch admin orders', 500);
  }
};

export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, trackingCarrier, trackingUrl, adminNotes } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: status || undefined,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
        trackingCarrier: trackingCarrier !== undefined ? trackingCarrier : undefined,
        trackingUrl: trackingUrl !== undefined ? trackingUrl : undefined,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
      },
      include: { items: true, payments: true },
    });

    return successResponse(res, updated, `Order status updated to ${updated.status}`);
  } catch (error) {
    console.error('adminUpdateOrderStatus error:', error);
    return errorResponse(res, 'Failed to update order status', 500);
  }
};

export const adminProcessRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, restock = true } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    if (order.status === 'REFUNDED') {
      return errorResponse(res, 'Order is already marked as refunded', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Order status
      const ord = await tx.order.update({
        where: { id },
        data: {
          status: 'REFUNDED',
          paymentStatus: 'REFUNDED',
          adminNotes: `Refund processed: ${reason || 'Customer request'} on ${new Date().toISOString()}`,
        },
        include: { items: true, payments: true },
      });

      // 2. Restock products if requested
      if (restock) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              changeAmount: item.quantity,
              previousStock: 0,
              newStock: item.quantity,
              reason: 'REFUND_RESTOCK',
              referenceId: order.orderNumber,
            },
          });
        }
      }

      // 3. Create refund payment record
      await tx.payment.create({
        data: {
          orderId: id,
          paymentMethod: order.paymentMethod,
          transactionId: `ref_${Date.now()}`,
          amount: -order.grandTotal,
          status: 'REFUNDED',
        },
      });

      return ord;
    });

    return successResponse(res, updated, 'Refund processed and inventory successfully restored');
  } catch (error) {
    console.error('adminProcessRefund error:', error);
    return errorResponse(res, 'Failed to process refund', 500);
  }
};
