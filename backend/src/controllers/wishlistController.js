import { prisma } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true } },
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.product.name,
      slug: i.product.slug,
      brand: i.product.brand,
      sellingPrice: i.product.sellingPrice,
      regularPrice: i.product.regularPrice,
      stockQuantity: i.product.stockQuantity,
      category: i.product.category?.name,
      image: i.product.images[0]?.url || null,
      addedAt: i.createdAt,
    }));

    return successResponse(res, formatted, 'Wishlist loaded');
  } catch (error) {
    console.error('getWishlist error:', error);
    return errorResponse(res, 'Failed to fetch wishlist', 500);
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400);
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      return successResponse(res, { inWishlist: false, productId }, 'Removed from wishlist');
    }

    await prisma.wishlistItem.create({
      data: { userId, productId },
    });

    return successResponse(res, { inWishlist: true, productId }, 'Added to wishlist', 201);
  } catch (error) {
    console.error('toggleWishlist error:', error);
    return errorResponse(res, 'Failed to update wishlist', 500);
  }
};
