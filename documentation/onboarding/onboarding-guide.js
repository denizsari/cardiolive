#!/usr/bin/env node

/**
 * Developer Onboarding Guide Generator for Cardiolive
 * Comprehensive setup and development documentation
 * 
 * Features:
 * - Interactive setup guide
 * - Development environment configuration
 * - Code examples and snippets
 * - Testing instructions
 * - Deployment guides
 * - Troubleshooting help
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const ResponseHandler = require('../../backend/src/utils/responseHandler');

// Onboarding guide content
const ONBOARDING_CONTENT = {
  welcome: {
    title: 'Welcome to Cardiolive Development Team! 🎉',
    description: 'This comprehensive guide will help you get up and running with the Cardiolive e-commerce platform.',
    quickStart: {
      timeEstimate: '30-45 minutes',
      prerequisites: [
        'Node.js 18+ installed',
        'MongoDB 6+ installed or access to MongoDB Atlas',
        'Git installed',
        'Code editor (VS Code recommended)',
        'Basic knowledge of JavaScript, React, and Node.js'
      ]
    }
  },
  
  projectOverview: {
    title: 'Project Overview 📋',
    architecture: {
      frontend: {
        technology: 'Next.js 15 with TypeScript',
        styling: 'Tailwind CSS',
        stateManagement: 'React Query + Context API',
        location: './frontend/'
      },
      backend: {
        technology: 'Node.js with Express.js',
        database: 'MongoDB with Mongoose',
        authentication: 'JWT with refresh tokens',
        location: './backend/'
      },
      infrastructure: {
        containerization: 'Docker & Docker Compose',
        reverseProxy: 'Nginx',
        monitoring: 'Prometheus + Grafana',
        cicd: 'GitHub Actions'
      }
    },    features: [
      'User authentication and authorization',
      'Product catalog with categories and filtering',
      'Shopping cart and checkout process',
      'Order management and tracking',
      'Review and rating system',
      'Blog content management',
      'Admin dashboard',
      'Payment processing integration',
      'Real-time notifications'
    ]
  },
  
  setupInstructions: {
    title: 'Development Environment Setup 🛠️',
    steps: [
      {
        step: 1,
        title: 'Clone the Repository',
        commands: [
          'git clone https://github.com/your-org/cardiolive.git',
          'cd cardiolive'
        ],
        description: 'Clone the repository and navigate to the project directory.'
      },
      {
        step: 2,
        title: 'Install Dependencies',
        commands: [
          '# Install backend dependencies',
          'cd backend',
          'npm install',
          '',
          '# Install frontend dependencies',
          'cd ../frontend',
          'npm install',
          '',
          '# Return to root directory',
          'cd ..'
        ],
        description: 'Install all required dependencies for both frontend and backend.'
      },
      {
        step: 3,
        title: 'Environment Configuration',
        commands: [
          '# Copy environment templates',
          'cp backend/.env.example backend/.env',
          'cp frontend/.env.example frontend/.env'
        ],
        description: 'Set up environment variables for local development.',
        envVariables: {
          backend: {
            'NODE_ENV': 'development',
            'PORT': '5000',
            'MONGO_URI': 'mongodb://localhost:27017/cardiolive',
            'JWT_SECRET': 'your-super-secret-jwt-key-here',
            'JWT_REFRESH_SECRET': 'your-super-secret-refresh-key-here',
            'FRONTEND_URL': 'http://localhost:3000'
          },
          frontend: {
            'NEXT_PUBLIC_API_URL': 'http://localhost:5000',
            'NEXT_PUBLIC_APP_NAME': 'Cardiolive',
            'NEXT_PUBLIC_APP_VERSION': '1.0.0'
          }
        }
      },
      {
        step: 4,
        title: 'Database Setup',
        commands: [
          '# Start MongoDB (if running locally)',
          'mongod',
          '',
          '# Or use Docker',
          'docker run -d -p 27017:27017 --name cardiolive-mongo mongo:6',
          '',
          '# Run database migrations',
          'cd backend',
          'npm run migrate'
        ],
        description: 'Set up and initialize the MongoDB database.'
      },
      {
        step: 5,
        title: 'Start Development Servers',
        commands: [
          '# Terminal 1: Start backend server',
          'cd backend',
          'npm run dev',
          '',
          '# Terminal 2: Start frontend server',
          'cd frontend',
          'npm run dev'
        ],
        description: 'Start both backend and frontend development servers.',
        ports: {
          backend: 'http://localhost:5000',
          frontend: 'http://localhost:3000',
          docs: 'http://localhost:5000/api/docs'
        }
      }
    ]
  },
  
  developmentWorkflow: {
    title: 'Development Workflow 🔄',
    gitWorkflow: {
      branching: [
        'main - Production-ready code',
        'develop - Integration branch for features',
        'feature/* - Individual feature branches',
        'hotfix/* - Critical bug fixes',
        'release/* - Preparation for releases'
      ],
      process: [
        '1. Create feature branch from develop',
        '2. Make your changes and commit frequently',
        '3. Write tests for new functionality',
        '4. Run linting and formatting',
        '5. Push branch and create pull request',
        '6. Request code review',
        '7. Merge after approval and CI passes'
      ]
    },
    codeQuality: {
      linting: 'ESLint with strict rules',
      formatting: 'Prettier with consistent configuration',
      preCommitHooks: 'Husky + lint-staged',
      testing: 'Jest for unit tests, Cypress for E2E'
    }
  },
  
  apiReference: {
    title: 'API Reference 📚',
    baseUrl: 'http://localhost:5000/api',
    documentation: 'http://localhost:5000/api/docs',
    authentication: {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>',
      endpoints: {
        login: 'POST /api/users/login',
        register: 'POST /api/users/register',
        refresh: 'POST /api/users/refresh-token'
      }
    },
    mainEndpoints: [
      {
        category: 'Users',
        baseUrl: '/api/users',
        endpoints: [
          'GET /me - Get current user profile',
          'PUT /profile - Update user profile',
          'PUT /change-password - Change password'
        ]
      },
      {
        category: 'Products',
        baseUrl: '/api/products',
        endpoints: [
          'GET / - List products with filtering',
          'GET /:id - Get single product',
          'POST / - Create product (admin)',
          'PUT /:id - Update product (admin)'
        ]
      },
      {
        category: 'Orders',
        baseUrl: '/api/orders',
        endpoints: [
          'POST / - Create new order',
          'GET / - Get user orders',
          'GET /:id - Get single order',
          'PATCH /:id/cancel - Cancel order'
        ]
      }
    ]
  },
  
  testing: {
    title: 'Testing Guide 🧪',
    types: {
      unit: {
        tool: 'Jest',
        location: '**/*.test.js',
        command: 'npm test',
        coverage: 'npm run test:coverage'
      },
      integration: {
        tool: 'Supertest + Jest',
        location: 'backend/tests/integration/',
        command: 'npm run test:integration'
      },
      e2e: {
        tool: 'Cypress',
        location: 'cypress/e2e/',
        command: 'npm run test:e2e'
      }
    },
    examples: {
      unit: `
// Example unit test
describe('User Service', () => {
  test('should create user with valid data', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'SecurePass123!'
    };
    
    const user = await userService.createUser(userData);
    expect(user.email).toBe(userData.email);
    expect(user.password).not.toBe(userData.password); // Should be hashed
  });
});`,
      integration: `
// Example integration test
describe('POST /api/users/register', () => {
  test('should register new user', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      });
      
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('john@example.com');
  });
});`
    }
  },
  
  deployment: {
    title: 'Deployment Guide 🚀',
    environments: {
      development: {
        description: 'Local development environment',
        setup: 'npm run dev',
        database: 'Local MongoDB or Docker'
      },
      staging: {
        description: 'Testing environment that mirrors production',
        setup: 'Docker Compose with staging configuration',
        database: 'MongoDB Atlas (staging cluster)'
      },
      production: {
        description: 'Live production environment',
        setup: 'Docker containers with Nginx reverse proxy',
        database: 'MongoDB Atlas (production cluster)'
      }
    },
    docker: {
      commands: [
        '# Build and start all services',
        'docker-compose up -d',
        '',
        '# View logs',
        'docker-compose logs -f',
        '',
        '# Stop services',
        'docker-compose down',
        '',
        '# Rebuild after changes',
        'docker-compose up -d --build'
      ]
    }
  },
  
  troubleshooting: {
    title: 'Troubleshooting 🔧',
    common: [
      {
        issue: 'Cannot connect to MongoDB',
        solutions: [
          'Ensure MongoDB is running (mongod)',
          'Check connection string in .env file',
          'Verify MongoDB port (default: 27017)',
          'Check firewall settings'
        ]
      },
      {
        issue: 'Frontend cannot reach backend API',
        solutions: [
          'Verify backend server is running on port 5000',
          'Check NEXT_PUBLIC_API_URL in frontend/.env',
          'Ensure CORS is properly configured',
          'Check for any proxy settings'
        ]
      },
      {
        issue: 'JWT token errors',
        solutions: [
          'Check JWT_SECRET in backend/.env',
          'Verify token format in Authorization header',
          'Ensure token is not expired',
          'Check token storage in frontend'
        ]
      },
      {
        issue: 'Build fails in Docker',
        solutions: [
          'Clear Docker cache: docker system prune',
          'Rebuild without cache: docker-compose build --no-cache',
          'Check Dockerfile syntax',
          'Verify all dependencies are listed in package.json'
        ]
      }
    ],
    logs: {
      backend: 'tail -f backend/logs/combined.log',
      frontend: 'Check browser console and terminal',
      docker: 'docker-compose logs -f [service-name]',
      nginx: 'docker exec nginx tail -f /var/log/nginx/error.log'
    }
  },
  
  resources: {
    title: 'Additional Resources 📖',
    links: [
      {
        title: 'API Documentation',
        url: '/api/docs',
        description: 'Interactive Swagger documentation'
      },
      {
        title: 'GitHub Repository',
        url: 'https://github.com/your-org/cardiolive',
        description: 'Source code and issue tracking'
      },
      {
        title: 'Team Wiki',
        url: 'https://github.com/your-org/cardiolive/wiki',
        description: 'Detailed project documentation'
      },
      {
        title: 'Slack Channel',
        url: '#cardiolive-dev',
        description: 'Team communication and support'
      }
    ],
    technologies: [
      {
        name: 'Next.js',
        url: 'https://nextjs.org/docs',
        description: 'React framework documentation'
      },
      {
        name: 'Express.js',
        url: 'https://expressjs.com/',
        description: 'Backend framework documentation'
      },
      {
        name: 'MongoDB',
        url: 'https://docs.mongodb.com/',
        description: 'Database documentation'
      },
      {
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com/docs',
        description: 'CSS framework documentation'
      }
    ]
  }
};

/**
 * Generate onboarding guide HTML
 */
const generateOnboardingHTML = (content) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cardiolive Developer Onboarding Guide</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border-radius: 12px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .section {
            background: white;
            margin-bottom: 2rem;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .section h2 {
            color: #1f2937;
            margin-bottom: 1rem;
            font-size: 1.8rem;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
        }
        
        .section h3 {
            color: #374151;
            margin: 1.5rem 0 1rem 0;
            font-size: 1.3rem;
        }
        
        .step {
            background: #f9fafb;
            border-left: 4px solid #3b82f6;
            padding: 1rem;
            margin: 1rem 0;
        }
        
        .step-number {
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 0.5rem;
        }
        
        .code-block {
            background: #1f2937;
            color: #f9fafb;
            padding: 1rem;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            margin: 1rem 0;
        }
        
        .env-vars {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 1rem;
            border-radius: 6px;
            margin: 1rem 0;
        }
        
        .env-vars h4 {
            color: #92400e;
            margin-bottom: 0.5rem;
        }
        
        .env-var {
            font-family: monospace;
            background: white;
            padding: 0.25rem 0.5rem;
            margin: 0.25rem 0;
            border-radius: 3px;
            display: block;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }
        
        .feature-card {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 6px;
            border-left: 3px solid #10b981;
        }
        
        .troubleshooting-item {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            padding: 1rem;
            border-radius: 6px;
            margin: 1rem 0;
        }
        
        .troubleshooting-item h4 {
            color: #dc2626;
            margin-bottom: 0.5rem;
        }
        
        .solution {
            background: white;
            padding: 0.5rem;
            margin: 0.25rem 0;
            border-radius: 3px;
            font-size: 0.9rem;
        }
        
        .resource-link {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            text-decoration: none;
            margin: 0.25rem 0.25rem 0.25rem 0;
            transition: background 0.2s;
        }
        
        .resource-link:hover {
            background: #1d4ed8;
        }
        
        .nav {
            position: sticky;
            top: 2rem;
            background: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .nav ul {
            list-style: none;
        }
        
        .nav a {
            color: #3b82f6;
            text-decoration: none;
            display: block;
            padding: 0.25rem 0;
        }
        
        .nav a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .feature-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${content.welcome.title}</h1>
            <p>${content.welcome.description}</p>
            <p><strong>Estimated Setup Time:</strong> ${content.welcome.quickStart.timeEstimate}</p>
        </div>
        
        <div class="nav">
            <h3>Quick Navigation</h3>
            <ul>
                <li><a href="#overview">Project Overview</a></li>
                <li><a href="#setup">Environment Setup</a></li>
                <li><a href="#workflow">Development Workflow</a></li>
                <li><a href="#api">API Reference</a></li>
                <li><a href="#testing">Testing Guide</a></li>
                <li><a href="#deployment">Deployment</a></li>
                <li><a href="#troubleshooting">Troubleshooting</a></li>
                <li><a href="#resources">Resources</a></li>
            </ul>
        </div>

        ${generateSectionHTML('overview', content.projectOverview)}
        ${generateSetupHTML('setup', content.setupInstructions)}
        ${generateWorkflowHTML('workflow', content.developmentWorkflow)}
        ${generateAPIHTML('api', content.apiReference)}
        ${generateTestingHTML('testing', content.testing)}
        ${generateDeploymentHTML('deployment', content.deployment)}
        ${generateTroubleshootingHTML('troubleshooting', content.troubleshooting)}
        ${generateResourcesHTML('resources', content.resources)}
    </div>
</body>
</html>`;
};

/**
 * Helper functions to generate HTML sections
 */
const generateSectionHTML = (id, content) => {
  return `
    <div id="${id}" class="section">
        <h2>${content.title}</h2>
        <div class="feature-grid">
            <div class="feature-card">
                <h4>Frontend</h4>
                <p><strong>Technology:</strong> ${content.architecture.frontend.technology}</p>
                <p><strong>Styling:</strong> ${content.architecture.frontend.styling}</p>
                <p><strong>State:</strong> ${content.architecture.frontend.stateManagement}</p>
            </div>
            <div class="feature-card">
                <h4>Backend</h4>
                <p><strong>Technology:</strong> ${content.architecture.backend.technology}</p>
                <p><strong>Database:</strong> ${content.architecture.backend.database}</p>
                <p><strong>Auth:</strong> ${content.architecture.backend.authentication}</p>
            </div>
            <div class="feature-card">
                <h4>Infrastructure</h4>
                <p><strong>Containers:</strong> ${content.architecture.infrastructure.containerization}</p>
                <p><strong>Proxy:</strong> ${content.architecture.infrastructure.reverseProxy}</p>
                <p><strong>Monitoring:</strong> ${content.architecture.infrastructure.monitoring}</p>
            </div>
        </div>
    </div>`;
};

const generateSetupHTML = (id, content) => {
  return `
    <div id="${id}" class="section">
        <h2>${content.title}</h2>
        ${content.steps.map(step => `
            <div class="step">
                <h3><span class="step-number">${step.step}</span>${step.title}</h3>
                <p>${step.description}</p>
                <div class="code-block">${step.commands.join('\n')}</div>
                ${step.envVariables ? generateEnvVarsHTML(step.envVariables) : ''}
                ${step.ports ? generatePortsHTML(step.ports) : ''}
            </div>
        `).join('')}
    </div>`;
};

const generateEnvVarsHTML = (envVars) => {
  return Object.entries(envVars).map(([env, vars]) => `
    <div class="env-vars">
        <h4>${env.toUpperCase()} Environment Variables:</h4>
        ${Object.entries(vars).map(([key, value]) => 
          `<code class="env-var">${key}=${value}</code>`
        ).join('')}
    </div>
  `).join('');
};

const generatePortsHTML = (ports) => {
  return `
    <div class="env-vars">
        <h4>Service URLs:</h4>
        ${Object.entries(ports).map(([service, url]) => 
          `<a href="${url}" class="resource-link" target="_blank">${service}: ${url}</a>`
        ).join('')}
    </div>`;
};

const generateWorkflowHTML = (id, content) => {
  return `
    <div id="${id}" class="section">
        <h2>${content.title}</h2>
        <h3>Git Workflow</h3>
        <ul>
            ${content.gitWorkflow.branching.map(branch => `<li>${branch}</li>`).join('')}
        </ul>
        <h3>Development Process</h3>
        <ol>
            ${content.gitWorkflow.process.map(step => `<li>${step}</li>`).join('')}
        </ol>
    </div>`;
};

const generateAPIHTML = (id, content) => {
  return `
    <div id="${id}" class="section">
        <h2>${content.title}</h2>
        <p><strong>Base URL:</strong> <code>${content.baseUrl}</code></p>
        <p><strong>Documentation:</strong> <a href="${content.documentation}" target="_blank">${content.documentation}</a></p>
        
        <h3>Authentication</h3>
        <p><strong>Type:</strong> ${content.authentication.type}</p>
        <div class="code-block">${content.authentication.header}</div>
        
        <h3>Main Endpoints</h3>
        ${content.mainEndpoints.map(category => `
            <div class="feature-card">
                <h4>${category.category}</h4>
                <p><strong>Base:</strong> <code>${category.baseUrl}</code></p>
                <ul>
                    ${category.endpoints.map(endpoint => `<li><code>${endpoint}</code></li>`).join('')}
                </ul>
            </div>
        `).join('')}
    </div>`;
};

const generateTestingHTML = (id, content) => {
  return `
    <div id="${id}" class="section">
        <h2>${content.title}</h2>
        <div class="feature-grid">
            ${Object.entries(content.types).map(([type, config]) => `
                <div class="feature-card">
                    <h4>${type.toUpperCase()} Tests</h4>
                    <p><strong>Tool:</strong> ${config.tool}</p>
                    <p><strong>Location:</strong> <code>${config.location}</code></p>
                    <p><strong>Command:</strong> <code>${config.command}</code></p>
                </div>
            `).join('')}
        </div>
        
        <h3>Example Tests</h3>
        <div class="code-block">${content.examples.unit}</div>
        <div class="code-block">${content.examples.integration}</div>
    </div>`;
};

const generateDeploymentHTML = (id, content) => {
  return `
    <div id="${id}" class="section">
        <h2>${content.title}</h2>
        <div class="feature-grid">
            ${Object.entries(content.environments).map(([env, config]) => `
                <div class="feature-card">
                    <h4>${env.toUpperCase()}</h4>
                    <p>${config.description}</p>
                    <p><strong>Setup:</strong> ${config.setup}</p>
                    <p><strong>Database:</strong> ${config.database}</p>
                </div>
            `).join('')}
        </div>
        
        <h3>Docker Commands</h3>
        <div class="code-block">${content.docker.commands.join('\n')}</div>
    </div>`;
};

const generateTroubleshootingHTML = (id, content) => {
  return `
    <div id="${id}" class="section">
        <h2>${content.title}</h2>
        ${content.common.map(item => `
            <div class="troubleshooting-item">
                <h4>${item.issue}</h4>
                ${item.solutions.map(solution => `<div class="solution">• ${solution}</div>`).join('')}
            </div>
        `).join('')}
        
        <h3>Log Files</h3>
        <div class="code-block">${Object.entries(content.logs).map(([service, command]) => 
          `# ${service.toUpperCase()}\n${command}`
        ).join('\n\n')}</div>
    </div>`;
};

const generateResourcesHTML = (id, content) => {
  return `
    <div id="${id}" class="section">
        <h2>${content.title}</h2>
        <h3>Project Resources</h3>
        ${content.links.map(link => `
            <a href="${link.url}" class="resource-link" target="_blank">${link.title}</a>
        `).join('')}
        
        <h3>Technology Documentation</h3>
        ${content.technologies.map(tech => `
            <a href="${tech.url}" class="resource-link" target="_blank">${tech.name}</a>
        `).join('')}
    </div>`;
};

/**
 * Create onboarding guide files
 */
const createOnboardingGuide = async () => {
  const docsDir = path.join(__dirname, 'generated');
  await fs.mkdir(docsDir, { recursive: true });
  
  // Generate HTML guide
  const htmlContent = generateOnboardingHTML(ONBOARDING_CONTENT);
  await fs.writeFile(path.join(docsDir, 'onboarding-guide.html'), htmlContent);
  
  // Generate markdown guide
  const markdownContent = generateMarkdownGuide(ONBOARDING_CONTENT);
  await fs.writeFile(path.join(docsDir, 'DEVELOPER_GUIDE.md'), markdownContent);
  
  // Generate JSON for API endpoint
  await fs.writeFile(
    path.join(docsDir, 'onboarding-content.json'),
    JSON.stringify(ONBOARDING_CONTENT, null, 2)
  );
  
  console.log('[Docs] Onboarding guide generated successfully');
};

/**
 * Generate markdown version
 */
const generateMarkdownGuide = (content) => {
  return `# ${content.welcome.title}

${content.welcome.description}

**Estimated Setup Time:** ${content.welcome.quickStart.timeEstimate}

## Prerequisites

${content.welcome.quickStart.prerequisites.map(req => `- ${req}`).join('\n')}

## Project Overview

### Architecture

- **Frontend:** ${content.projectOverview.architecture.frontend.technology}
- **Backend:** ${content.projectOverview.architecture.backend.technology}
- **Database:** ${content.projectOverview.architecture.backend.database}
- **Styling:** ${content.projectOverview.architecture.frontend.styling}

### Key Features

${content.projectOverview.features.map(feature => `- ${feature}`).join('\n')}

## Setup Instructions

${content.setupInstructions.steps.map(step => `
### ${step.step}. ${step.title}

${step.description}

\`\`\`bash
${step.commands.join('\n')}
\`\`\`
`).join('')}

## Development Workflow

### Git Branching Strategy

${content.developmentWorkflow.gitWorkflow.branching.map(branch => `- ${branch}`).join('\n')}

### Development Process

${content.developmentWorkflow.gitWorkflow.process.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## API Reference

**Base URL:** \`${content.apiReference.baseUrl}\`  
**Documentation:** [${content.apiReference.documentation}](${content.apiReference.documentation})

### Authentication

${content.apiReference.authentication.type}

\`\`\`
${content.apiReference.authentication.header}
\`\`\`

## Testing

${Object.entries(content.testing.types).map(([type, config]) => `
### ${type.toUpperCase()} Tests
- **Tool:** ${config.tool}
- **Location:** \`${config.location}\`
- **Command:** \`${config.command}\`
`).join('')}

## Troubleshooting

${content.troubleshooting.common.map(item => `
### ${item.issue}

${item.solutions.map(solution => `- ${solution}`).join('\n')}
`).join('')}

## Resources

### Project Links

${content.resources.links.map(link => `- [${link.title}](${link.url}) - ${link.description}`).join('\n')}

### Technology Documentation

${content.resources.technologies.map(tech => `- [${tech.name}](${tech.url}) - ${tech.description}`).join('\n')}
`;
};

/**
 * Setup onboarding guide endpoint
 */
const setupOnboardingGuide = (app) => {
  console.log('[Docs] Setting up onboarding guide...');
  
  // Serve onboarding guide
  app.get('/onboarding', async (req, res) => {
    try {
      const htmlPath = path.join(__dirname, 'generated', 'onboarding-guide.html');
      const htmlContent = await fs.readFile(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } catch (error) {
      res.status(404).json({ error: 'Onboarding guide not found' });
    }
  });
  
  // API endpoint for onboarding content
  app.get('/api/docs/onboarding', (req, res) => {
    ResponseHandler.success(res, 'Onboarding guide content retrieved', ONBOARDING_CONTENT);
  });
  
  console.log('[Docs] Onboarding guide available at /onboarding');
};

module.exports = {
  ONBOARDING_CONTENT,
  createOnboardingGuide,
  setupOnboardingGuide,
  generateOnboardingHTML,
  generateMarkdownGuide
};
