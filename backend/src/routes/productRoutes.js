import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getHomeSections,
} from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/home-sections', getHomeSections);
router.get('/:slug', getProductBySlug);

export default router;
