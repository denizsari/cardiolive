#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor() {
    this.results = {
      frontend: {},
      backend: {},
      recommendations: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  analyzeFrontendBundle() {
    this.log('📦 Analyzing Frontend Bundle...', 'info');
    
    const frontendDir = path.join(process.cwd(), 'frontend');
    const buildDir = path.join(frontendDir, '.next');
    
    if (!fs.existsSync(buildDir)) {
      this.log('Building frontend first...', 'warning');
      try {
        execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });
      } catch (error) {
        this.log('Failed to build frontend', 'error');
        return;
      }
    }

    // Analyze .next build
    const staticDir = path.join(buildDir, 'static');
    const chunksDir = path.join(staticDir, 'chunks');
    
    let totalSize = 0;
    const fileAnalysis = [];

    if (fs.existsSync(chunksDir)) {
      const files = fs.readdirSync(chunksDir, { withFileTypes: true });
      
      files.forEach(file => {
        if (file.isFile() && file.name.endsWith('.js')) {
          const filePath = path.join(chunksDir, file.name);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          
          fileAnalysis.push({
            name: file.name,
            size: stats.size,
            formattedSize: this.formatSize(stats.size)
          });
        }
      });
    }

    // Sort by size
    fileAnalysis.sort((a, b) => b.size - a.size);

    this.results.frontend = {
      totalSize: this.formatSize(totalSize),
      totalSizeBytes: totalSize,
      files: fileAnalysis.slice(0, 10), // Top 10 largest files
      fileCount: fileAnalysis.length
    };

    this.log(`Frontend bundle size: ${this.formatSize(totalSize)}`, 'success');
    this.log(`Number of chunks: ${fileAnalysis.length}`, 'info');

    // Add recommendations
    if (totalSize > 1024 * 1024) { // > 1MB
      this.results.recommendations.push({
        type: 'frontend',
        severity: 'warning',
        message: 'Frontend bundle is large (>1MB). Consider code splitting and lazy loading.'
      });
    }

    const largeFiles = fileAnalysis.filter(f => f.size > 100 * 1024); // > 100KB
    if (largeFiles.length > 0) {
      this.results.recommendations.push({
        type: 'frontend',
        severity: 'info',
        message: `${largeFiles.length} files are larger than 100KB. Review for optimization opportunities.`
      });
    }
  }

  analyzeBackendDependencies() {
    this.log('📦 Analyzing Backend Dependencies...', 'info');
    
    const backendDir = path.join(process.cwd(), 'backend');
    const packageJsonPath = path.join(backendDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      this.log('Backend package.json not found', 'error');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    // Analyze node_modules size
    const nodeModulesDir = path.join(backendDir, 'node_modules');
    let nodeModulesSize = 0;
    
    if (fs.existsSync(nodeModulesDir)) {
      nodeModulesSize = this.calculateDirectorySize(nodeModulesDir);
    }

    this.results.backend = {
      dependencies: Object.keys(dependencies).length,
      devDependencies: Object.keys(devDependencies).length,
      nodeModulesSize: this.formatSize(nodeModulesSize),
      nodeModulesSizeBytes: nodeModulesSize,
      topDependencies: Object.entries(dependencies).slice(0, 10)
    };

    this.log(`Backend dependencies: ${Object.keys(dependencies).length}`, 'success');
    this.log(`Backend dev dependencies: ${Object.keys(devDependencies).length}`, 'info');
    this.log(`Node modules size: ${this.formatSize(nodeModulesSize)}`, 'info');

    // Check for potential optimizations
    const heavyPackages = ['lodash', 'moment', 'core-js'];
    const usedHeavyPackages = heavyPackages.filter(pkg => dependencies[pkg]);
    
    if (usedHeavyPackages.length > 0) {
      this.results.recommendations.push({
        type: 'backend',
        severity: 'info',
        message: `Consider alternatives for heavy packages: ${usedHeavyPackages.join(', ')}`
      });
    }
  }

  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file.name);
        
        if (file.isDirectory()) {
          totalSize += this.calculateDirectorySize(filePath);
        } else {
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        }
      });
    } catch (error) {
      // Skip directories we can't read
    }
    
    return totalSize;
  }

  analyzeDuplicateDependencies() {
    this.log('🔍 Checking for duplicate dependencies...', 'info');
    
    const frontendPackagePath = path.join(process.cwd(), 'frontend', 'package.json');
    const backendPackagePath = path.join(process.cwd(), 'backend', 'package.json');
    
    if (!fs.existsSync(frontendPackagePath) || !fs.existsSync(backendPackagePath)) {
      return;
    }

    const frontendPackage = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
    const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));

    const frontendDeps = { ...frontendPackage.dependencies, ...frontendPackage.devDependencies };
    const backendDeps = { ...backendPackage.dependencies, ...backendPackage.devDependencies };

    const duplicates = [];
    
    Object.keys(frontendDeps).forEach(dep => {
      if (backendDeps[dep]) {
        duplicates.push({
          package: dep,
          frontend: frontendDeps[dep],
          backend: backendDeps[dep]
        });
      }
    });

    if (duplicates.length > 0) {
      this.log(`Found ${duplicates.length} duplicate dependencies`, 'warning');
      duplicates.forEach(dup => {
        this.log(`  ${dup.package}: frontend(${dup.frontend}) backend(${dup.backend})`, 'info');
      });

      this.results.recommendations.push({
        type: 'optimization',
        severity: 'info',
        message: `${duplicates.length} packages are used in both frontend and backend. Consider workspace optimization.`
      });
    }
  }

  checkUnusedDependencies() {
    this.log('🔍 Checking for potentially unused dependencies...', 'info');
    
    // This is a simplified check - in real scenarios, you might use tools like depcheck
    const suspiciousPackages = [
      'lodash', 'underscore', 'bluebird', 'request', 'left-pad'
    ];

    const frontendPackagePath = path.join(process.cwd(), 'frontend', 'package.json');
    const backendPackagePath = path.join(process.cwd(), 'backend', 'package.json');
    
    [frontendPackagePath, backendPackagePath].forEach((packagePath, index) => {
      if (!fs.existsSync(packagePath)) return;
      
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const dependencies = packageJson.dependencies || {};
      const location = index === 0 ? 'frontend' : 'backend';
      
      const foundSuspicious = suspiciousPackages.filter(pkg => dependencies[pkg]);
      
      if (foundSuspicious.length > 0) {
        this.results.recommendations.push({
          type: location,
          severity: 'info',
          message: `Review if these packages are still needed in ${location}: ${foundSuspicious.join(', ')}`
        });
      }
    });
  }

  generateReport() {
    this.log('\n📊 Bundle Analysis Report', 'success');
    this.log('=' .repeat(50), 'info');
    
    // Frontend Analysis
    if (this.results.frontend.totalSize) {
      this.log('\n🎨 Frontend Bundle:', 'info');
      this.log(`  Total Size: ${this.results.frontend.totalSize}`, 'success');
      this.log(`  Chunks: ${this.results.frontend.fileCount}`, 'info');
      
      if (this.results.frontend.files.length > 0) {
        this.log('  Largest files:', 'info');
        this.results.frontend.files.slice(0, 5).forEach(file => {
          this.log(`    ${file.name}: ${file.formattedSize}`, 'info');
        });
      }
    }

    // Backend Analysis
    if (this.results.backend.dependencies) {
      this.log('\n⚙️  Backend Dependencies:', 'info');
      this.log(`  Dependencies: ${this.results.backend.dependencies}`, 'success');
      this.log(`  Dev Dependencies: ${this.results.backend.devDependencies}`, 'info');
      this.log(`  Node Modules: ${this.results.backend.nodeModulesSize}`, 'info');
    }

    // Recommendations
    if (this.results.recommendations.length > 0) {
      this.log('\n💡 Optimization Recommendations:', 'warning');
      this.results.recommendations.forEach(rec => {
        const symbol = rec.severity === 'warning' ? '⚠️' : 'ℹ️';
        this.log(`  ${symbol} ${rec.message}`, rec.severity);
      });
    }

    // Overall assessment
    const totalSizeMB = (this.results.frontend.totalSizeBytes || 0) / (1024 * 1024);
    const isOptimal = totalSizeMB < 1 && this.results.recommendations.length < 3;
    
    this.log(`\n🎯 Bundle Health: ${isOptimal ? '✅ OPTIMAL' : '⚠️ NEEDS OPTIMIZATION'}`, 
      isOptimal ? 'success' : 'warning');
  }

  async run() {
    this.log('🔍 Starting Bundle Analysis...', 'info');
    
    this.analyzeFrontendBundle();
    this.analyzeBackendDependencies();
    this.analyzeDuplicateDependencies();
    this.checkUnusedDependencies();
    
    this.generateReport();
  }
}

// Run the bundle analyzer
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = BundleAnalyzer;
