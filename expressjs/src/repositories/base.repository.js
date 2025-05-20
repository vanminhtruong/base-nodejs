/**
 * Base Repository class that provides common CRUD operations
 * All specific repositories should extend this class
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Find all records with optional query parameters
   * @param {Object} query - Query parameters
   * @returns {Promise<Array>} - Array of records
   */
  async findAll(query = {}) {
    return this.model.findAll(query);
  }

  /**
   * Find one record by id
   * @param {number|string} id - Record id
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Found record
   */
  async findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  /**
   * Find one record by custom query
   * @param {Object} query - Query parameters
   * @returns {Promise<Object>} - Found record
   */
  async findOne(query) {
    return this.model.findOne(query);
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} - Created record
   */
  async create(data) {
    return this.model.create(data);
  }

  /**
   * Update a record by id
   * @param {number|string} id - Record id
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} - Updated record
   */
  async update(id, data) {
    const record = await this.findById(id);
    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }
    return record.update(data);
  }

  /**
   * Delete a record by id
   * @param {number|string} id - Record id
   * @returns {Promise<boolean>} - Deletion result
   */
  async delete(id) {
    const record = await this.findById(id);
    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }
    await record.destroy();
    return true;
  }

  /**
   * Count records with optional query parameters
   * @param {Object} query - Query parameters
   * @returns {Promise<number>} - Count of records
   */
  async count(query = {}) {
    return this.model.count(query);
  }
}

export default BaseRepository;
