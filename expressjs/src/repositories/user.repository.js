import BaseRepository from './base.repository.js';
import User from '../models/user.model.js';

/**
 * User Repository for handling user-specific database operations
 * Extends the BaseRepository to inherit common CRUD operations
 */
class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} - Found user
   */
  async findByEmail(email) {
    return this.findOne({ where: { email } });
  }

  /**
   * Find a user by username
   * @param {string} username - Username
   * @returns {Promise<Object>} - Found user
   */
  async findByUsername(username) {
    return this.findOne({ where: { username } });
  }

  /**
   * Find active users
   * @returns {Promise<Array>} - Array of active users
   */
  async findActiveUsers() {
    return this.findAll({ where: { isActive: true } });
  }
}

const userRepository = new UserRepository();
export default userRepository;
