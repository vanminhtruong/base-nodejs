import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base class for handling file uploads
 */
class FileUploadHandler {
  /**
   * Creates a new FileUploadHandler instance
   * @param {Object} options - Configuration options
   * @param {string} options.destination - Upload destination directory
   * @param {Array<string>} options.allowedTypes - Allowed MIME types
   * @param {number} options.maxFileSize - Maximum file size in bytes
   */
  constructor(options = {}) {
    this.destination = options.destination || 'uploads/';
    this.allowedTypes = options.allowedTypes || [];
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5MB default
    
    // Create destination directory if it doesn't exist
    this._createDestinationIfNotExists();
    
    // Configure multer storage
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.destination);
      },
      filename: (req, file, cb) => {
        const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueFileName);
      }
    });
    
    // Configure file filter
    this.fileFilter = (req, file, cb) => {
      if (this.allowedTypes.length === 0 || this.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} is not allowed`), false);
      }
    };
    
    // Create multer upload instance
    this.upload = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.maxFileSize
      }
    });
  }
  
  /**
   * Creates the destination directory if it doesn't exist
   * @private
   */
  _createDestinationIfNotExists() {
    if (!fs.existsSync(this.destination)) {
      fs.mkdirSync(this.destination, { recursive: true });
    }
  }
  
  /**
   * Handles single file upload
   * @param {string} fieldName - Name of the form field
   * @returns {Function} - Express middleware for handling single file upload
   */
  handleSingleUpload(fieldName) {
    return this.upload.single(fieldName);
  }
  
  /**
   * Handles multiple file uploads for a single field
   * @param {string} fieldName - Name of the form field
   * @param {number} maxCount - Maximum number of files
   * @returns {Function} - Express middleware for handling multiple file uploads
   */
  handleMultipleUpload(fieldName, maxCount = 10) {
    return this.upload.array(fieldName, maxCount);
  }
  
  /**
   * Handles multiple file uploads for multiple fields
   * @param {Array<Object>} fields - Array of field configurations
   * @returns {Function} - Express middleware for handling multiple file uploads
   * @example
   * // Example fields configuration
   * [
   *   { name: 'avatar', maxCount: 1 },
   *   { name: 'gallery', maxCount: 5 }
   * ]
   */
  handleMultiFieldUpload(fields) {
    return this.upload.fields(fields);
  }
  
  /**
   * Processes uploaded files and returns file information
   * @param {Object|Array} files - Uploaded file(s) from multer
   * @returns {Object|Array} - Processed file information
   */
  processUploadedFiles(files) {
    if (!files) return null;
    
    // Handle single file
    if (!Array.isArray(files) && files.filename) {
      return this._processFile(files);
    }
    
    // Handle array of files
    if (Array.isArray(files)) {
      return files.map(file => this._processFile(file));
    }
    
    // Handle multiple fields with files
    const processedFiles = {};
    for (const [fieldName, fieldFiles] of Object.entries(files)) {
      processedFiles[fieldName] = Array.isArray(fieldFiles)
        ? fieldFiles.map(file => this._processFile(file))
        : this._processFile(fieldFiles);
    }
    
    return processedFiles;
  }
  
  /**
   * Process a single file and return file information
   * @param {Object} file - File object from multer
   * @returns {Object} - Processed file information
   * @private
   */
  _processFile(file) {
    return {
      originalName: file.originalname,
      fileName: file.filename,
      filePath: `${this.destination}/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype
    };
  }
  
  /**
   * Deletes a file from the filesystem
   * @param {string} filePath - Path to the file
   * @returns {Promise<boolean>} - True if file was deleted, false otherwise
   */
  async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      return false;
    }
  }
}

export default FileUploadHandler;
