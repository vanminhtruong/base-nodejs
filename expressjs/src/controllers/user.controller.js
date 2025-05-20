import BaseController from './base.controller.js';
import { userService } from '../services/index.js';

/**
 * User Controller for handling user-related HTTP requests
 * Extends the BaseController to inherit common response methods
 */
class UserController extends BaseController {
  constructor() {
    super();
    // Bind methods to ensure 'this' refers to UserController instance
    this.getAllUsers = this.catchAsync(this.getAllUsers.bind(this));
    this.getUserById = this.catchAsync(this.getUserById.bind(this));
    this.createUser = this.catchAsync(this.createUser.bind(this));
    this.updateUser = this.catchAsync(this.updateUser.bind(this));
    this.deleteUser = this.catchAsync(this.deleteUser.bind(this));
    this.getActiveUsers = this.catchAsync(this.getActiveUsers.bind(this));
  }

  /**
   * Get all users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllUsers(req, res) {
    const users = await userService.getAll();
    this.sendSuccess(res, users);
  }

  /**
   * Get user by id
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserById(req, res) {
    const { id } = req.params;
    try {
      const user = await userService.getById(id);
      this.sendSuccess(res, user);
    } catch (error) {
      this.sendError(res, error.message, 404);
    }
  }

  /**
   * Create a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createUser(req, res) {
    try {
      const user = await userService.register(req.body);
      this.sendSuccess(res, user, 201);
    } catch (error) {
      this.sendError(res, error.message, 400);
    }
  }

  /**
   * Update a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUser(req, res) {
    const { id } = req.params;
    try {
      const user = await userService.update(id, req.body);
      this.sendSuccess(res, user);
    } catch (error) {
      this.sendError(res, error.message, 400);
    }
  }

  /**
   * Delete a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteUser(req, res) {
    const { id } = req.params;
    try {
      await userService.delete(id);
      this.sendSuccess(res, { message: 'User deleted successfully' });
    } catch (error) {
      this.sendError(res, error.message, 400);
    }
  }

  /**
   * Get active users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getActiveUsers(req, res) {
    const users = await userService.getActiveUsers();
    this.sendSuccess(res, users);
  }
}

const userController = new UserController();
export default userController;
