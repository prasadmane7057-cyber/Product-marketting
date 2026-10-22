import { Router } from 'express';
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyPayment);

export default router;
