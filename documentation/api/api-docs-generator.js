#!/usr/bin/env node

/**
 * Comprehensive API Documentation Generator for Cardiolive
 * Swagger/OpenAPI 3.0 specification generator
 * 
 * Features:
 * - Auto-generates OpenAPI 3.0 specification
 * - Interactive Swagger UI
 * - API endpoint documentation
 * - Request/response schemas
 * - Authentication documentation
 * - API testing interface
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs').promises;
const path = require('path');

// OpenAPI 3.0 Specification
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cardiolive E-Commerce API',
      version: '1.0.0',
      description: `
        Comprehensive API documentation for the Cardiolive e-commerce platform.
        
        This API provides endpoints for:
        - User authentication and management        - Product catalog and management
        - Order processing and tracking
        - Review and rating system
        - Blog content management
        - Payment processing
        - Administrative functions
        
        ## Authentication
        Most endpoints require JWT authentication. Include the token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ## Rate Limiting
        API requests are rate-limited to prevent abuse:
        - General endpoints: 1000 requests per 15 minutes
        - Authentication endpoints: 20 requests per 15 minutes
        - Admin endpoints: 100 requests per 15 minutes
        
        ## Error Handling
        All endpoints return standardized error responses with appropriate HTTP status codes.
      `,
      contact: {
        name: 'Cardiolive Support',
        email: 'support@cardiolive.com',
        url: 'https://cardiolive.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.cardiolive.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/users/login'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for service-to-service communication'
        }
      },
      schemas: {
        // Base response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data (varies by endpoint)'
            },
            pagination: {
              $ref: '#/components/schemas/Pagination'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          },
          required: ['success']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message describing what went wrong'
            },
            error: {
              type: 'object',
              description: 'Detailed error information'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          },
          required: ['success', 'message']
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              example: 1
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              example: 10
            },
            total: {
              type: 'integer',
              minimum: 0,
              example: 150
            },
            totalPages: {
              type: 'integer',
              minimum: 0,
              example: 15
            },
            hasNext: {
              type: 'boolean',
              example: true
            },
            hasPrev: {
              type: 'boolean',
              example: false
            }
          }
        },
        
        // User schemas
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'objectid',
              example: '507f1f77bcf86cd799439011'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'user'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        UserRegistration: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'John'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'SecurePassword123!'
            }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              example: 'SecurePassword123!'
            }
          }
        },
        
        // Product schemas
        Product: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'objectid',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Premium Heart Monitor'
            },
            slug: {
              type: 'string',
              example: 'premium-heart-monitor'
            },
            description: {
              type: 'string',
              example: 'Advanced heart monitoring device with real-time tracking'
            },
            shortDescription: {
              type: 'string',
              example: 'Advanced heart monitoring device'
            },
            price: {
              type: 'number',
              format: 'decimal',
              example: 299.99
            },
            originalPrice: {
              type: 'number',
              format: 'decimal',
              example: 399.99
            },
            category: {
              type: 'string',
              example: 'Medical Devices'
            },
            subcategory: {
              type: 'string',
              example: 'Heart Monitors'
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              },
              example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Real-time monitoring', 'Bluetooth connectivity', 'Mobile app integration']
            },
            specifications: {
              type: 'object',
              example: {
                'Battery Life': '7 days',
                'Water Resistance': 'IPX7',
                'Connectivity': 'Bluetooth 5.0'
              }
            },
            stock: {
              type: 'integer',
              minimum: 0,
              example: 50
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            isFeatured: {
              type: 'boolean',
              example: false
            },
            averageRating: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              maximum: 5,
              example: 4.5
            },
            reviewCount: {
              type: 'integer',
              minimum: 0,
              example: 23
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        
        // Order schemas
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'objectid',
              example: '507f1f77bcf86cd799439011'
            },
            orderNumber: {
              type: 'string',
              example: 'ORD-2024-001234'
            },
            userId: {
              type: 'string',
              format: 'objectid',
              example: '507f1f77bcf86cd799439012'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem'
              }
            },
            subtotal: {
              type: 'number',
              format: 'decimal',
              example: 299.99
            },
            tax: {
              type: 'number',
              format: 'decimal',
              example: 24.00
            },
            shipping: {
              type: 'number',
              format: 'decimal',
              example: 15.00
            },
            total: {
              type: 'number',
              format: 'decimal',
              example: 338.99
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
              example: 'confirmed'
            },
            shippingAddress: {
              $ref: '#/components/schemas/Address'
            },
            billingAddress: {
              $ref: '#/components/schemas/Address'
            },
            paymentMethod: {
              type: 'string',
              example: 'credit_card'
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
              example: 'completed'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              format: 'objectid',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Premium Heart Monitor'
            },
            price: {
              type: 'number',
              format: 'decimal',
              example: 299.99
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              example: 1
            },
            total: {
              type: 'number',
              format: 'decimal',
              example: 299.99
            }
          }
        },
        Address: {
          type: 'object',
          properties: {
            street: {
              type: 'string',
              example: '123 Main Street'
            },
            city: {
              type: 'string',
              example: 'New York'
            },
            state: {
              type: 'string',
              example: 'NY'
            },
            zipCode: {
              type: 'string',
              example: '10001'
            },
            country: {
              type: 'string',
              example: 'United States'
            }
          }
        },
        
        // Review schemas
        Review: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'objectid',
              example: '507f1f77bcf86cd799439011'
            },
            productId: {
              type: 'string',
              format: 'objectid',
              example: '507f1f77bcf86cd799439012'
            },
            userId: {
              type: 'string',
              format: 'objectid',
              example: '507f1f77bcf86cd799439013'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              example: 5
            },
            title: {
              type: 'string',
              example: 'Excellent product!'
            },
            comment: {
              type: 'string',
              example: 'This heart monitor works perfectly and is very user-friendly.'
            },
            isVerifiedPurchase: {
              type: 'boolean',
              example: true
            },
            helpfulVotes: {
              type: 'integer',
              minimum: 0,
              example: 5
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              example: 'approved'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Sort field and direction (e.g., "name:asc", "createdAt:desc")',
          required: false,
          schema: {
            type: 'string',
            example: 'createdAt:desc'
          }
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search term for filtering results',
          required: false,
          schema: {
            type: 'string',
            example: 'heart monitor'
          }
        }
      },
      responses: {
        Success: {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse'
              }
            }
          }
        },
        BadRequest: {
          description: 'Bad request - Invalid input',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Invalid input data',
                error: {
                  details: 'Email is required'
                },
                timestamp: '2024-01-15T10:30:00Z'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Unauthorized - Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Authentication required',
                timestamp: '2024-01-15T10:30:00Z'
              }
            }
          }
        },
        Forbidden: {
          description: 'Forbidden - Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Insufficient permissions',
                timestamp: '2024-01-15T10:30:00Z'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Resource not found',
                timestamp: '2024-01-15T10:30:00Z'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Internal server error',
                timestamp: '2024-01-15T10:30:00Z'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Products',
        description: 'Product catalog and management endpoints'
      },
      {
        name: 'Orders',
        description: 'Order processing and management endpoints'
      },
      {
        name: 'Reviews',
        description: 'Product review and rating endpoints'      },
      {
        name: 'Blog',
        description: 'Blog content management endpoints'
      },
      {
        name: 'Payments',
        description: 'Payment processing endpoints'
      },
      {
        name: 'Settings',
        description: 'Application settings management endpoints'
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints'
      }
    ]
  },
  apis: [
    './backend/src/routes/*.js',
    './backend/src/controllers/*.js',
    './documentation/api/**/*.js'
  ]
};

// Generate OpenAPI specification
const generateApiDocs = () => {
  return swaggerJsdoc(swaggerOptions);
};

// Custom Swagger UI configuration
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestSnippetsEnabled: true,
    requestSnippets: {
      generators: {
        'curl_bash': {
          title: 'cURL (bash)',
          syntax: 'bash'
        },
        'javascript_fetch': {
          title: 'JavaScript (fetch)',
          syntax: 'javascript'
        },
        'node_native': {
          title: 'Node.js (native)',
          syntax: 'javascript'
        },
        'python_requests': {
          title: 'Python (requests)',
          syntax: 'python'
        }
      },
      defaultExpanded: false,
      languages: ['curl_bash', 'javascript_fetch', 'node_native', 'python_requests']
    }
  },
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 50px 0; }
    .swagger-ui .info hgroup.main { margin: 0 0 20px 0; }
    .swagger-ui .info h1 { color: #3b82f6; }
    .swagger-ui .info .description { color: #6b7280; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
  `,
  customSiteTitle: 'Cardiolive API Documentation',
  customfavIcon: '/favicon.ico'
};

// API Documentation Generator
const createApiDocumentation = async () => {
  const spec = generateApiDocs();
  
  // Save specification to file
  const docsDir = path.join(__dirname, 'generated');
  await fs.mkdir(docsDir, { recursive: true });
  
  await fs.writeFile(
    path.join(docsDir, 'openapi.json'),
    JSON.stringify(spec, null, 2)
  );
  
  await fs.writeFile(
    path.join(docsDir, 'openapi.yaml'),
    require('js-yaml').dump(spec)
  );
  
  return spec;
};

// Setup API documentation middleware
const setupApiDocs = async (app) => {
  console.log('[Docs] Setting up API documentation...');
  
  try {
    const spec = await createApiDocumentation();
    
    // Serve OpenAPI specification
    app.get('/api/docs/openapi.json', (req, res) => {
      res.json(spec);
    });
    
    // Serve Swagger UI
    app.use('/api/docs', swaggerUi.serve);
    app.get('/api/docs', swaggerUi.setup(spec, swaggerUiOptions));
    
    // Alternative documentation endpoints
    app.get('/docs', (req, res) => {
      res.redirect('/api/docs');
    });
    
    app.get('/api-docs', (req, res) => {
      res.redirect('/api/docs');
    });
    
    console.log('[Docs] API documentation available at /api/docs');
  } catch (error) {
    console.error('[Docs] Failed to setup API documentation:', error);
  }
};

// API documentation stats endpoint
const getDocsStats = (req, res) => {
  const spec = generateApiDocs();
  
  const stats = {
    title: spec.info.title,
    version: spec.info.version,
    endpoints: Object.keys(spec.paths || {}).length,
    schemas: Object.keys(spec.components?.schemas || {}).length,
    tags: (spec.tags || []).length,
    servers: spec.servers.length,
    lastGenerated: new Date().toISOString()
  };
  
  const ResponseHandler = require('../../backend/src/utils/responseHandler');
  ResponseHandler.success(res, 'API documentation stats retrieved', stats);
};

module.exports = {
  generateApiDocs,
  setupApiDocs,
  createApiDocumentation,
  getDocsStats,
  swaggerOptions,
  swaggerUiOptions
};
