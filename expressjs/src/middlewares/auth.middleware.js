import JwtUtils from '../utils/jwt.utils.js';
import { ApiError } from '../utils/error-handler.js';

/**
 * Middleware for JWT authentication
 */
class AuthMiddleware {
  /**
   * Verify JWT token and attach user to request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static authenticate(req, res, next) {
    try {
      // Get token from request
      const token = JwtUtils.getTokenFromRequest(req);
      
      if (!token) {
        throw new ApiError('Authentication required', 401);
      }
      
      // Verify token
      const decoded = JwtUtils.verifyAccessToken(token);
      
      if (!decoded) {
        throw new ApiError('Invalid or expired token', 401);
      }
      
      // Attach user to request
      req.user = decoded;
      
      next();
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Check if user has required role
   * @param {string|string[]} roles - Required role(s)
   * @returns {Function} - Express middleware
   */
  static authorize(roles) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          throw new ApiError('Authentication required', 401);
        }
        
        const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];
        
        // Check if user has at least one of the required roles
        const requiredRoles = Array.isArray(roles) ? roles : [roles];
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
        
        if (!hasRequiredRole) {
          throw new ApiError('Access denied', 403);
        }
        
        next();
      } catch (error) {
        next(error);
      }
    };
  }
  
  /**
   * Refresh JWT token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        throw new ApiError('Refresh token required', 401);
      }
      
      // Verify refresh token
      const decoded = JwtUtils.verifyRefreshToken(refreshToken);
      
      if (!decoded) {
        throw new ApiError('Invalid or expired refresh token', 401);
      }
      
      // Generate new access token
      const accessToken = JwtUtils.generateAccessToken({
        id: decoded.id,
        email: decoded.email,
        roles: decoded.roles
      });
      
      // Set new access token in cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      // Attach user to request
      req.user = decoded;
      req.accessToken = accessToken;
      
      next();
    } catch (error) {
      next(error);
    }
  }
}

export default AuthMiddleware;
