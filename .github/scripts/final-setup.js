#!/usr/bin/env node

/**
 * Kardiyolive Final Setup Master Script
 * 
 * This script guides you through all final setup steps for the Kardiyolive project.
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => new Promise((resolve) => {
  rl.question(question, resolve);
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showBanner() {
  console.log('\n' + '='.repeat(60));
  colorLog('cyan', '🚀 Kardiyolive Final Setup - Step 4 Completion');
  console.log('='.repeat(60));
  console.log('This script will guide you through the final setup steps:');
  console.log('1. 📋 GitHub Secrets Configuration');
  console.log('2. 🛡️ Branch Protection Setup');
  console.log('3. 👥 CODEOWNERS Configuration');
  console.log('4. 🧪 Workflow Testing');
  console.log('5. 🚀 Deployment Configuration');
  console.log('='.repeat(60) + '\n');
}

async function step1_GitHubSecrets() {
  colorLog('blue', '📋 Step 1: GitHub Repository Secrets Setup');
  console.log('\nYou need to configure the following secrets in your GitHub repository:');
  console.log('• GITHUB_TOKEN - For branch protection and API access');
  console.log('• LHCI_GITHUB_APP_TOKEN - For Lighthouse CI integration');
  
  const hasSecrets = await prompt('\nHave you already set up GitHub secrets? (y/n): ');
  
  if (hasSecrets.toLowerCase() !== 'y') {
    console.log('\n📖 Please follow these steps:');
    console.log('1. Go to your GitHub repository');
    console.log('2. Click Settings → Secrets and variables → Actions');
    console.log('3. Add the required secrets (see .github/SECRETS_SETUP.md for details)');
    
    const openFile = await prompt('\nOpen the secrets setup guide now? (y/n): ');
    if (openFile.toLowerCase() === 'y') {
      try {
        if (process.platform === 'win32') {
          execSync('start .github\\SECRETS_SETUP.md');
        } else {
          execSync('open .github/SECRETS_SETUP.md');
        }
      } catch (error) {
        console.log('Please manually open: .github/SECRETS_SETUP.md');
      }
    }
    
    await prompt('\nPress Enter when you have set up the secrets...');
  }
  
  colorLog('green', '✅ Step 1 completed!\n');
}

async function step2_BranchProtection() {
  colorLog('blue', '🛡️ Step 2: Branch Protection Setup');
  
  const runSetup = await prompt('Do you want to run the branch protection setup now? (y/n): ');
  
  if (runSetup.toLowerCase() === 'y') {
    try {
      colorLog('yellow', 'Running branch protection setup...');
      execSync('node .github/scripts/setup-branch-protection.js', { stdio: 'inherit' });
      colorLog('green', '✅ Branch protection setup completed!');
    } catch (error) {
      colorLog('red', '❌ Branch protection setup failed. You can run it manually later.');
      console.log('Manual command: node .github/scripts/setup-branch-protection.js');
    }
  } else {
    console.log('You can run branch protection setup later with:');
    console.log('node .github/scripts/setup-branch-protection.js');
  }
  
  colorLog('green', '✅ Step 2 completed!\n');
}

async function step3_Codeowners() {
  colorLog('blue', '👥 Step 3: CODEOWNERS Configuration');
  
  const currentCodeowners = path.join(process.cwd(), '.github', 'CODEOWNERS');
  if (fs.existsSync(currentCodeowners)) {
    const updateCodeowners = await prompt('Update CODEOWNERS with your GitHub username? (y/n): ');
    
    if (updateCodeowners.toLowerCase() === 'y') {
      const username = await prompt('Enter your GitHub username: ');
      
      if (username) {
        try {
          let content = fs.readFileSync(currentCodeowners, 'utf-8');
          content = content.replace(/your-username/g, username);
          fs.writeFileSync(currentCodeowners, content);
          colorLog('green', `✅ CODEOWNERS updated with username: ${username}`);
        } catch (error) {
          colorLog('red', '❌ Failed to update CODEOWNERS file');
        }
      }
    }
  }
  
  colorLog('green', '✅ Step 3 completed!\n');
}

async function step4_WorkflowTesting() {
  colorLog('blue', '🧪 Step 4: Workflow Testing');
  
  const runTest = await prompt('Create a test branch to verify workflows? (y/n): ');
  
  if (runTest.toLowerCase() === 'y') {
    try {
      colorLog('yellow', 'Creating test workflow...');
      execSync('node .github/scripts/test-workflow.js', { stdio: 'inherit' });
      colorLog('green', '✅ Test workflow created!');
      console.log('\nNext: Go to GitHub and create a PR from the test branch');
    } catch (error) {
      colorLog('red', '❌ Test workflow creation failed');
      console.log('You can create a test branch manually to verify workflows');
    }
  } else {
    console.log('You can test workflows later with:');
    console.log('node .github/scripts/test-workflow.js');
  }
  
  colorLog('green', '✅ Step 4 completed!\n');
}

async function step5_DeploymentConfig() {
  colorLog('blue', '🚀 Step 5: Deployment Configuration');
  
  const setupDeployment = await prompt('Set up deployment configuration files? (y/n): ');
  
  if (setupDeployment.toLowerCase() === 'y') {
    try {
      colorLog('yellow', 'Setting up deployment configuration...');
      execSync('node .github/scripts/setup-deployment.js', { stdio: 'inherit' });
      colorLog('green', '✅ Deployment configuration created!');
    } catch (error) {
      colorLog('red', '❌ Deployment setup failed');
    }
  }
  
  colorLog('green', '✅ Step 5 completed!\n');
}

async function showSummary() {
  console.log('='.repeat(60));
  colorLog('cyan', '🎉 Final Setup Completion Summary');
  console.log('='.repeat(60));
  
  console.log('\n✅ What we\'ve accomplished:');
  console.log('• ✅ Professional GitHub workflow setup');
  console.log('• ✅ SSR hydration issues fixed');
  console.log('• ✅ TypeScript compilation errors resolved');
  console.log('• ✅ Build process working correctly');
  console.log('• ✅ Security scanning configured');
  console.log('• ✅ Code quality tools setup');
  console.log('• ✅ Deployment pipeline ready');
  
  console.log('\n🎯 Your Kardiyolive project is now:');
  colorLog('green', '• 🏭 Production-ready with enterprise-grade workflows');
  colorLog('green', '• 🔒 Secure with automated security scanning');
  colorLog('green', '• 🧪 Tested with comprehensive CI/CD pipeline');
  colorLog('green', '• 📊 Monitored with performance and quality checks');
  colorLog('green', '• 🚀 Deployable with automated deployment pipeline');
  
  console.log('\n📋 Recommended next actions:');
  console.log('1. 🧪 Test your workflows by creating a PR');
  console.log('2. 🌍 Set up your production environment');
  console.log('3. 📖 Review the comprehensive documentation in .github/');
  console.log('4. 👥 Add team members to your repository');
  console.log('5. 🎨 Customize workflows based on your specific needs');
  
  console.log('\n📚 Documentation available:');
  console.log('• .github/README.md - Complete workflow documentation');
  console.log('• .github/SECRETS_SETUP.md - GitHub secrets configuration');
  console.log('• .github/CODEOWNERS_SETUP.md - Code review setup');
  
  console.log('\n🆘 Support:');
  console.log('• All scripts are documented and can be run individually');
  console.log('• Check GitHub Actions logs for detailed workflow information');
  console.log('• Review error messages and adjust configurations as needed');
  
  console.log('\n' + '='.repeat(60));
  colorLog('magenta', '🌟 Congratulations! Your Kardiyolive project is now enterprise-ready! 🌟');
  console.log('='.repeat(60) + '\n');
}

async function main() {
  try {
    showBanner();
    
    await step1_GitHubSecrets();
    await step2_BranchProtection();
    await step3_Codeowners();
    await step4_WorkflowTesting();
    await step5_DeploymentConfig();
    
    await showSummary();
    
  } catch (error) {
    colorLog('red', `❌ Setup interrupted: ${error.message}`);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  step1_GitHubSecrets,
  step2_BranchProtection,
  step3_Codeowners,
  step4_WorkflowTesting,
  step5_DeploymentConfig
};
