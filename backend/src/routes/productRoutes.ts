import { Router } from 'express';
import {
  getProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Public routes for employees
router.get('/', getProducts);
router.get('/search', searchProducts);

// Protected routes for owners only
router.post('/', protect, authorize('owner'), createProduct);
router.put('/:id', protect, authorize('owner'), updateProduct);
router.delete('/:id', protect, authorize('owner'), deleteProduct);

export default router;
