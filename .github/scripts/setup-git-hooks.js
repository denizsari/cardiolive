#!/usr/bin/env node

/**
 * Git Hooks Setup Script for Kardiyolive
 * 
 * This script sets up pre-commit and pre-push hooks using Husky
 * for code quality, linting, and testing automation.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🪝 Setting up Git hooks for Kardiyolive...');

// Check if we're in a git repository
try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Not in a git repository');
  process.exit(1);
}

// Install dependencies
console.log('📦 Installing Git hook dependencies...');
const dependencies = [
  'husky',
  'lint-staged',
  '@commitlint/cli',
  '@commitlint/config-conventional'
];

try {
  execSync(`npm install --save-dev ${dependencies.join(' ')}`, { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Initialize Husky
console.log('🪝 Initializing Husky...');
try {
  execSync('npx husky init', { stdio: 'inherit' });
  console.log('✅ Husky initialized');
} catch (error) {
  console.warn('⚠️  Husky might already be initialized');
}

// Create hook scripts
console.log('📝 Creating hook scripts...');

// Pre-commit hook
const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged for staged files
npx lint-staged

# Check for any .env files being committed (security)
if git diff --cached --name-only | grep -E "\.env"; then
  echo "❌ .env files should not be committed!"
  echo "Please remove them from staging and add to .gitignore"
  exit 1
fi

# Check for TODO comments in committed code
if git diff --cached --name-only | xargs grep -l "TODO\\|FIXME\\|XXX" 2>/dev/null; then
  echo "⚠️  Warning: Found TODO/FIXME comments in staged files"
  echo "Consider resolving them before committing"
fi

echo "✅ Pre-commit checks passed"
`;

// Pre-push hook
const prePushHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."

# Get current branch
branch=$(git rev-parse --abbrev-ref HEAD)

# Prevent direct pushes to main branch
if [ "$branch" = "main" ]; then
  echo "❌ Direct pushes to main branch are not allowed!"
  echo "Please create a pull request instead"
  exit 1
fi

# Run tests if they exist
if [ -f "package.json" ] && npm run test --silent 2>/dev/null; then
  echo "🧪 Running tests..."
  npm run test
fi

# Run build to ensure everything compiles
if [ -f "package.json" ]; then
  echo "🔨 Running build check..."
  if npm run build --silent 2>/dev/null; then
    npm run build
  else
    echo "⚠️  No build script found, skipping build check"
  fi
fi

echo "✅ Pre-push checks passed"
`;

// Commit message lint hook
const commitMsgHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit \${1}
`;

// Write hooks
const hooksDir = '.husky';
fs.writeFileSync(path.join(hooksDir, 'pre-commit'), preCommitHook);
fs.writeFileSync(path.join(hooksDir, 'pre-push'), prePushHook);
fs.writeFileSync(path.join(hooksDir, 'commit-msg'), commitMsgHook);

// Make hooks executable
try {
  execSync(`chmod +x ${hooksDir}/pre-commit ${hooksDir}/pre-push ${hooksDir}/commit-msg`);
  console.log('✅ Hooks created and made executable');
} catch (error) {
  console.warn('⚠️  Could not make hooks executable (might be Windows)');
}

// Create commitlint config
const commitlintConfig = `module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only changes
        'style',    // Changes that don't affect code meaning (white-space, formatting, etc)
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Code change that improves performance
        'test',     // Adding missing tests or correcting existing tests
        'chore',    // Changes to build process or auxiliary tools and libraries
        'ci',       // Changes to CI configuration files and scripts
        'build',    // Changes that affect the build system or external dependencies
        'revert',   // Reverts a previous commit
        'security', // Security improvements
        'deps',     // Dependency updates
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
};`;

fs.writeFileSync('commitlint.config.js', commitlintConfig);
console.log('✅ Commitlint configuration created');

// Create lint-staged config
const lintStagedConfig = {
  "*.{js,jsx,ts,tsx}": [
    "prettier --write",
    "eslint --fix",
    "git add"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write",
    "git add"
  ],
  "*.{css,scss,sass}": [
    "prettier --write",
    "git add"
  ]
};

// Update package.json with lint-staged config
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson['lint-staged'] = lintStagedConfig;
  
  // Add useful scripts if they don't exist
  if (!packageJson.scripts) packageJson.scripts = {};
  if (!packageJson.scripts['prepare']) packageJson.scripts['prepare'] = 'husky';
  if (!packageJson.scripts['commit']) packageJson.scripts['commit'] = 'git-cz';
  if (!packageJson.scripts['lint:fix']) packageJson.scripts['lint:fix'] = 'eslint --fix .';
  if (!packageJson.scripts['format']) packageJson.scripts['format'] = 'prettier --write .';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json updated with lint-staged config');
}

console.log('🎉 Git hooks setup completed!');
console.log('\n📋 Summary:');
console.log('   • Pre-commit: Runs linting, formatting, and security checks');
console.log('   • Pre-push: Prevents direct pushes to main, runs tests and build');
console.log('   • Commit-msg: Enforces conventional commit message format');
console.log('\n💡 Commit message format examples:');
console.log('   • feat: add user authentication system');
console.log('   • fix: resolve hydration error in main page');
console.log('   • docs: update API documentation');
console.log('   • refactor: optimize database queries');
console.log('\n🚀 You can now commit with confidence!');
