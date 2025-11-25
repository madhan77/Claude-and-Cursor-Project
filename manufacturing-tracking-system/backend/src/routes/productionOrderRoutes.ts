import express from 'express';
import {
  createProductionOrder,
  getAllProductionOrders,
  getProductionOrderById,
  updateProductionOrder,
  deleteProductionOrder,
  getDashboardStats,
} from '../controllers/productionOrderController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.use(authenticate); // All routes require authentication

router.get('/stats', getDashboardStats);
router.get('/', getAllProductionOrders);
router.get('/:id', getProductionOrderById);

router.post('/', authorize('admin', 'manager', 'supervisor'), createProductionOrder);
router.put('/:id', authorize('admin', 'manager', 'supervisor'), updateProductionOrder);
router.delete('/:id', authorize('admin', 'manager'), deleteProductionOrder);

export default router;
