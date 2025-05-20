import express from 'express';
import { userController } from '../controllers/index.js';

const router = express.Router();

// GET /api/users - Get all users
router.get('/', userController.getAllUsers);

// GET /api/users/active - Get active users
router.get('/active', userController.getActiveUsers);

// GET /api/users/:id - Get user by id
router.get('/:id', userController.getUserById);

// POST /api/users - Create new user
router.post('/', userController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser);

export default router;
