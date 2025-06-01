/**
 * Base Service Class
 * Provides common functionality for all service classes
 * @class BaseService
 */
class BaseService {
  /**
   * Create a new BaseService instance
   * @param {Object} model - Mongoose model
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Find all documents with pagination and filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (page, limit, sort, populate)
   * @returns {Promise<Object>} Paginated results
   */
  async findAll(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      populate = [],
      select = null
    } = options;

    const skip = (page - 1) * limit;
    
    let query = this.model.find(filter);
    
    if (select) query = query.select(select);
    if (populate.length > 0) {
      populate.forEach(pop => query = query.populate(pop));
    }
    
    const [documents, total] = await Promise.all([
      query.sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(filter)
    ]);

    return {
      documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit: parseInt(limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  /**
   * Find document by ID
   * @param {string} id - Document ID
   * @param {Object} options - Query options (populate, select)
   * @returns {Promise<Object|null>} Document or null
   */
  async findById(id, options = {}) {
    const { populate = [], select = null } = options;
    
    let query = this.model.findById(id);
    
    if (select) query = query.select(select);
    if (populate.length > 0) {
      populate.forEach(pop => query = query.populate(pop));
    }
    
    return await query;
  }

  /**
   * Find one document by filter
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (populate, select)
   * @returns {Promise<Object|null>} Document or null
   */
  async findOne(filter, options = {}) {
    const { populate = [], select = null } = options;
    
    let query = this.model.findOne(filter);
    
    if (select) query = query.select(select);
    if (populate.length > 0) {
      populate.forEach(pop => query = query.populate(pop));
    }
    
    return await query;
  }

  /**
   * Create a new document
   * @param {Object} data - Document data
   * @returns {Promise<Object>} Created document
   */
  async create(data) {
    return await this.model.create(data);
  }

  /**
   * Update document by ID
   * @param {string} id - Document ID
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated document or null
   */
  async updateById(id, data, options = { new: true, runValidators: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  /**
   * Delete document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} Deleted document or null
   */
  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  /**
   * Count documents by filter
   * @param {Object} filter - MongoDB filter object
   * @returns {Promise<number>} Document count
   */
  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }

  /**
   * Check if document exists
   * @param {Object} filter - MongoDB filter object
   * @returns {Promise<boolean>} True if exists
   */
  async exists(filter) {
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }
  /**
   * Aggregate data
   * @param {Array} pipeline - Aggregation pipeline
   * @returns {Promise<Array>} Aggregation results
   */
  async aggregate(pipeline) {
    return await this.model.aggregate(pipeline);
  }

  /**
   * Aggregate data with pagination
   * @param {Array} pipeline - Aggregation pipeline
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated aggregation results
   */
  async aggregatePaginate(pipeline, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 }
    } = options;

    const skip = (page - 1) * limit;
    
    // Add pagination stages to pipeline
    const paginationPipeline = [
      ...pipeline,
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ];

    // Get total count
    const countPipeline = [
      ...pipeline,
      { $count: "totalItems" }
    ];

    const [data, countResult] = await Promise.all([
      this.model.aggregate(paginationPipeline),
      this.model.aggregate(countPipeline)
    ]);

    const totalItems = countResult[0]?.totalItems || 0;

    return {
      data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        limit: parseInt(limit),
        hasNext: page < Math.ceil(totalItems / limit),
        hasPrev: page > 1
      }
    };
  }
}

module.exports = BaseService;
