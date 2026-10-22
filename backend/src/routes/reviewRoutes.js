import { Router } from 'express';
import { submitReview } from '../controllers/reviewController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', optionalAuth, submitReview);

export default router;
