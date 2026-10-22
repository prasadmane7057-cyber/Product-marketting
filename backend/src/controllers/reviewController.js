import { prisma } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const submitReview = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const { productId, rating, title, comment, userName } = req.body;

    if (!productId || !rating || !title || !comment) {
      return errorResponse(res, 'Product ID, rating, review title, and comments are required', 400);
    }

    const numRating = parseInt(rating, 10);
    if (numRating < 1 || numRating > 5) {
      return errorResponse(res, 'Rating must be between 1 and 5 stars', 400);
    }

    // Check if user purchased the product to set isVerifiedPurchase
    let isVerifiedPurchase = false;
    if (userId) {
      const pastOrder = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: {
            userId,
            status: { in: ['DELIVERED', 'PROCESSING', 'SHIPPED'] },
          },
        },
      });
      if (pastOrder) {
        isVerifiedPurchase = true;
      }
    }

    const reviewerName = req.user ? `${req.user.firstName} ${req.user.lastName}` : (userName || 'Verified Buyer');

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        userName: reviewerName,
        rating: numRating,
        title: title.trim(),
        comment: comment.trim(),
        isVerifiedPurchase,
        status: 'APPROVED', // Default approved in demo, can be toggled by admin
      },
    });

    return successResponse(res, review, 'Thank you! Your verified review has been published.', 201);
  } catch (error) {
    console.error('submitReview error:', error);
    return errorResponse(res, 'Failed to submit review', 500);
  }
};

export const adminGetReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: { product: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, reviews, 'Reviews loaded');
  } catch (error) {
    console.error('adminGetReviews error:', error);
    return errorResponse(res, 'Failed to fetch reviews', 500);
  }
};

export const adminUpdateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "APPROVED", "REJECTED", "PENDING"

    const review = await prisma.review.update({
      where: { id },
      data: { status },
    });

    return successResponse(res, review, `Review marked as ${status}`);
  } catch (error) {
    console.error('adminUpdateReviewStatus error:', error);
    return errorResponse(res, 'Failed to update review status', 500);
  }
};
