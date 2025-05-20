import BaseController from './base.controller.js';
import { uploadMiddleware } from '../middlewares/index.js';

/**
 * File Controller for handling file upload operations
 * Extends the BaseController to inherit common response methods
 */
class FileController extends BaseController {
  constructor() {
    super();
    // Bind methods to ensure 'this' refers to FileController instance
    this.uploadSingleFile = this.catchAsync(this.uploadSingleFile.bind(this));
    this.uploadMultipleFiles = this.catchAsync(this.uploadMultipleFiles.bind(this));
    this.uploadMultiFieldFiles = this.catchAsync(this.uploadMultiFieldFiles.bind(this));
    this.deleteFile = this.catchAsync(this.deleteFile.bind(this));
  }

  /**
   * Upload a single file
   * Note: This method should be used after the upload middleware
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadSingleFile(req, res) {
    if (!req.file) {
      return this.sendError(res, 'No file uploaded', 400);
    }

    const fileInfo = uploadMiddleware.processFiles(req.file);
    
    this.sendSuccess(res, {
      message: 'File uploaded successfully',
      file: fileInfo
    }, 201);
  }

  /**
   * Upload multiple files
   * Note: This method should be used after the upload middleware
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadMultipleFiles(req, res) {
    if (!req.files || req.files.length === 0) {
      return this.sendError(res, 'No files uploaded', 400);
    }

    const filesInfo = uploadMiddleware.processFiles(req.files);
    
    this.sendSuccess(res, {
      message: `${req.files.length} files uploaded successfully`,
      files: filesInfo
    }, 201);
  }

  /**
   * Upload files from multiple fields
   * Note: This method should be used after the upload middleware
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadMultiFieldFiles(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return this.sendError(res, 'No files uploaded', 400);
    }

    const filesInfo = uploadMiddleware.processFiles(req.files);
    
    this.sendSuccess(res, {
      message: 'Files uploaded successfully',
      files: filesInfo
    }, 201);
  }

  /**
   * Delete a file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteFile(req, res) {
    const { filePath } = req.body;
    
    if (!filePath) {
      return this.sendError(res, 'File path is required', 400);
    }

    const deleted = await uploadMiddleware.deleteFile(filePath);
    
    if (!deleted) {
      return this.sendError(res, 'File not found or could not be deleted', 404);
    }
    
    this.sendSuccess(res, {
      message: 'File deleted successfully'
    });
  }
}

const fileController = new FileController();
export default fileController;
