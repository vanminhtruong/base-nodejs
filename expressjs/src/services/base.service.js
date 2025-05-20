/**
 * Base Service class that provides common business logic operations
 * All specific services should extend this class
 */
class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Get all records with optional query parameters
   * @param {Object} query - Query parameters
   * @returns {Promise<Array>} - Array of records
   */
  async getAll(query = {}) {
    return this.repository.findAll(query);
  }

  /**
   * Get one record by id
   * @param {number|string} id - Record id
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Found record
   */
  async getById(id, options = {}) {
    const record = await this.repository.findById(id, options);
    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }
    return record;
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} - Created record
   */
  async create(data) {
    return this.repository.create(data);
  }

  /**
   * Update a record by id
   * @param {number|string} id - Record id
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} - Updated record
   */
  async update(id, data) {
    return this.repository.update(id, data);
  }

  /**
   * Delete a record by id
   * @param {number|string} id - Record id
   * @returns {Promise<boolean>} - Deletion result
   */
  async delete(id) {
    return this.repository.delete(id);
  }
}

export default BaseService;
