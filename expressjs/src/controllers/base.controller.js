/**
 * Base Controller class that provides common response handling methods
 * All specific controllers should extend this class
 */
class BaseController {
  /**
   * Send a success response
   * @param {Object} res - Express response object
   * @param {Object|Array} data - Response data
   * @param {number} statusCode - HTTP status code
   * @returns {Object} - Express response
   */
  sendSuccess(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      data
    });
  }

  /**
   * Send an error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} - Express response
   */
  sendError(res, message, statusCode = 400) {
    return res.status(statusCode).json({
      status: 'error',
      message
    });
  }

  /**
   * Catch async errors in controller methods
   * @param {Function} fn - Controller method
   * @returns {Function} - Express middleware function
   */
  catchAsync(fn) {
    return (req, res, next) => {
      fn(req, res, next).catch(err => next(err));
    };
  }
}

export default BaseController;
