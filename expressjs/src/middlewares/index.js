import validate from './validate.middleware.js';
import UploadMiddleware from './upload.middleware.js';
import AuthMiddleware from './auth.middleware.js';

// Create default upload middleware instance
const uploadMiddleware = UploadMiddleware.createMiddleware();

export { validate, UploadMiddleware, uploadMiddleware, AuthMiddleware };
