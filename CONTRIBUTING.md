## 🚀 Contributing to CardioLive

Thank you for your interest in contributing to CardioLive! This document provides guidelines and instructions for contributing to our project.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Branching Strategy](#branching-strategy)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Requirements](#testing-requirements)
8. [Code Style Guidelines](#code-style-guidelines)

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and considerate in all interactions.

## 🎯 Getting Started

### Prerequisites

- **Node.js** 20.x or later
- **MongoDB** 6.0 or later
- **Redis** 7.x or later
- **Git** for version control

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/cardiolive.git
   cd cardiolive
   ```

2. **Switch to development branch:**
   ```bash
   git checkout development
   git pull origin development
   ```

3. **Install dependencies:**
   ```bash
   # Backend dependencies
   cd backend && npm install
   
   # Frontend dependencies
   cd ../frontend && npm install
   ```

4. **Set up environment variables:**
   ```bash
   # Copy environment templates
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

5. **Start development servers:**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

## 🔄 Development Workflow

### Branching Strategy

We use a **Git Flow** inspired workflow:

```
main (production)
├── development (active development)
    ├── feature/user-authentication
    ├── feature/order-management
    ├── fix/payment-processing
    └── chore/update-dependencies
```

### Branch Types

| Branch Type | Naming Convention | Purpose |
|-------------|-------------------|---------|
| `feature/` | `feature/short-description` | New features |
| `fix/` | `fix/short-description` | Bug fixes |
| `chore/` | `chore/short-description` | Maintenance tasks |
| `docs/` | `docs/short-description` | Documentation updates |
| `refactor/` | `refactor/short-description` | Code refactoring |

### Examples

- `feature/order-details-ui`
- `fix/payment-error`
- `chore/update-dependencies`
- `docs/api-documentation`
- `refactor/user-service`

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add user authentication` |
| `fix` | Bug fix | `fix: resolve payment processing error` |
| `docs` | Documentation | `docs: update API documentation` |
| `style` | Code style changes | `style: fix ESLint warnings` |
| `refactor` | Code refactoring | `refactor: improve user service` |
| `test` | Adding tests | `test: add unit tests for cart` |
| `chore` | Maintenance | `chore: update dependencies` |

### Examples
```bash
feat: add order details UI to admin panel
fix: resolve payment processing timeout issue
docs: update contributing guidelines
chore: upgrade Next.js to version 14
test: add integration tests for user API
```

## 🔀 Pull Request Process

### Before Creating a PR

1. **Ensure your branch is up to date:**
   ```bash
   git checkout development
   git pull origin development
   git checkout your-feature-branch
   git merge development
   ```

2. **Run tests and linting:**
   ```bash
   # Backend
   cd backend
   npm run lint
   npm test
   
   # Frontend
   cd frontend
   npm run lint
   npm run build
   npm test
   ```

3. **Commit your changes with conventional commits**

### Creating a Pull Request

1. **Push your branch:**
   ```bash
   git push origin your-feature-branch
   ```

2. **Open a PR to `development` branch (not `main`)**

3. **Fill out the PR template completely**

4. **Request review from at least one team member**

### PR Requirements

- ✅ All tests pass
- ✅ No linting errors
- ✅ Code coverage maintained
- ✅ Documentation updated if needed
- ✅ At least one approval from team member

## 🧪 Testing Requirements

### Backend Testing

```bash
cd backend

# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend

# Unit and component tests
npm test

# Build test
npm run build

# E2E tests (if available)
npm run test:e2e
```

### Required Test Coverage

- **Backend:** Minimum 80% coverage
- **Frontend:** Minimum 70% coverage
- **Critical paths:** 100% coverage required

## 💅 Code Style Guidelines

### Backend (Node.js/Express)

- Use **ES6+** features
- Follow **ESLint** configuration
- Use **async/await** instead of callbacks
- Implement proper error handling
- Add JSDoc comments for functions

### Frontend (Next.js/React)

- Use **TypeScript** for type safety
- Follow **React best practices**
- Use **functional components** with hooks
- Implement proper **error boundaries**
- Follow **accessibility guidelines**

### General Guidelines

- **DRY (Don't Repeat Yourself)** principle
- **SOLID** principles for architecture
- **Clear and descriptive** variable names
- **Comments** for complex logic
- **Consistent** formatting with Prettier

## 🔍 Code Review Guidelines

### As a Reviewer

- ✅ Check for functionality and edge cases
- ✅ Verify test coverage
- ✅ Ensure code follows style guidelines
- ✅ Look for security vulnerabilities
- ✅ Provide constructive feedback

### As an Author

- ✅ Respond to feedback promptly
- ✅ Make requested changes
- ✅ Re-request review after changes
- ✅ Be open to suggestions

## 🚀 Release Process

### Development to Main

1. **Feature complete in `development`**
2. **All tests passing**
3. **Create PR from `development` to `main`**
4. **Thorough testing and review**
5. **Merge and create release tag**

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes

## 📞 Getting Help

### Communication Channels

- **Issues:** For bug reports and feature requests
- **Discussions:** For questions and general discussion
- **Email:** [your-email@example.com] for sensitive matters

### Documentation

- **API Documentation:** `/docs/api/`
- **Technical Guide:** `/docs/guides/TEKNIK_DOKUMANTASYON.md`
- **Deployment Guide:** `/DEPLOYMENT.md`

## 🎉 Recognition

Contributors will be acknowledged in:

- **GitHub contributors** section
- **Release notes** for significant contributions
- **Project documentation**

---

**Thank you for contributing to CardioLive! 🚀**

For questions or clarification, please don't hesitate to reach out through our communication channels.
