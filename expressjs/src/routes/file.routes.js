import express from 'express';
import { fileController } from '../controllers/index.js';
import { uploadMiddleware, UploadMiddleware } from '../middlewares/index.js';

const router = express.Router();

// Error handling middleware for file uploads
const uploadErrorHandler = UploadMiddleware.handleUploadError;

// Single file upload routes
router.post(
  '/upload/single', 
  uploadMiddleware.uploadSingleFile('file'),
  uploadErrorHandler,
  fileController.uploadSingleFile
);

// Multiple files upload route
router.post(
  '/upload/multiple', 
  uploadMiddleware.uploadMultipleFiles('files', 10), // Allow up to 10 files
  uploadErrorHandler,
  fileController.uploadMultipleFiles
);

// Multi-field upload route
router.post(
  '/upload/fields',
  uploadMiddleware.uploadMultiFields([
    { name: 'avatar', maxCount: 1 },
    { name: 'gallery', maxCount: 5 },
    { name: 'documents', maxCount: 3 }
  ]),
  uploadErrorHandler,
  fileController.uploadMultiFieldFiles
);

// Specific file type upload routes
router.post(
  '/upload/image',
  uploadMiddleware.uploadSingleImage('image'),
  uploadErrorHandler,
  fileController.uploadSingleFile
);

router.post(
  '/upload/images',
  uploadMiddleware.uploadMultipleImages('images', 5),
  uploadErrorHandler,
  fileController.uploadMultipleFiles
);

router.post(
  '/upload/document',
  uploadMiddleware.uploadSingleDocument('document'),
  uploadErrorHandler,
  fileController.uploadSingleFile
);

router.post(
  '/upload/documents',
  uploadMiddleware.uploadMultipleDocuments('documents', 5),
  uploadErrorHandler,
  fileController.uploadMultipleFiles
);

// Delete file route
router.delete('/delete', fileController.deleteFile);

export default router;
