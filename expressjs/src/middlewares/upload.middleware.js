import FileUploadHandler from '../utils/file-upload.js';

/**
 * Middleware factory for file uploads
 */
class UploadMiddleware {
  /**
   * Creates upload middleware for different file types
   * @param {Object} options - Configuration options
   * @returns {Object} - Object containing middleware functions for different file types
   */
  static createMiddleware(options = {}) {
    // Image upload handler
    const imageUploadHandler = new FileUploadHandler({
      destination: options.imageDestination || 'uploads/images',
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
      ],
      maxFileSize: options.imageMaxSize || 5 * 1024 * 1024 // 5MB
    });

    // Document upload handler
    const documentUploadHandler = new FileUploadHandler({
      destination: options.documentDestination || 'uploads/documents',
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv'
      ],
      maxFileSize: options.documentMaxSize || 10 * 1024 * 1024 // 10MB
    });

    // Video upload handler
    const videoUploadHandler = new FileUploadHandler({
      destination: options.videoDestination || 'uploads/videos',
      allowedTypes: [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv',
        'video/webm'
      ],
      maxFileSize: options.videoMaxSize || 100 * 1024 * 1024 // 100MB
    });

    // Audio upload handler
    const audioUploadHandler = new FileUploadHandler({
      destination: options.audioDestination || 'uploads/audio',
      allowedTypes: [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/aac'
      ],
      maxFileSize: options.audioMaxSize || 20 * 1024 * 1024 // 20MB
    });

    // General file upload handler (any file type)
    const generalUploadHandler = new FileUploadHandler({
      destination: options.generalDestination || 'uploads/general',
      allowedTypes: [], // Empty array means all types are allowed
      maxFileSize: options.generalMaxSize || 50 * 1024 * 1024 // 50MB
    });

    return {
      // Single file upload middlewares
      uploadSingleImage: imageUploadHandler.handleSingleUpload.bind(imageUploadHandler),
      uploadSingleDocument: documentUploadHandler.handleSingleUpload.bind(documentUploadHandler),
      uploadSingleVideo: videoUploadHandler.handleSingleUpload.bind(videoUploadHandler),
      uploadSingleAudio: audioUploadHandler.handleSingleUpload.bind(audioUploadHandler),
      uploadSingleFile: generalUploadHandler.handleSingleUpload.bind(generalUploadHandler),

      // Multiple file upload middlewares
      uploadMultipleImages: imageUploadHandler.handleMultipleUpload.bind(imageUploadHandler),
      uploadMultipleDocuments: documentUploadHandler.handleMultipleUpload.bind(documentUploadHandler),
      uploadMultipleVideos: videoUploadHandler.handleMultipleUpload.bind(videoUploadHandler),
      uploadMultipleAudio: audioUploadHandler.handleMultipleUpload.bind(audioUploadHandler),
      uploadMultipleFiles: generalUploadHandler.handleMultipleUpload.bind(generalUploadHandler),

      // Multi-field upload middleware
      uploadMultiFields: generalUploadHandler.handleMultiFieldUpload.bind(generalUploadHandler),

      // File processors
      processImageFiles: imageUploadHandler.processUploadedFiles.bind(imageUploadHandler),
      processDocumentFiles: documentUploadHandler.processUploadedFiles.bind(documentUploadHandler),
      processVideoFiles: videoUploadHandler.processUploadedFiles.bind(videoUploadHandler),
      processAudioFiles: audioUploadHandler.processUploadedFiles.bind(audioUploadHandler),
      processFiles: generalUploadHandler.processUploadedFiles.bind(generalUploadHandler),

      // File deletion
      deleteImageFile: imageUploadHandler.deleteFile.bind(imageUploadHandler),
      deleteDocumentFile: documentUploadHandler.deleteFile.bind(documentUploadHandler),
      deleteVideoFile: videoUploadHandler.deleteFile.bind(videoUploadHandler),
      deleteAudioFile: audioUploadHandler.deleteFile.bind(audioUploadHandler),
      deleteFile: generalUploadHandler.deleteFile.bind(generalUploadHandler),

      // Original handlers (for advanced usage)
      handlers: {
        imageUploadHandler,
        documentUploadHandler,
        videoUploadHandler,
        audioUploadHandler,
        generalUploadHandler
      }
    };
  }

  /**
   * Error handling middleware for file uploads
   * @param {Error} err - Error object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      // Multer error
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'File too large'
        });
      }
      
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          status: 'error',
          message: 'Unexpected file field'
        });
      }
      
      return res.status(400).json({
        status: 'error',
        message: `Upload error: ${err.message}`
      });
    }
    
    if (err.message && err.message.includes('File type')) {
      // File type error
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
    
    // Pass to next error handler
    next(err);
  }
}

export default UploadMiddleware;
