import { prisma } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return errorResponse(res, 'Coupon code is required', 400);
    }

    const orderSubtotal = parseFloat(subtotal) || 0;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return errorResponse(res, 'Invalid coupon code', 404);
    }

    if (!coupon.isActive) {
      return errorResponse(res, 'This coupon is no longer active', 400);
    }

    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
      return errorResponse(res, 'This coupon has expired', 400);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return errorResponse(res, 'Coupon usage limit has been reached', 400);
    }

    if (coupon.minOrderAmount && orderSubtotal < coupon.minOrderAmount) {
      return errorResponse(
        res,
        `Coupon requires a minimum order subtotal of $${coupon.minOrderAmount.toFixed(2)}`,
        400
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(orderSubtotal, coupon.discountValue);
    }

    return successResponse(res, {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Number(discountAmount.toFixed(2)),
    }, 'Coupon applied successfully');
  } catch (error) {
    console.error('validateCoupon error:', error);
    return errorResponse(res, 'Failed to validate coupon', 500);
  }
};

export const adminGetCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, coupons, 'Coupons loaded');
  } catch (error) {
    console.error('adminGetCoupons error:', error);
    return errorResponse(res, 'Failed to fetch coupons', 500);
  }
};

export const adminCreateCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !endDate) {
      return errorResponse(res, 'Code, discount type, value, and end date are required', 400);
    }

    const created = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        description: description || `Save ${discountValue}${discountType === 'PERCENTAGE' ? '%' : '$'}`,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrderAmount || 0),
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        usageLimit: parseInt(usageLimit || 100, 10),
      },
    });

    return successResponse(res, created, 'Coupon created successfully', 201);
  } catch (error) {
    console.error('adminCreateCoupon error:', error);
    return errorResponse(res, 'Failed to create coupon', 500);
  }
};
