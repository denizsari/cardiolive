/**
 * Standardized API response handler
 */

class ResponseHandler {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {*} data - Data to send
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data = null, message = 'İşlem başarılı', statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    // Remove null/undefined data to keep response clean
    if (data === null || data === undefined) {
      delete response.data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 400)
   * @param {*} error - Additional error details (only in development)
   */
  static error(res, message = 'Bir hata oluştu', statusCode = 400, error = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    // Include error details only in development
    if (process.env.NODE_ENV === 'development' && error) {
      response.error = error;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Array of data
   * @param {Object} pagination - Pagination info
   * @param {string} message - Success message
   */
  static paginated(res, data, pagination, message = 'Veriler başarıyla getirildi') {
    const response = {
      success: true,
      message,
      data,
      pagination: {
        currentPage: parseInt(pagination.page) || 1,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        totalItems: pagination.total,
        limit: parseInt(pagination.limit) || 10,
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {Array} errors - Array of validation errors
   */
  static validationError(res, errors) {
    const response = {
      success: false,
      message: 'Doğrulama hatası',
      errors: Array.isArray(errors) ? errors : [errors],
      timestamp: new Date().toISOString()
    };

    return res.status(422).json(response);
  }

  /**
   * Send unauthorized error
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static unauthorized(res, message = 'Yetkiniz bulunmuyor') {
    return this.error(res, message, 401);
  }

  /**
   * Send forbidden error
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static forbidden(res, message = 'Bu işlem için yetkiniz bulunmuyor') {
    return this.error(res, message, 403);
  }
  /**
   * Send not found error
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static notFound(res, message = 'İstenen kaynak bulunamadı') {
    return this.error(res, message, 404);
  }

  /**
   * Send bad request error
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {*} data - Additional error data
   */
  static badRequest(res, message = 'Geçersiz istek', data = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (data) {
      response.data = data;
    }

    return res.status(400).json(response);
  }

  /**
   * Send too many requests error (rate limit)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static tooManyRequests(res, message = 'Çok fazla istek gönderildi') {
    return this.error(res, message, 429);
  }

  /**
   * Send rate limit error (alias for tooManyRequests)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static rateLimit(res, message = 'Çok fazla istek gönderildi') {
    return this.tooManyRequests(res, message);
  }

  /**
   * Send server error
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {*} error - Error details
   */
  static serverError(res, message = 'Sunucu hatası', error = null) {
    return this.error(res, message, 500, error);
  }
}

module.exports = ResponseHandler;
