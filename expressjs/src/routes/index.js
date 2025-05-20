import express from 'express';
import userRoutes from './user.routes.js';
import fileRoutes from './file.routes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is up and running'
  });
});

// API routes
router.use('/users', userRoutes);
router.use('/files', fileRoutes);

export default router;
