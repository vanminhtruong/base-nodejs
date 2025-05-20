import express from 'express';
import { authController } from '../controllers/index.js';
import { AuthMiddleware } from '../middlewares/index.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', AuthMiddleware.refreshToken, authController.refreshToken);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', AuthMiddleware.authenticate, authController.getProfile);

export default router;
