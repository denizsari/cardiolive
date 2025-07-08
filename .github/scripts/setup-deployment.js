#!/usr/bin/env node

/**
 * Deployment Configuration Helper
 * 
 * This script helps configure deployment settings and creates necessary files.
 */

const fs = require('fs');
const path = require('path');

function createDockerComposeProduction() {
  const dockerComposeContent = `version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:5000
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/Kardiyolive
      - JWT_SECRET=\${JWT_SECRET}
      - CLOUDINARY_CLOUD_NAME=\${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=\${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=\${CLOUDINARY_API_SECRET}
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./docker/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    environment:
      - MONGO_INITDB_ROOT_USERNAME=\${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=\${MONGO_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=Kardiyolive
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  mongo_data:

networks:
  default:
    name: Kardiyolive-network
`;

  const dockerComposePath = path.join(process.cwd(), 'docker-compose.production.yml');
  fs.writeFileSync(dockerComposePath, dockerComposeContent);
  console.log('✅ Created docker-compose.production.yml');
}

function createEnvironmentTemplate() {
  const envTemplate = `# Kardiyolive Environment Variables Template
# Copy this file to .env and fill in your actual values

# Database
MONGODB_URI=mongodb://localhost:27017/Kardiyolive
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (if using email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# GitHub (for deployment)
GITHUB_TOKEN=your_github_token
LHCI_GITHUB_APP_TOKEN=your_lighthouse_token

# Production URLs (update for production)
PRODUCTION_API_URL=https://api.Kardiyolive.com
PRODUCTION_SITE_URL=https://Kardiyolive.com
STAGING_API_URL=https://staging-api.Kardiyolive.com
STAGING_SITE_URL=https://staging.Kardiyolive.com
`;

  const envTemplatePath = path.join(process.cwd(), '.env.template');
  fs.writeFileSync(envTemplatePath, envTemplate);
  console.log('✅ Created .env.template');
}

function createDeploymentScript() {
  const deploymentScript = `#!/bin/bash

# Kardiyolive Deployment Script
# Usage: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=\${1:-staging}
echo "🚀 Deploying to \${ENVIRONMENT}..."

# Check if environment is valid
if [[ "\$ENVIRONMENT" != "staging" && "\$ENVIRONMENT" != "production" ]]; then
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Load environment variables
if [[ "\$ENVIRONMENT" == "production" ]]; then
    ENV_FILE=".env.production"
else
    ENV_FILE=".env.staging"
fi

if [[ ! -f "\$ENV_FILE" ]]; then
    echo "❌ Environment file \$ENV_FILE not found"
    exit 1
fi

source "\$ENV_FILE"

echo "📦 Building Docker images..."
docker-compose -f docker-compose.production.yml build

echo "🔄 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down

echo "🚀 Starting new containers..."
docker-compose -f docker-compose.production.yml up -d

echo "🏥 Running health checks..."
sleep 30

# Check if services are running
if docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    
    # Run smoke tests
    echo "🧪 Running smoke tests..."
    if [[ "\$ENVIRONMENT" == "production" ]]; then
        curl -f "\$PRODUCTION_SITE_URL/health" || echo "⚠️ Health check failed"
    else
        curl -f "\$STAGING_SITE_URL/health" || echo "⚠️ Health check failed"
    fi
else
    echo "❌ Deployment failed - containers not running"
    docker-compose -f docker-compose.production.yml logs
    exit 1
fi

echo "🎉 Deployment to \$ENVIRONMENT completed successfully!"
`;

  const deploymentScriptPath = path.join(process.cwd(), 'deploy.sh');
  fs.writeFileSync(deploymentScriptPath, deploymentScript);
  
  // Make script executable (if on Unix-like system)
  try {
    fs.chmodSync(deploymentScriptPath, '755');
  } catch (error) {
    console.log('ℹ️ Could not make deploy.sh executable (likely on Windows)');
  }
  
  console.log('✅ Created deploy.sh');
}

function main() {
  console.log('🔧 Setting up deployment configuration...\n');

  try {
    createDockerComposeProduction();
    createEnvironmentTemplate();
    createDeploymentScript();

    console.log('\n🎉 Deployment configuration setup completed!');
    console.log('\n📋 Files created:');
    console.log('   • docker-compose.production.yml - Production Docker setup');
    console.log('   • .env.template - Environment variables template');
    console.log('   • deploy.sh - Deployment script');

    console.log('\n📋 Next steps:');
    console.log('   1. Copy .env.template to .env and fill in your values');
    console.log('   2. Create .env.staging and .env.production for different environments');
    console.log('   3. Test local deployment: docker-compose -f docker-compose.production.yml up');
    console.log('   4. Configure your server with these files');
    console.log('   5. Set up domain and SSL certificates');

    console.log('\n⚠️ Security reminders:');
    console.log('   • Never commit .env files to git');
    console.log('   • Use strong passwords and secrets');
    console.log('   • Keep JWT_SECRET secure and unique');
    console.log('   • Use HTTPS in production');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createDockerComposeProduction,
  createEnvironmentTemplate,
  createDeploymentScript
};
