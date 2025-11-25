import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin', 'staff'));

// Admin routes can be expanded later for flight management, etc.

export default router;
