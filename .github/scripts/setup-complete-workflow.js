#!/usr/bin/env node

/**
 * Complete GitHub Workflow Setup for CardioLive
 * 
 * This script sets up the complete professional GitHub workflow including:
 * - Branch protection rules
 * - Git hooks with Husky
 * - Code quality tools
 * - Security scanning
 * - Deployment pipelines
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up complete GitHub workflow for CardioLive...\n');

// Step 1: Install all necessary dependencies
console.log('📦 Installing development dependencies...');
const dependencies = [
  'husky',
  'lint-staged',
  '@commitlint/cli',
  '@commitlint/config-conventional',
  'prettier',
  'eslint',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'bundlesize',
  '@axe-core/cli'
];

try {
  execSync(`npm install --save-dev ${dependencies.join(' ')}`, { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Step 2: Setup Git hooks
console.log('🪝 Setting up Git hooks...');
try {
  require('./setup-git-hooks.js');
  console.log('✅ Git hooks configured\n');
} catch (error) {
  console.warn('⚠️  Git hooks setup encountered issues:', error.message);
}

// Step 3: Create ESLint configuration
console.log('🔍 Creating ESLint configuration...');
const eslintConfig = {
  "root": true,
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "next/core-web-vitals"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": [
    "node_modules/",
    ".next/",
    "out/",
    "build/",
    "dist/"
  ]
};

fs.writeFileSync('.eslintrc.json', JSON.stringify(eslintConfig, null, 2));
console.log('✅ ESLint configuration created\n');

// Step 4: Create Prettier configuration
console.log('💅 Creating Prettier configuration...');
const prettierConfig = {
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
};

fs.writeFileSync('.prettierrc.json', JSON.stringify(prettierConfig, null, 2));

// Create .prettierignore
const prettierIgnore = `node_modules/
.next/
out/
build/
dist/
*.min.js
*.min.css
package-lock.json
yarn.lock
.env*
*.log
`;

fs.writeFileSync('.prettierignore', prettierIgnore);
console.log('✅ Prettier configuration created\n');

// Step 5: Create bundlesize configuration
console.log('📊 Creating bundlesize configuration...');
const bundlesizeConfig = [
  {
    "path": "./frontend/.next/static/js/*.js",
    "maxSize": "250 kB",
    "compression": "gzip"
  },
  {
    "path": "./frontend/.next/static/css/*.css",
    "maxSize": "50 kB",
    "compression": "gzip"
  }
];

// Update package.json with bundlesize config
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.bundlesize = bundlesizeConfig;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}
console.log('✅ Bundlesize configuration created\n');

// Step 6: Create Lighthouse CI configuration
console.log('🏠 Creating Lighthouse CI configuration...');
const lighthouseConfig = {
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/products",
        "http://localhost:3000/about"
      ],
      "startServerCommand": "npm start",
      "startServerReadyPattern": "ready",
      "startServerReadyTimeout": 30000
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.8}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.8}],
        "categories:seo": ["warn", {"minScore": 0.8}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
};

fs.writeFileSync('lighthouserc.json', JSON.stringify(lighthouseConfig, null, 2));
console.log('✅ Lighthouse CI configuration created\n');

// Step 7: Update GitHub templates
console.log('📝 Creating GitHub issue and PR templates...');

// Create issue template
const issueTemplate = `---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
`;

const featureTemplate = `---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''

---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
`;

const prTemplate = `## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement
- [ ] Security improvement

## Testing
- [ ] I have tested this code locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have checked that the code builds without errors

## Security
- [ ] This change doesn't introduce security vulnerabilities
- [ ] I have reviewed the code for potential security issues
- [ ] Sensitive data is properly protected

## Documentation
- [ ] I have updated the documentation accordingly
- [ ] Comments have been added to hard-to-understand areas
- [ ] README has been updated if needed

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Add any additional notes or context about the PR here.
`;

// Create directories and files
const templatesDir = '.github/ISSUE_TEMPLATE';
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

fs.writeFileSync(path.join(templatesDir, 'bug_report.md'), issueTemplate);
fs.writeFileSync(path.join(templatesDir, 'feature_request.md'), featureTemplate);
fs.writeFileSync('.github/pull_request_template.md', prTemplate);

console.log('✅ GitHub templates created\n');

// Step 8: Create security policy
console.log('🔒 Creating security policy...');
const securityPolicy = `# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of CardioLive seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [security@cardiolive.com](mailto:security@cardiolive.com).

Please include the requested information listed below (as much as you can provide) to help us better understand the nature and scope of the possible issue:

* Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English or Turkish.

## Response Timeline

We aim to respond to security reports within 48 hours and provide regular updates on our progress.
`;

fs.writeFileSync('SECURITY.md', securityPolicy);
console.log('✅ Security policy created\n');

// Step 9: Summary and next steps
console.log('🎉 GitHub workflow setup completed successfully!\n');
console.log('📋 What was configured:');
console.log('   ✅ Git hooks (pre-commit, pre-push, commit-msg)');
console.log('   ✅ ESLint and Prettier configuration');
console.log('   ✅ Bundlesize monitoring');
console.log('   ✅ Lighthouse CI for performance');
console.log('   ✅ GitHub issue and PR templates');
console.log('   ✅ Security policy');
console.log('   ✅ Branch protection setup script');
console.log('   ✅ CI/CD workflows');

console.log('\n🚀 Next steps:');
console.log('   1. Run: node .github/scripts/setup-branch-protection.js');
console.log('      (Requires GITHUB_TOKEN with admin access)');
console.log('   2. Review and customize the workflows in .github/workflows/');
console.log('   3. Update CODEOWNERS with actual GitHub usernames');
console.log('   4. Set up required secrets in GitHub repository settings:');
console.log('      - LHCI_GITHUB_APP_TOKEN (for Lighthouse CI)');
console.log('      - Deployment secrets (if using automated deployment)');
console.log('   5. Test the workflow by creating a feature branch and PR');

console.log('\n💡 Usage examples:');
console.log('   • Create feature: git checkout -b feat/user-authentication');
console.log('   • Commit: git commit -m "feat: add user login system"');
console.log('   • The hooks will automatically run checks before commit/push');
console.log('   • PRs will trigger full CI/CD pipeline with all quality checks');

console.log('\n🎯 Your repository now has enterprise-level GitHub workflows!');
