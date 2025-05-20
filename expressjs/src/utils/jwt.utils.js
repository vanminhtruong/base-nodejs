import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.config.js';

/**
 * Utility class for handling JWT operations
 */
class JwtUtils {
  /**
   * Generate an access token for a user
   * @param {Object} payload - User data to include in the token
   * @returns {string} - JWT token
   */
  static generateAccessToken(payload) {
    return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
  }

  /**
   * Generate a refresh token for a user
   * @param {Object} payload - User data to include in the token
   * @returns {string} - JWT refresh token
   */
  static generateRefreshToken(payload) {
    return jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });
  }

  /**
   * Verify an access token
   * @param {string} token - JWT token to verify
   * @returns {Object|null} - Decoded token payload or null if invalid
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify a refresh token
   * @param {string} token - JWT refresh token to verify
   * @returns {Object|null} - Decoded token payload or null if invalid
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, jwtConfig.refreshSecret);
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract token from request
   * @param {Object} req - Express request object
   * @returns {string|null} - JWT token or null if not found
   */
  static getTokenFromRequest(req) {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Check cookies
    if (req.cookies && req.cookies.accessToken) {
      return req.cookies.accessToken;
    }
    
    // Check query parameters
    if (req.query && req.query.token) {
      return req.query.token;
    }
    
    return null;
  }
}

export default JwtUtils;
