import { Router } from 'express';
import {
  subscribeNewsletter,
  submitContactEnquiry,
  trackAnalyticsEvent,
} from '../controllers/marketingController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/newsletter', subscribeNewsletter);
router.post('/contact', submitContactEnquiry);
router.post('/events', optionalAuth, trackAnalyticsEvent);

export default router;
