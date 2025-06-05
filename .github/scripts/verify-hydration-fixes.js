#!/usr/bin/env node

/**
 * Hydration Fix Verification Script
 * 
 * This script checks for common SSR/hydration issues in the codebase
 * that we've been fixing throughout the CardioLive project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running hydration fix verification...\n');

// Files to check
const filesToCheck = [
  'frontend/app/page.tsx',
  'frontend/app/components/forms/FormComponents.tsx',
  'frontend/app/components/ui/Toast.tsx',
  'frontend/app/components/forms/FormStateManagement.tsx',
  'frontend/app/admin/performance/page.tsx'
];

// Patterns that indicate hydration issues
const problematicPatterns = [
  {
    pattern: /Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)/g,
    description: 'Non-deterministic ID generation with Math.random()',
    severity: 'ERROR'
  },
  {
    pattern: /Date\.now\(\)/g,
    description: 'Non-deterministic timestamp generation',
    severity: 'ERROR'
  },
  {
    pattern: /window\./g,
    description: 'Direct window object access (may cause SSR issues)',
    severity: 'WARNING'
  },
  {
    pattern: /document\./g,
    description: 'Direct document object access (may cause SSR issues)',
    severity: 'WARNING'
  },
  {
    pattern: /localStorage\./g,
    description: 'Direct localStorage access (may cause SSR issues)',
    severity: 'WARNING'
  },
  {
    pattern: /sessionStorage\./g,
    description: 'Direct sessionStorage access (may cause SSR issues)',
    severity: 'WARNING'
  }
];

// Good patterns that indicate fixes
const goodPatterns = [
  {
    pattern: /useId\(\)/g,
    description: 'Using React useId hook for stable IDs'
  },
  {
    pattern: /generateId\(\)/g,
    description: 'Using custom generateId function'
  },
  {
    pattern: /useIsClient\(\)/g,
    description: 'Using useIsClient hook for client-side detection'
  },
  {
    pattern: /safeWindow\(/g,
    description: 'Using safeWindow utility'
  },
  {
    pattern: /safeDocument\(/g,
    description: 'Using safeDocument utility'
  }
];

let totalIssues = 0;
let totalFixes = 0;

function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  console.log(`\n📄 Checking: ${filePath}`);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  let fileIssues = 0;
  let fileFixes = 0;

  // Check for problematic patterns
  for (const { pattern, description, severity } of problematicPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      const icon = severity === 'ERROR' ? '❌' : '⚠️ ';
      console.log(`   ${icon} ${severity}: ${description} (${matches.length} occurrences)`);
      fileIssues += matches.length;
      
      // Show line numbers
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          console.log(`      Line ${index + 1}: ${line.trim()}`);
        }
      });
    }
  }

  // Check for good patterns (fixes)
  for (const { pattern, description } of goodPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`   ✅ ${description} (${matches.length} occurrences)`);
      fileFixes += matches.length;
    }
  }

  if (fileIssues === 0 && fileFixes > 0) {
    console.log(`   🎉 File looks good! Found ${fileFixes} hydration fixes`);
  } else if (fileIssues === 0 && fileFixes === 0) {
    console.log('   ℹ️  No hydration-related code found');
  }

  totalIssues += fileIssues;
  totalFixes += fileFixes;
}

// Check all files
for (const file of filesToCheck) {
  checkFile(file);
}

// Check if SSR utilities exist
console.log('\n🛠️  Checking SSR utilities...');
const ssrUtilsPath = path.join(process.cwd(), 'frontend/app/utils/ssr.ts');
if (fs.existsSync(ssrUtilsPath)) {
  console.log('   ✅ SSR utilities file exists');
  const content = fs.readFileSync(ssrUtilsPath, 'utf8');
  
  const requiredFunctions = ['generateId', 'useIsClient', 'safeWindow', 'safeDocument', 'useId'];
  for (const func of requiredFunctions) {
    if (content.includes(func)) {
      console.log(`   ✅ ${func} utility is available`);
    } else {
      console.log(`   ❌ ${func} utility is missing`);
    }
  }
} else {
  console.log('   ❌ SSR utilities file not found');
}

// Check if Next.js is configured for SSR
console.log('\n⚙️  Checking Next.js configuration...');
const nextConfigPath = path.join(process.cwd(), 'frontend/next.config.js');
if (fs.existsSync(nextConfigPath)) {
  console.log('   ✅ Next.js config file exists');
  const content = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (content.includes('ssr:')) {
    console.log('   ℹ️  SSR configuration found in Next.js config');
  }
} else {
  console.log('   ⚠️  Next.js config file not found');
}

// Try to build the project to check for hydration errors
console.log('\n🔨 Running build test...');
try {
  process.chdir('frontend');
  console.log('   📦 Installing dependencies...');
  execSync('npm install', { stdio: 'pipe' });
  
  console.log('   🏗️  Building project...');
  const buildOutput = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
  
  if (buildOutput.includes('Warning: Text content did not match') || 
      buildOutput.includes('Hydration failed') ||
      buildOutput.includes('Text content does not match')) {
    console.log('   ⚠️  Potential hydration warnings found in build output');
    console.log('   Check the full build output for details');
  } else {
    console.log('   ✅ Build completed without hydration errors');
  }
} catch (error) {
  console.log('   ❌ Build failed - check for compilation errors');
  console.log('   Error:', error.message);
} finally {
  process.chdir('..');
}

// Summary
console.log('\n📊 VERIFICATION SUMMARY');
console.log('=' * 50);
console.log(`Total hydration issues found: ${totalIssues}`);
console.log(`Total hydration fixes found: ${totalFixes}`);

if (totalIssues === 0) {
  console.log('\n🎉 GREAT! No hydration issues detected!');
  console.log('Your CardioLive project appears to be free of common SSR/hydration problems.');
} else {
  console.log('\n⚠️  Some hydration issues were found.');
  console.log('Please review the issues above and apply the appropriate fixes.');
}

if (totalFixes > 0) {
  console.log(`\n✅ Found ${totalFixes} implemented hydration fixes - good work!`);
}

console.log('\n💡 Recommendations:');
console.log('   • Test the application in both SSR and client-side modes');
console.log('   • Check browser dev tools for hydration warnings');
console.log('   • Use React DevTools to inspect component hydration');
console.log('   • Monitor for console errors during page loads');

console.log('\n🔗 Useful commands:');
console.log('   • npm run dev (development with SSR)');
console.log('   • npm run build && npm run start (production SSR test)');
console.log('   • Browser DevTools → Console (check for hydration warnings)');
