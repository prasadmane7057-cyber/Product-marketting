import { Router } from 'express';
import {
  checkout,
  getCustomerOrders,
  getOrderById,
  trackPublicOrder,
} from '../controllers/orderController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/checkout', optionalAuth, checkout);
router.get('/my-orders', authenticate, getCustomerOrders);
router.get('/track', trackPublicOrder);
router.get('/:idOrNumber', optionalAuth, getOrderById);

export default router;
