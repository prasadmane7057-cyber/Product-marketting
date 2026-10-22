import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminExportCSV,
  adminUploadImage,
} from '../controllers/adminProductController.js';
import { adminCreateCategory } from '../controllers/categoryController.js';
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  adminProcessRefund,
} from '../controllers/adminOrderController.js';
import {
  adminGetCoupons,
  adminCreateCoupon,
} from '../controllers/couponController.js';
import {
  adminGetReviews,
  adminUpdateReviewStatus,
} from '../controllers/reviewController.js';
import { getAdminAnalytics } from '../controllers/marketingController.js';

const router = Router();

// Protect ALL admin routes
router.use(authenticate, adminOnly);

// Analytics
router.get('/analytics', getAdminAnalytics);

// Product Management
router.get('/products', adminGetProducts);
router.post('/products', adminCreateProduct);
router.put('/products/:id', adminUpdateProduct);
router.delete('/products/:id', adminDeleteProduct);
router.get('/products/export/csv', adminExportCSV);
router.post('/upload', upload.single('image'), adminUploadImage);

// Category Management
router.post('/categories', adminCreateCategory);

// Order Management
router.get('/orders', adminGetOrders);
router.put('/orders/:id/status', adminUpdateOrderStatus);
router.post('/orders/:id/refund', adminProcessRefund);

// Coupon Management
router.get('/coupons', adminGetCoupons);
router.post('/coupons', adminCreateCoupon);

// Review Management
router.get('/reviews', adminGetReviews);
router.put('/reviews/:id/status', adminUpdateReviewStatus);

export default router;
