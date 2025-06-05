#!/usr/bin/env node

/**
 * PWA and Performance Audit Script
 * Tests PWA compliance, performance metrics, and mobile optimization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PWAAuditor {
  constructor() {
    this.results = {
      pwa: {},
      performance: {},
      mobile: {},
      security: {}
    };
  }

  // Check PWA manifest
  auditManifest() {
    console.log('🔍 Auditing PWA Manifest...');
    
    const manifestPath = path.join(__dirname, '../public/manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      this.results.pwa.manifest = { status: 'FAIL', message: 'Manifest not found' };
      return;
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'background_color', 'icons'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length === 0) {
        this.results.pwa.manifest = { 
          status: 'PASS', 
          message: 'All required manifest fields present',
          icons: manifest.icons?.length || 0,
          shortcuts: manifest.shortcuts?.length || 0
        };
      } else {
        this.results.pwa.manifest = { 
          status: 'FAIL', 
          message: `Missing fields: ${missingFields.join(', ')}` 
        };
      }
    } catch (error) {
      this.results.pwa.manifest = { 
        status: 'FAIL', 
        message: `Invalid manifest JSON: ${error.message}` 
      };
    }
  }

  // Check Service Worker
  auditServiceWorker() {
    console.log('🔍 Auditing Service Worker...');
    
    const swPath = path.join(__dirname, '../public/sw.js');
    
    if (!fs.existsSync(swPath)) {
      this.results.pwa.serviceWorker = { status: 'FAIL', message: 'Service Worker not found' };
      return;
    }

    const swContent = fs.readFileSync(swPath, 'utf8');
    
    const features = {
      install: swContent.includes('install'),
      activate: swContent.includes('activate'),
      fetch: swContent.includes('fetch'),
      cache: swContent.includes('cache'),
      offline: swContent.includes('offline'),
      push: swContent.includes('push')
    };

    const implementedFeatures = Object.entries(features).filter(([, implemented]) => implemented);
    
    this.results.pwa.serviceWorker = {
      status: implementedFeatures.length >= 4 ? 'PASS' : 'PARTIAL',
      message: `${implementedFeatures.length}/6 core features implemented`,
      features: Object.fromEntries(implementedFeatures)
    };
  }

  // Check Next.js configuration
  auditNextConfig() {
    console.log('🔍 Auditing Next.js Configuration...');
    
    const configPath = path.join(__dirname, '../next.config.ts');
    
    if (!fs.existsSync(configPath)) {
      this.results.performance.nextConfig = { status: 'FAIL', message: 'Next.js config not found' };
      return;
    }

    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const optimizations = {
      imageOptimization: configContent.includes('images'),
      headers: configContent.includes('headers'),
      compression: configContent.includes('compress'),
      bundleAnalyzer: configContent.includes('bundleAnalyzer'),
      webpack: configContent.includes('webpack')
    };

    const implementedOptimizations = Object.entries(optimizations).filter(([, implemented]) => implemented);
    
    this.results.performance.nextConfig = {
      status: implementedOptimizations.length >= 3 ? 'PASS' : 'PARTIAL',
      message: `${implementedOptimizations.length}/5 optimizations configured`,
      optimizations: Object.fromEntries(implementedOptimizations)
    };
  }

  // Check mobile optimization components
  auditMobileComponents() {
    console.log('🔍 Auditing Mobile Components...');
    
    const mobileComponents = [
      '../app/components/MobileOptimization.tsx',
      '../app/components/MobileAppShell.tsx',
      '../app/hooks/useMediaQuery.ts'
    ];

    const existingComponents = mobileComponents.filter(component => 
      fs.existsSync(path.join(__dirname, component))
    );

    this.results.mobile.components = {
      status: existingComponents.length === mobileComponents.length ? 'PASS' : 'PARTIAL',
      message: `${existingComponents.length}/${mobileComponents.length} mobile components present`,
      components: existingComponents.map(comp => path.basename(comp))
    };
  }

  // Check icon assets
  auditIconAssets() {
    console.log('🔍 Auditing Icon Assets...');
    
    const iconsDir = path.join(__dirname, '../public/icons');
    const requiredIcons = ['icon-192x192', 'icon-512x512', 'apple-touch-icon'];
    
    if (!fs.existsSync(iconsDir)) {
      this.results.pwa.icons = { status: 'FAIL', message: 'Icons directory not found' };
      return;
    }

    const iconFiles = fs.readdirSync(iconsDir);
    const foundIcons = requiredIcons.filter(icon => 
      iconFiles.some(file => file.startsWith(icon))
    );

    this.results.pwa.icons = {
      status: foundIcons.length === requiredIcons.length ? 'PASS' : 'PARTIAL',
      message: `${foundIcons.length}/${requiredIcons.length} required icons found`,
      found: foundIcons,
      total: iconFiles.length
    };
  }

  // Run all audits
  async runAudit() {
    console.log('🚀 Starting PWA & Performance Audit...\n');
    
    this.auditManifest();
    this.auditServiceWorker();
    this.auditNextConfig();
    this.auditMobileComponents();
    this.auditIconAssets();
    
    this.generateReport();
  }

  // Generate audit report
  generateReport() {
    console.log('\n📊 AUDIT REPORT');
    console.log('================\n');

    // PWA Score
    const pwaTests = Object.values(this.results.pwa);
    const pwaScore = pwaTests.filter(test => test.status === 'PASS').length;
    const pwaTotal = pwaTests.length;
    
    console.log(`🔥 PWA Compliance: ${pwaScore}/${pwaTotal} (${Math.round(pwaScore/pwaTotal*100)}%)`);
    Object.entries(this.results.pwa).forEach(([test, result]) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`   ${icon} ${test}: ${result.message}`);
    });

    // Performance Score
    const perfTests = Object.values(this.results.performance);
    const perfScore = perfTests.filter(test => test.status === 'PASS').length;
    const perfTotal = perfTests.length;
    
    console.log(`\n⚡ Performance: ${perfScore}/${perfTotal} (${Math.round(perfScore/perfTotal*100)}%)`);
    Object.entries(this.results.performance).forEach(([test, result]) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`   ${icon} ${test}: ${result.message}`);
    });

    // Mobile Score
    const mobileTests = Object.values(this.results.mobile);
    const mobileScore = mobileTests.filter(test => test.status === 'PASS').length;
    const mobileTotal = mobileTests.length;
    
    console.log(`\n📱 Mobile Optimization: ${mobileScore}/${mobileTotal} (${Math.round(mobileScore/mobileTotal*100)}%)`);
    Object.entries(this.results.mobile).forEach(([test, result]) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`   ${icon} ${test}: ${result.message}`);
    });

    // Overall Score
    const totalScore = pwaScore + perfScore + mobileScore;
    const totalTests = pwaTotal + perfTotal + mobileTotal;
    const overallScore = Math.round(totalScore/totalTests*100);
    
    console.log(`\n🎯 OVERALL SCORE: ${totalScore}/${totalTests} (${overallScore}%)`);
    
    if (overallScore >= 90) {
      console.log('🎉 Excellent! Your app is production-ready.');
    } else if (overallScore >= 70) {
      console.log('👍 Good! A few optimizations needed.');
    } else {
      console.log('⚠️  Needs improvement before production deployment.');
    }

    // Save detailed report
    const reportPath = path.join(__dirname, '../audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run audit
const auditor = new PWAAuditor();
auditor.runAudit().catch(console.error);

export default PWAAuditor;
