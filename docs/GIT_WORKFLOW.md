# 🔄 Git Workflow Guide

This document outlines the Git workflow for the CardioLive project, including branching strategy, commit conventions, and best practices.

## 📊 Branching Strategy Overview

```
main (production-ready)
│
├── development (active development)
    │
    ├── feature/order-details-ui
    ├── feature/payment-integration
    ├── fix/login-redirect-issue
    ├── chore/update-dependencies
    └── docs/api-documentation
```

## 🌳 Branch Types and Naming

| Branch Type | Purpose | Naming Convention | Example |
|-------------|---------|-------------------|---------|
| `main` | Production releases | `main` | `main` |
| `development` | Active development | `development` | `development` |
| `feature/` | New features | `feature/<short-description>` | `feature/user-dashboard` |
| `fix/` | Bug fixes | `fix/<short-description>` | `fix/payment-error` |
| `chore/` | Maintenance | `chore/<short-description>` | `chore/update-deps` |
| `docs/` | Documentation | `docs/<short-description>` | `docs/api-guide` |
| `refactor/` | Code refactoring | `refactor/<short-description>` | `refactor/user-service` |
| `test/` | Test improvements | `test/<short-description>` | `test/add-unit-tests` |

## 🚀 Development Workflow

### 1. Starting New Work

```bash
# 1. Switch to development and get latest changes
git checkout development
git pull origin development

# 2. Create new feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git add .
git commit -m "feat: add user authentication feature"

# 4. Push your branch
git push -u origin feature/your-feature-name
```

### 2. Creating a Pull Request

1. **Open PR to `development` branch** (never directly to `main`)
2. **Fill out the PR template completely**
3. **Request review from team members**
4. **Ensure all CI checks pass**
5. **Address review feedback**
6. **Merge after approval**

### 3. Keeping Branches Updated

```bash
# Regularly sync your feature branch with development
git checkout development
git pull origin development
git checkout feature/your-feature-name
git merge development

# Or use rebase for a cleaner history
git rebase development
```

### 4. Release Process

```bash
# 1. Prepare release (merge development to main)
npm run release:prepare

# 2. Create and push release tag
git tag v1.2.0
git push origin v1.2.0

# 3. Finish release (push to main and switch back)
npm run release:finish
```

## 📝 Commit Message Convention

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
| `feat` | New feature | `feat: add user dashboard` |
| `fix` | Bug fix | `fix: resolve login redirect issue` |
| `docs` | Documentation | `docs: update API documentation` |
| `style` | Formatting/style | `style: fix ESLint warnings` |
| `refactor` | Code refactoring | `refactor: improve error handling` |
| `test` | Tests | `test: add integration tests` |
| `chore` | Maintenance | `chore: update dependencies` |
| `perf` | Performance | `perf: optimize database queries` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |

### Examples

```bash
# Good commit messages
feat: add order tracking functionality
fix: resolve payment processing timeout
docs: update contributing guidelines
style: fix ESLint warnings in user service
refactor: extract email service to separate module
test: add unit tests for cart calculations
chore: upgrade Next.js to version 14
perf: optimize product search query
ci: add automated testing workflow

# Bad commit messages (avoid these)
fix: bug
update: stuff
WIP: working on feature
fixed it
```

### Breaking Changes

For breaking changes, use `!` or include `BREAKING CHANGE:` in footer:

```bash
feat!: remove deprecated user API endpoints

# or

feat: new authentication system

BREAKING CHANGE: The old /auth endpoint has been removed.
Use /api/v2/auth instead.
```

## 🔀 Merge Strategies

### Development Branch
- **Squash and merge** for feature branches
- **Merge commit** for release merges
- **Rebase and merge** for small fixes

### Main Branch
- **Merge commit** only (preserves development history)
- Always create a merge commit for traceability

## 🔧 Git Hooks and Automation

### Pre-commit Hooks
```bash
# Install husky for git hooks
npm install --save-dev husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

### Commit Message Validation
```bash
# Add commit-msg hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'
```

## ⚠️ Conflict Resolution

### Common Scenarios

1. **Merge Conflicts in Development**
   ```bash
   # Resolve conflicts in your feature branch
   git checkout feature/your-feature
   git merge development
   # Fix conflicts in your editor
   git add .
   git commit -m "resolve: merge conflicts with development"
   ```

2. **Conflicts During PR**
   ```bash
   # Update your branch and resolve conflicts
   git checkout development
   git pull origin development
   git checkout feature/your-feature
   git merge development
   # Resolve conflicts and push
   git push origin feature/your-feature
   ```

### Best Practices to Avoid Conflicts

- **Small, frequent commits**
- **Regular syncing with development**
- **Communicate about overlapping work**
- **Use consistent formatting (Prettier)**

## 🏷️ Tagging and Releases

### Semantic Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes

### Creating Tags

```bash
# Patch release (1.0.0 → 1.0.1)
npm run version:patch

# Minor release (1.0.1 → 1.1.0)
npm run version:minor

# Major release (1.1.0 → 2.0.0)
npm run version:major
```

### Release Workflow

1. **Development stable** → All features tested
2. **Create PR** → development → main
3. **Review and test** → Thorough QA testing
4. **Merge to main** → Create merge commit
5. **Create release tag** → v1.2.0
6. **Deploy to production** → Automated deployment
7. **Update changelog** → Document changes

## 📊 Branch Protection Rules

### Development Branch
- ✅ Require pull request reviews (1 reviewer minimum)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators

### Main Branch
- ✅ Require pull request reviews (2 reviewers minimum)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict pushes to matching branches

## 🔍 Code Review Guidelines

### For Authors
- **Self-review** before requesting review
- **Clear PR description** with context
- **Small, focused changes** (< 400 lines)
- **Respond promptly** to feedback

### For Reviewers
- **Review within 24 hours**
- **Provide constructive feedback**
- **Test the changes locally**
- **Check for security issues**
- **Verify tests and documentation**

## 📋 Quick Reference Commands

```bash
# Start new feature
git checkout development && git pull && git checkout -b feature/name

# Sync with development
git checkout development && git pull && git checkout - && git merge development

# Prepare for review
git add . && git commit -m "feat: description" && git push

# Release preparation
npm run release:prepare && git tag v1.2.0 && git push origin v1.2.0

# Cleanup merged branches
git branch -d feature/completed-feature
git push origin --delete feature/completed-feature
```

## 🆘 Emergency Procedures

### Hotfixes to Production
```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b fix/critical-issue

# Make fix and test
# ... make changes ...
git add .
git commit -m "fix: critical security issue"

# Create PR to main (skip development for emergencies)
git push origin fix/critical-issue
# Create PR: fix/critical-issue → main

# After merge, sync back to development
git checkout development
git merge main
git push origin development
```

### Reverting Changes
```bash
# Revert a commit
git revert <commit-hash>

# Revert a merge
git revert -m 1 <merge-commit-hash>

# Reset to previous state (DANGER: loses history)
git reset --hard <commit-hash>
```

---

## 📞 Need Help?

- **Git issues:** Check [Git documentation](https://git-scm.com/docs)
- **Workflow questions:** Create an issue with `question` label
- **Urgent issues:** Contact team leads directly

**Remember:** When in doubt, ask! It's better to clarify than to make mistakes. 🚀
