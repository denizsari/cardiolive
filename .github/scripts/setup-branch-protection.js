#!/usr/bin/env node

/**
 * GitHub Branch Protection Setup Script
 * 
 * This script sets up branch protection rules for the CardioLive project.
 * It requires a GitHub token with admin access to the repository.
 * 
 * Usage:
 * GITHUB_TOKEN=your_token GITHUB_REPOSITORY_OWNER=username GITHUB_REPOSITORY_NAME=cardiolive node setup-branch-protection.js
 */

const { Octokit } = require('@octokit/rest');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user input
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, resolve);
});

// Configuration
let REPO_OWNER = process.env.GITHUB_REPOSITORY_OWNER;
let REPO_NAME = process.env.GITHUB_REPOSITORY_NAME;
let GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function getConfiguration() {
  console.log('🔧 GitHub Branch Protection Setup\n');
  
  if (!GITHUB_TOKEN) {
    console.log('❌ GITHUB_TOKEN environment variable is required');
    console.log('Please set it with: export GITHUB_TOKEN="your_token_here"');
    console.log('Get your token from: https://github.com/settings/tokens\n');
    GITHUB_TOKEN = await prompt('Or enter your GitHub token now: ');
  }

  if (!REPO_OWNER) {
    REPO_OWNER = await prompt('Enter GitHub repository owner (username): ');
  }

  if (!REPO_NAME) {
    REPO_NAME = await prompt('Enter repository name (default: cardiolive): ') || 'cardiolive';
  }

  console.log(`\n📋 Configuration:`);
  console.log(`   Repository: ${REPO_OWNER}/${REPO_NAME}`);
  console.log(`   Token: ${GITHUB_TOKEN ? '✅ Provided' : '❌ Missing'}\n`);
  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    console.error('❌ Missing required configuration');
    process.exit(1);
  }
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

async function setupBranchProtection() {
  try {
    console.log('🔧 Setting up branch protection rules for CardioLive...');

    // Protection rules for main branch
    const mainBranchProtection = {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      branch: 'main',
      required_status_checks: {
        strict: true,
        checks: [
          { context: 'build-and-test', app_id: -1 },
          { context: 'lint', app_id: -1 },
          { context: 'security-scan', app_id: -1 }
        ]
      },
      enforce_admins: false, // Allow admins to bypass in emergencies
      required_pull_request_reviews: {
        required_approving_review_count: 1,
        dismiss_stale_reviews: true,
        require_code_owner_reviews: true,
        require_last_push_approval: false
      },
      restrictions: null, // No user/team restrictions
      allow_force_pushes: false,
      allow_deletions: false,
      block_creations: false,
      required_conversation_resolution: true,
      lock_branch: false,
      allow_fork_syncing: true
    };

    // Protection rules for development branch
    const developmentBranchProtection = {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      branch: 'development',
      required_status_checks: {
        strict: false, // More flexible for development
        checks: [
          { context: 'build-and-test', app_id: -1 },
          { context: 'lint', app_id: -1 }
        ]
      },
      enforce_admins: false,
      required_pull_request_reviews: {
        required_approving_review_count: 1,
        dismiss_stale_reviews: false,
        require_code_owner_reviews: false,
        require_last_push_approval: false
      },
      restrictions: null,
      allow_force_pushes: false,
      allow_deletions: false,
      block_creations: false,
      required_conversation_resolution: false,
      lock_branch: false,
      allow_fork_syncing: true
    };

    // Apply protection to main branch
    console.log('🛡️  Protecting main branch...');
    await octokit.rest.repos.updateBranchProtection(mainBranchProtection);
    console.log('✅ Main branch protection rules applied');

    // Apply protection to development branch
    console.log('🛡️  Protecting development branch...');
    await octokit.rest.repos.updateBranchProtection(developmentBranchProtection);
    console.log('✅ Development branch protection rules applied');

    console.log('🎉 Branch protection setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • Main branch: Requires PR reviews, status checks, and conversation resolution');
    console.log('   • Development branch: Requires PR reviews and basic status checks');
    console.log('   • Both branches: Force pushes disabled, deletions blocked');

  } catch (error) {
    console.error('❌ Error setting up branch protection:', error.message);
    if (error.status === 404) {
      console.error('   Repository not found or insufficient permissions');
    } else if (error.status === 403) {
      console.error('   Insufficient permissions to modify branch protection');
    }
    process.exit(1);
  }
}

// Create CODEOWNERS file if it doesn't exist
async function createCodeowners() {
  const codeownersContent = `# CardioLive Code Owners
# These owners will be requested for review when someone opens a pull request.

# Global ownership
* @${REPO_OWNER}

# Frontend specific
/frontend/ @${REPO_OWNER}
/frontend/app/components/ @${REPO_OWNER}
/frontend/app/utils/ @${REPO_OWNER}

# Backend specific
/backend/ @${REPO_OWNER}
/backend/src/controllers/ @${REPO_OWNER}
/backend/src/models/ @${REPO_OWNER}

# Infrastructure and deployment
/.github/ @${REPO_OWNER}
/deployment/ @${REPO_OWNER}
/docker/ @${REPO_OWNER}
/scripts/ @${REPO_OWNER}

# Security and configuration
/security/ @${REPO_OWNER}
/.env.* @${REPO_OWNER}
/package.json @${REPO_OWNER}
/package-lock.json @${REPO_OWNER}

# Documentation
/docs/ @${REPO_OWNER}
/README.md @${REPO_OWNER}
/CONTRIBUTING.md @${REPO_OWNER}
`;

  try {
    const fs = require('fs');
    const path = require('path');
    
    const codeownersPath = path.join(process.cwd(), '.github', 'CODEOWNERS');
    
    if (!fs.existsSync(codeownersPath)) {
      fs.writeFileSync(codeownersPath, codeownersContent);
      console.log('📝 Created .github/CODEOWNERS file');
    } else {
      console.log('📝 CODEOWNERS file already exists');
    }
  } catch (error) {
    console.error('⚠️  Warning: Could not create CODEOWNERS file:', error.message);
  }
}

async function main() {
  await createCodeowners();
  await setupBranchProtection();
}

// Main execution
async function main() {
  try {
    await getConfiguration();
    await setupBranchProtection();
    
    const createCodeownersChoice = await prompt('Do you want to update CODEOWNERS file? (y/n): ');
    if (createCodeownersChoice.toLowerCase() === 'y' || createCodeownersChoice.toLowerCase() === 'yes') {
      await createCodeowners();
    }
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Create a test branch: git checkout -b feat/test-workflow');
    console.log('   2. Make a small change and commit');
    console.log('   3. Push and create a PR to test the protection rules');
    console.log('   4. Check GitHub Actions tab for workflow execution');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  setupBranchProtection,
  createCodeowners
};
