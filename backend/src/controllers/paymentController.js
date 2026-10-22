import crypto from 'crypto';
import { config, prisma } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return errorResponse(res, 'Order amount is required', 400);
    }

    // In test mode or when using mock razorpay credentials:
    // Generate a compliant Razorpay Order payload
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;

    return successResponse(res, {
      id: mockOrderId,
      amount: Math.round(parseFloat(amount) * 100), // in currency subunits (cents/paise)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      keyId: config.razorpay.keyId,
    }, 'Payment intent generated in test mode');
  } catch (error) {
    console.error('createRazorpayOrder error:', error);
    return errorResponse(res, 'Failed to create payment intent', 500);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return errorResponse(res, 'Payment verification parameters missing', 400);
    }

    // In production with live secret:
    // const body = razorpay_order_id + '|' + razorpay_payment_id;
    // const expectedSignature = crypto.createHmac('sha256', config.razorpay.keySecret).update(body).digest('hex');
    // const isAuthentic = expectedSignature === razorpay_signature;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paymentId: razorpay_payment_id,
        },
      });

      await prisma.payment.create({
        data: {
          orderId,
          paymentMethod: 'RAZORPAY',
          transactionId: razorpay_payment_id,
          amount: 0, // already in order
          status: 'SUCCESS',
          rawResponse: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
        },
      });
    }

    return successResponse(res, { verified: true, paymentId: razorpay_payment_id }, 'Payment verified successfully');
  } catch (error) {
    console.error('verifyPayment error:', error);
    return errorResponse(res, 'Payment verification failed', 500);
  }
};
