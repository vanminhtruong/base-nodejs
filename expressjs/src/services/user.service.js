import BaseService from './base.service.js';
import { userRepository } from '../repositories/index.js';

/**
 * User Service for handling user-specific business logic
 * Extends the BaseService to inherit common operations
 */
class UserService extends BaseService {
  constructor() {
    super(userRepository);
  }

  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} - Found user
   */
  async findByEmail(email) {
    const user = await this.repository.findByEmail(email);
    return user;
  }

  /**
   * Find a user by username
   * @param {string} username - Username
   * @returns {Promise<Object>} - Found user
   */
  async findByUsername(username) {
    const user = await this.repository.findByUsername(username);
    return user;
  }

  /**
   * Register a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  async register(userData) {
    // Check if email already exists
    const existingEmail = await this.repository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already in use');
    }

    // Check if username already exists
    const existingUsername = await this.repository.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Create new user
    return this.create(userData);
  }

  /**
   * Get active users
   * @returns {Promise<Array>} - Array of active users
   */
  async getActiveUsers() {
    return this.repository.findActiveUsers();
  }
}

const userService = new UserService();
export default userService;
