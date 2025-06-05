#!/usr/bin/env node

/**
 * GitHub Repository Secrets Setup Script
 * 
 * This script helps set up repository secrets for the CardioLive project.
 * Since we can't set secrets programmatically, this script provides instructions.
 */

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

function showSecretsSetup() {
  console.log('\n' + '='.repeat(60));
  colorLog('cyan', '🔐 GitHub Repository Secrets Setup');
  console.log('='.repeat(60));
  
  console.log('\n📋 Required secrets for your GitHub repository:');
  console.log('');
  
  console.log('1. 🔑 GITHUB_TOKEN');
  colorLog('green', '   Value: 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');
  console.log('   Purpose: GitHub API access and workflows');
  console.log('');
  
  console.log('2. 🏠 LHCI_GITHUB_APP_TOKEN');
  colorLog('green', '   Value: cnQAb5yjXI:69941614:fuft3gpCAmplpg');
  console.log('   Purpose: Lighthouse CI integration');
  console.log('');
  
  console.log('📝 Steps to add secrets:');
  console.log('1. Go to: https://github.com/denizsari/cardiolive/settings/secrets/actions');
  console.log('2. Click "New repository secret"');
  console.log('3. Add each secret with the exact name and value shown above');
  console.log('');
  
  console.log('✅ Optional secrets (for later deployment):');
  console.log('• STAGING_SERVER_HOST');
  console.log('• STAGING_SERVER_USER');
  console.log('• STAGING_SSH_KEY');
  console.log('• PRODUCTION_SERVER_HOST');
  console.log('• PRODUCTION_SERVER_USER');
  console.log('• PRODUCTION_SSH_KEY');
  
  console.log('\n' + '='.repeat(60));
  colorLog('magenta', '🎯 Once secrets are added, your GitHub Actions will work properly!');
  console.log('='.repeat(60) + '\n');
}

function main() {
  showSecretsSetup();
}

if (require.main === module) {
  main();
}

module.exports = { showSecretsSetup };
