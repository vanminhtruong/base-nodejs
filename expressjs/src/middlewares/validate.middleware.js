/**
 * Middleware for request validation
 * @param {Function} validator - Validation function
 * @returns {Function} - Express middleware function
 */
const validate = (validator) => {
  return (req, res, next) => {
    const { error } = validator(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details.map(detail => detail.message).join(', ')
      });
    }
    next();
  };
};

export default validate;
