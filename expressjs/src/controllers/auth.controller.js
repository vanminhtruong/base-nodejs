import BaseController from './base.controller.js';
import { userService } from '../services/index.js';
import JwtUtils from '../utils/jwt.utils.js';
import bcrypt from 'bcryptjs';
import jwtConfig from '../config/jwt.config.js';

/**
 * Authentication Controller for handling auth-related HTTP requests
 * Extends the BaseController to inherit common response methods
 */
class AuthController extends BaseController {
  constructor() {
    super();
    // Bind methods to ensure 'this' refers to AuthController instance
    this.register = this.catchAsync(this.register.bind(this));
    this.login = this.catchAsync(this.login.bind(this));
    this.refreshToken = this.catchAsync(this.refreshToken.bind(this));
    this.logout = this.catchAsync(this.logout.bind(this));
    this.getProfile = this.catchAsync(this.getProfile.bind(this));
  }

  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    const userData = req.body;
    
    // Hash password
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    
    try {
      // Create user
      const user = await userService.register(userData);
      
      // Generate tokens
      const accessToken = JwtUtils.generateAccessToken({
        id: user.id,
        email: user.email,
        roles: user.roles || ['user']
      });
      
      const refreshToken = JwtUtils.generateRefreshToken({
        id: user.id,
        email: user.email,
        roles: user.roles || ['user']
      });
      
      // Set cookies
      res.cookie('accessToken', accessToken, jwtConfig.cookieOptions);
      res.cookie('refreshToken', refreshToken, {
        ...jwtConfig.cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user.toJSON();
      
      this.sendSuccess(res, {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }, 201);
    } catch (error) {
      this.sendError(res, error.message, 400);
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return this.sendError(res, 'Email and password are required', 400);
    }
    
    try {
      // Find user by email
      const user = await userService.findByEmail(email);
      
      if (!user) {
        return this.sendError(res, 'Invalid credentials', 401);
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return this.sendError(res, 'Invalid credentials', 401);
      }
      
      // Generate tokens
      const accessToken = JwtUtils.generateAccessToken({
        id: user.id,
        email: user.email,
        roles: user.roles || ['user']
      });
      
      const refreshToken = JwtUtils.generateRefreshToken({
        id: user.id,
        email: user.email,
        roles: user.roles || ['user']
      });
      
      // Set cookies
      res.cookie('accessToken', accessToken, jwtConfig.cookieOptions);
      res.cookie('refreshToken', refreshToken, {
        ...jwtConfig.cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user.toJSON();
      
      this.sendSuccess(res, {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      });
    } catch (error) {
      this.sendError(res, error.message, 500);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshToken(req, res) {
    // refreshToken middleware has already verified the token
    // and attached the user and new accessToken to the request
    
    this.sendSuccess(res, {
      accessToken: req.accessToken
    });
  }

  /**
   * Logout user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    this.sendSuccess(res, {
      message: 'Logged out successfully'
    });
  }

  /**
   * Get user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      // Get user from database
      const user = await userService.getById(req.user.id);
      
      if (!user) {
        return this.sendError(res, 'User not found', 404);
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user.toJSON();
      
      this.sendSuccess(res, {
        user: userWithoutPassword
      });
    } catch (error) {
      this.sendError(res, error.message, 500);
    }
  }
}

const authController = new AuthController();
export default authController;
