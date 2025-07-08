# Kardiyolive GitHub Workflow Setup

This document outlines the complete professional GitHub workflow implementation for the Kardiyolive project, including branch protection, automated testing, security scanning, and deployment pipelines.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │───▶│     Staging     │───▶│   Production    │
│     Branch      │    │   Environment   │    │  Environment    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    Pull Request           Automated Deploy        Manual Deploy
    ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
    │ Code Review │       │ Integration │       │ Production  │
    │ CI Checks   │       │ Testing     │       │ Validation  │
    │ Security    │       │ Performance │       │ Monitoring  │
    └─────────────┘       └─────────────┘       └─────────────┘
```

## 🔧 Components Implemented

### 1. Branch Protection Rules
- **Main Branch**: Requires PR reviews, status checks, conversation resolution
- **Development Branch**: Requires PR reviews and basic status checks
- Both branches: Force pushes disabled, deletions blocked

### 2. Git Hooks (Husky)
- **Pre-commit**: Linting, formatting, security checks
- **Pre-push**: Prevents direct main pushes, runs tests and build
- **Commit-msg**: Enforces conventional commit format

### 3. CI/CD Pipelines
- **Security & Quality**: CodeQL, dependency scanning, lint checks
- **Build & Test**: Automated testing with coverage reports
- **Deployment**: Staging and production deployment workflows

### 4. Code Quality Tools
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Bundlesize**: Bundle size monitoring
- **Lighthouse CI**: Performance monitoring

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+ installed
- Git repository initialized
- GitHub repository with admin access

### Installation Steps

1. **Run the complete setup script:**
   ```bash
   cd d:/expoProjects/Kardiyolive
   node .github/scripts/setup-complete-workflow.js
   ```

2. **Set up branch protection (requires GitHub token):**
   ```bash
   # Set your GitHub token
   export GITHUB_TOKEN="your_github_token_here"
   export GITHUB_REPOSITORY_OWNER="your-username"
   export GITHUB_REPOSITORY_NAME="Kardiyolive"
   
   # Run branch protection setup
   node .github/scripts/setup-branch-protection.js
   ```

3. **Install Git hooks:**
   ```bash
   node .github/scripts/setup-git-hooks.js
   ```

4. **Verify hydration fixes:**
   ```bash
   node .github/scripts/verify-hydration-fixes.js
   ```

## 📋 Workflow Files

### GitHub Actions Workflows
- `.github/workflows/ci-cd.yml` - Main CI/CD pipeline
- `.github/workflows/security-quality.yml` - Security and quality checks
- `.github/workflows/deployment.yml` - Deployment pipeline

### Configuration Files
- `.github/CODEOWNERS` - Code review assignments
- `.github/ISSUE_TEMPLATE/` - Issue templates
- `.github/pull_request_template.md` - PR template
- `SECURITY.md` - Security policy

### Git Hooks
- `.husky/pre-commit` - Pre-commit checks
- `.husky/pre-push` - Pre-push validation
- `.husky/commit-msg` - Commit message linting

## 🔒 Security Features

### Automated Security Scanning
- **CodeQL Analysis**: Static code analysis for vulnerabilities
- **Dependency Scanning**: NPM audit and Trivy scanning
- **Secret Detection**: TruffleHog for exposed secrets
- **SARIF Upload**: Security results to GitHub Security tab

### Branch Protection
- Prevents direct pushes to main branch
- Requires pull request reviews
- Enforces status checks before merging
- Blocks force pushes and deletions

## 🧪 Testing & Quality

### Automated Testing
- **Unit Tests**: Jest testing framework
- **Integration Tests**: MongoDB service integration
- **Coverage Reports**: Automatic coverage collection
- **Build Verification**: Ensures code compiles

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting enforcement
- **TypeScript**: Type checking
- **Accessibility**: Axe-core accessibility testing

### Performance Monitoring
- **Lighthouse CI**: Performance, accessibility, SEO scores
- **Bundle Size**: Automated bundle size monitoring
- **Core Web Vitals**: Real user metrics tracking

## 📦 Deployment Pipeline

### Environments
- **Development**: Feature branch development
- **Staging**: Integration testing environment
- **Production**: Live production environment

### Deployment Flow
1. **Feature Development**: Work on feature branches
2. **Pull Request**: Create PR to development branch
3. **Staging Deploy**: Automatic deployment to staging
4. **Production Deploy**: Manual deployment after approval

### Docker Integration
- Multi-stage builds for optimized images
- Container registry integration (GitHub Container Registry)
- Environment-specific configurations

## 🛠️ Available Commands

### Development Commands
```bash
# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint:fix

# Format code
npm run format

# Build project
npm run build
```

### Git Workflow Commands
```bash
# Create feature branch
git checkout -b feat/new-feature

# Conventional commits
git commit -m "feat: add user authentication"
git commit -m "fix: resolve hydration error"
git commit -m "docs: update API documentation"

# Push with pre-push hooks
git push origin feat/new-feature
```

### Quality Checks
```bash
# Run all quality checks
npm run lint && npm run test && npm run build

# Check bundle size
npx bundlesize

# Run accessibility tests
npx @axe-core/cli http://localhost:3000
```

## 🔍 Monitoring & Alerts

### GitHub Actions Monitoring
- **Build Status**: Real-time build and test status
- **Security Alerts**: Automated vulnerability notifications
- **Performance Metrics**: Lighthouse score tracking
- **Coverage Reports**: Test coverage monitoring

### Quality Gates
- **Code Coverage**: Minimum 80% coverage requirement
- **Performance**: Lighthouse scores above threshold
- **Security**: Zero high-severity vulnerabilities
- **Accessibility**: WCAG 2.1 AA compliance

## 🎯 Commit Message Convention

Following [Conventional Commits](https://www.conventionalcommits.org/):

### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or modifications
- `chore`: Build process or auxiliary tool changes
- `ci`: CI configuration changes
- `security`: Security improvements

### Examples
```bash
feat: add user authentication system
fix: resolve hydration error in main page
docs: update API documentation
refactor: optimize database queries
security: update dependencies with vulnerabilities
```

## 🚨 Troubleshooting

### Common Issues

**1. Git Hook Failures**
```bash
# Reset hooks if needed
rm -rf .husky
npx husky init
node .github/scripts/setup-git-hooks.js
```

**2. Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**3. Permission Issues**
```bash
# Make scripts executable (Linux/Mac)
chmod +x .github/scripts/*.js
```

### Hydration Issues
- Use `useIsClient()` hook for client-only code
- Replace `Math.random()` with `generateId()` or `useId()`
- Use `safeWindow()` and `safeDocument()` for DOM access
- Avoid `Date.now()` for component IDs

## 📚 Additional Resources

- [Git Workflow Documentation](docs/GIT_WORKFLOW.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [API Documentation](documentation/api/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Make your changes following the coding standards
4. Write tests for your changes
5. Ensure all checks pass: `npm run lint && npm test`
6. Commit using conventional format: `git commit -m "feat: add amazing feature"`
7. Push to your fork: `git push origin feat/amazing-feature`
8. Create a Pull Request

## 📞 Support

For issues related to the GitHub workflow setup:
1. Check the troubleshooting section above
2. Review GitHub Actions logs for specific errors
3. Ensure all required secrets are configured
4. Verify branch protection rules are properly set

---

**Note**: This workflow is designed for enterprise-level development practices with emphasis on security, quality, and automation. Adjust configurations based on your team's specific needs.
