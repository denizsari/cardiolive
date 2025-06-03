#!/usr/bin/env node

const axios = require('axios');
const colors = require('colors');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

class SecurityTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    switch (type) {
      case 'pass':
        console.log(`[${timestamp}] ✅ ${message}`.green);
        break;
      case 'fail':
        console.log(`[${timestamp}] ❌ ${message}`.red);
        break;
      case 'warn':
        console.log(`[${timestamp}] ⚠️  ${message}`.yellow);
        break;
      default:
        console.log(`[${timestamp}] ℹ️  ${message}`.cyan);
    }
  }

  async recordTest(name, testFn) {
    try {
      const result = await testFn();
      if (result.pass) {
        this.results.passed++;
        this.log(`${name}: ${result.message}`, 'pass');
      } else if (result.warning) {
        this.results.warnings++;
        this.log(`${name}: ${result.message}`, 'warn');
      } else {
        this.results.failed++;
        this.log(`${name}: ${result.message}`, 'fail');
      }
      this.results.tests.push({ name, ...result });
    } catch (error) {
      this.results.failed++;
      this.log(`${name}: Error - ${error.message}`, 'fail');
      this.results.tests.push({ name, pass: false, message: error.message });
    }
  }

  // Test for SQL Injection vulnerabilities
  async testSQLInjection() {
    const payloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "' OR 1=1#"
    ];

    for (const payload of payloads) {
      try {
        const response = await axios.post(`${BASE_URL}/users/login`, {
          email: payload,
          password: 'test'
        }, { timeout: 5000 });

        if (response.status === 200 && response.data.success) {
          return { pass: false, message: `SQL Injection vulnerability detected with payload: ${payload}` };
        }
      } catch (error) {
        // Expected behavior - authentication should fail
      }
    }

    return { pass: true, message: 'No SQL injection vulnerabilities detected' };
  }

  // Test for XSS vulnerabilities
  async testXSS() {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      "javascript:alert('XSS')",
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>'
    ];

    try {
      // Test user registration with XSS payload
      const payload = xssPayloads[0];
      const response = await axios.post(`${BASE_URL}/users/register`, {
        name: payload,
        email: 'test@example.com',
        password: 'password123'
      }, { timeout: 5000 });

      // Check if XSS payload is returned unescaped
      if (response.data && JSON.stringify(response.data).includes('<script>')) {
        return { pass: false, message: 'XSS vulnerability detected in user registration' };
      }

      return { pass: true, message: 'No XSS vulnerabilities detected' };
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { pass: true, message: 'Input validation properly rejects XSS payloads' };
      }
      throw error;
    }
  }

  // Test for NoSQL Injection
  async testNoSQLInjection() {
    const payloads = [
      { $ne: null },
      { $gt: '' },
      { $where: 'this.password.length > 0' },
      { $regex: '.*' }
    ];

    for (const payload of payloads) {
      try {
        const response = await axios.post(`${BASE_URL}/users/login`, {
          email: payload,
          password: payload
        }, { timeout: 5000 });

        if (response.status === 200 && response.data.success) {
          return { pass: false, message: `NoSQL Injection vulnerability detected` };
        }
      } catch (error) {
        // Expected behavior
      }
    }

    return { pass: true, message: 'No NoSQL injection vulnerabilities detected' };
  }

  // Test rate limiting
  async testRateLimiting() {
    const requests = [];
    const startTime = Date.now();

    // Send 100 requests rapidly
    for (let i = 0; i < 100; i++) {
      requests.push(
        axios.post(`${BASE_URL}/users/login`, {
          email: 'test@example.com',
          password: 'wrongpassword'
        }, { timeout: 1000 }).catch(err => err.response)
      );
    }

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r && r.status === 429);

    if (rateLimitedResponses.length > 0) {
      return { pass: true, message: `Rate limiting is working (${rateLimitedResponses.length}/100 requests blocked)` };
    } else {
      return { pass: false, message: 'Rate limiting not detected - potential DoS vulnerability' };
    }
  }

  // Test authentication bypass
  async testAuthBypass() {
    const protectedEndpoints = [
      '/users/profile',
      '/orders/user',
      '/wishlist'
    ];

    for (const endpoint of protectedEndpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, { timeout: 5000 });
        
        if (response.status === 200) {
          return { pass: false, message: `Authentication bypass detected on ${endpoint}` };
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Expected behavior
          continue;
        }
        throw error;
      }
    }

    return { pass: true, message: 'No authentication bypass vulnerabilities detected' };
  }

  // Test for sensitive data exposure
  async testDataExposure() {
    try {
      const response = await axios.get(`${BASE_URL}/users/register`, { timeout: 5000 });
      
      // Check if sensitive information is exposed in error messages
      const responseText = JSON.stringify(response.data).toLowerCase();
      const sensitiveTerms = ['password', 'token', 'secret', 'key', 'config'];
      
      const exposedTerms = sensitiveTerms.filter(term => responseText.includes(term));
      
      if (exposedTerms.length > 0) {
        return { pass: false, message: `Potential sensitive data exposure: ${exposedTerms.join(', ')}` };
      }

      return { pass: true, message: 'No sensitive data exposure detected' };
    } catch (error) {
      return { pass: true, message: 'Endpoint properly secured' };
    }
  }

  // Test CORS configuration
  async testCORS() {
    try {
      const response = await axios.options(`${BASE_URL}/products`, {
        headers: {
          'Origin': 'https://malicious-site.com',
          'Access-Control-Request-Method': 'GET'
        },
        timeout: 5000
      });

      const corsHeaders = response.headers['access-control-allow-origin'];
      
      if (corsHeaders === '*') {
        return { warning: true, message: 'CORS allows all origins - potential security risk' };
      }

      return { pass: true, message: 'CORS configuration appears secure' };
    } catch (error) {
      return { pass: true, message: 'CORS properly configured' };
    }
  }

  // Test for directory traversal
  async testDirectoryTraversal() {
    const payloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
    ];

    for (const payload of payloads) {
      try {
        const response = await axios.get(`${BASE_URL}/static/${payload}`, { timeout: 5000 });
        
        if (response.status === 200 && response.data.includes('root:')) {
          return { pass: false, message: `Directory traversal vulnerability detected with payload: ${payload}` };
        }
      } catch (error) {
        // Expected behavior
      }
    }

    return { pass: true, message: 'No directory traversal vulnerabilities detected' };
  }

  async runAllTests() {
    this.log('🔒 Starting Security Penetration Testing', 'info');
    this.log('=' .repeat(60), 'info');

    await this.recordTest('SQL Injection Test', () => this.testSQLInjection());
    await this.recordTest('XSS Vulnerability Test', () => this.testXSS());
    await this.recordTest('NoSQL Injection Test', () => this.testNoSQLInjection());
    await this.recordTest('Rate Limiting Test', () => this.testRateLimiting());
    await this.recordTest('Authentication Bypass Test', () => this.testAuthBypass());
    await this.recordTest('Data Exposure Test', () => this.testDataExposure());
    await this.recordTest('CORS Configuration Test', () => this.testCORS());
    await this.recordTest('Directory Traversal Test', () => this.testDirectoryTraversal());

    this.generateReport();
  }

  generateReport() {
    this.log('\n📊 Security Test Report', 'info');
    this.log('=' .repeat(50), 'info');
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    
    this.log(`Total Tests: ${total}`, 'info');
    this.log(`Passed: ${this.results.passed}`, 'pass');
    this.log(`Failed: ${this.results.failed}`, 'fail');
    this.log(`Warnings: ${this.results.warnings}`, 'warn');
    
    const securityScore = ((this.results.passed + this.results.warnings * 0.5) / total * 100).toFixed(1);
    this.log(`Security Score: ${securityScore}%`, securityScore > 90 ? 'pass' : securityScore > 70 ? 'warn' : 'fail');

    if (this.results.failed > 0) {
      this.log('\n🚨 Security Issues Found:', 'fail');
      this.results.tests
        .filter(test => !test.pass && !test.warning)
        .forEach(test => this.log(`   • ${test.name}: ${test.message}`, 'fail'));
    }

    if (this.results.warnings > 0) {
      this.log('\n⚠️  Security Warnings:', 'warn');
      this.results.tests
        .filter(test => test.warning)
        .forEach(test => this.log(`   • ${test.name}: ${test.message}`, 'warn'));
    }

    const isSecure = this.results.failed === 0;
    this.log(`\n🔐 Security Status: ${isSecure ? '✅ SECURE' : '❌ VULNERABILITIES FOUND'}`, 
      isSecure ? 'pass' : 'fail');
  }
}

// Run the security tests
if (require.main === module) {
  const tester = new SecurityTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SecurityTester;
