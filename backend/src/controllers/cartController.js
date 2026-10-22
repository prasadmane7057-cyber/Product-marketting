import { prisma } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Helper to find or create cart for user or guest session
const getOrCreateCart = async (userId, sessionId) => {
  if (userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true } },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { where: { isPrimary: true } } },
              },
              variant: true,
            },
          },
        },
      });
    }
    return cart;
  }

  if (sessionId) {
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true } } },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { where: { isPrimary: true } } },
              },
              variant: true,
            },
          },
        },
      });
    }
    return cart;
  }

  return null;
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;

    if (!userId && !sessionId) {
      return successResponse(res, { items: [], subtotal: 0, totalItems: 0 }, 'Empty cart');
    }

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) {
      return successResponse(res, { items: [], subtotal: 0, totalItems: 0 }, 'Empty cart');
    }

    let subtotal = 0;
    let totalItems = 0;

    const items = cart.items.map((item) => {
      const unitPrice = item.variant?.price || item.product.sellingPrice;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      totalItems += item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        productSlug: item.product.slug,
        productSku: item.product.sku,
        variantName: item.variant?.name || null,
        unitPrice,
        regularPrice: item.product.regularPrice,
        quantity: item.quantity,
        stockAvailable: item.variant?.stockQuantity || item.product.stockQuantity,
        lineTotal,
        image: item.product.images[0]?.url || null,
      };
    });

    return successResponse(res, {
      cartId: cart.id,
      items,
      subtotal: Number(subtotal.toFixed(2)),
      totalItems,
    });
  } catch (error) {
    console.error('getCart error:', error);
    return errorResponse(res, 'Failed to fetch cart', 500);
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;

    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || product.status !== 'PUBLISHED') {
      return errorResponse(res, 'Product is unavailable', 404);
    }

    let maxStock = product.stockQuantity;
    if (variantId) {
      const v = product.variants.find((v) => v.id === variantId);
      if (!v) return errorResponse(res, 'Selected variant not found', 400);
      maxStock = v.stockQuantity;
    }

    if (maxStock < quantity) {
      return errorResponse(res, `Only ${maxStock} units currently in stock`, 400);
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + parseInt(quantity, 10);
      if (newQty > maxStock) {
        return errorResponse(res, `Cannot add more. Limit of ${maxStock} units reached.`, 400);
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity: parseInt(quantity, 10),
        },
      });
    }

    return getCart(req, res);
  } catch (error) {
    console.error('addToCart error:', error);
    return errorResponse(res, 'Failed to add item to cart', 500);
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return getCart(req, res);
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true, variant: true },
    });

    if (!item) {
      return errorResponse(res, 'Cart item not found', 404);
    }

    const available = item.variant ? item.variant.stockQuantity : item.product.stockQuantity;
    if (qty > available) {
      return errorResponse(res, `Only ${available} items in stock`, 400);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: qty },
    });

    return getCart(req, res);
  } catch (error) {
    console.error('updateCartItem error:', error);
    return errorResponse(res, 'Failed to update item quantity', 500);
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    await prisma.cartItem.deleteMany({
      where: { id: itemId },
    });
    return getCart(req, res);
  } catch (error) {
    console.error('removeCartItem error:', error);
    return errorResponse(res, 'Failed to remove item', 500);
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    const cart = await getOrCreateCart(userId, sessionId);

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return successResponse(res, { items: [], subtotal: 0, totalItems: 0 }, 'Cart cleared');
  } catch (error) {
    console.error('clearCart error:', error);
    return errorResponse(res, 'Failed to clear cart', 500);
  }
};
