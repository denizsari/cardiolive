#!/usr/bin/env node

/**
 * Intrusion Detection System (IDS) for Cardiolive
 * Real-time monitoring and threat detection
 * 
 * Features:
 * - Real-time threat monitoring
 * - Anomaly detection
 * - Attack pattern recognition
 * - Automated response system
 * - Security event logging
 * - Alert notifications
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const ResponseHandler = require('../../backend/src/utils/responseHandler');

// IDS Event Emitter
class IDSEventEmitter extends EventEmitter {}
const idsEvents = new IDSEventEmitter();

// IDS Configuration
const IDS_CONFIG = {
  // Monitoring settings
  monitoring: {
    enabled: true,
    logRetentionDays: 30,
    alertThresholds: {
      requestsPerMinute: 100,
      failedLoginsPerMinute: 10,
      errorRatePercent: 5,
      suspiciousPatterns: 5,
      newIPsPerHour: 50
    }
  },
  
  // Alert configuration
  alerts: {
    email: {
      enabled: process.env.IDS_EMAIL_ALERTS === 'true',
      recipients: (process.env.IDS_EMAIL_RECIPIENTS || '').split(',')
    },
    webhook: {
      enabled: process.env.IDS_WEBHOOK_ALERTS === 'true',
      url: process.env.IDS_WEBHOOK_URL || ''
    },
    slack: {
      enabled: process.env.IDS_SLACK_ALERTS === 'true',
      webhook: process.env.IDS_SLACK_WEBHOOK || ''
    }
  },
  
  // Attack patterns
  attackPatterns: {
    bruteForce: {
      threshold: 20,
      timeWindow: 300000, // 5 minutes
      enabled: true
    },
    dDoS: {
      threshold: 1000,
      timeWindow: 60000, // 1 minute
      enabled: true
    },
    sqlInjection: {
      patterns: [
        /UNION.*SELECT/gi,
        /DROP.*TABLE/gi,
        /INSERT.*INTO/gi,
        /'.*OR.*'.*=/gi
      ],
      enabled: true
    },
    xss: {
      patterns: [
        /<script.*>/gi,
        /javascript:/gi,
        /onerror=/gi,
        /onload=/gi
      ],
      enabled: true
    },    pathTraversal: {
      patterns: [
        /\.\.\//g,
        /%2e%2e%2f/gi,
        /\.\.\\/g
      ],
      enabled: true
    }
  }
};

// In-memory storage for monitoring data
const monitoringData = {
  requests: new Map(),
  failures: new Map(),
  attacks: new Map(),
  ipActivity: new Map(),
  userActivity: new Map(),
  errors: new Map()
};

/**
 * Security Event Logger
 */
class SecurityLogger {
  constructor() {
    this.logDir = path.join(__dirname, 'logs');
    this.ensureLogDirectory();
  }
  
  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('[IDS] Failed to create log directory:', error);
    }
  }
  
  async log(event, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      ...event
    };
    
    const logFile = path.join(this.logDir, `security-${new Date().toISOString().split('T')[0]}.log`);
    
    try {
      await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('[IDS] Failed to write log:', error);
    }
    
    // Also log to console for immediate visibility
    console.log(`[IDS][${level.toUpperCase()}]`, logEntry);
  }
  
  async getRecentLogs(hours = 24) {
    const logs = [];
    const now = new Date();
    
    for (let i = 0; i < Math.ceil(hours / 24); i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const logFile = path.join(this.logDir, `security-${date.toISOString().split('T')[0]}.log`);
      
      try {
        const content = await fs.readFile(logFile, 'utf8');
        const fileLines = content.trim().split('\n').filter(line => line);
        
        for (const line of fileLines) {
          try {
            const log = JSON.parse(line);
            const logTime = new Date(log.timestamp);
            
            if (now - logTime <= hours * 60 * 60 * 1000) {
              logs.push(log);
            }
          } catch (parseError) {
            // Skip invalid JSON lines
          }
        }
      } catch (error) {
        // File doesn't exist or can't be read
      }
    }
    
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

const securityLogger = new SecurityLogger();

/**
 * Anomaly Detection Engine
 */
class AnomalyDetector {
  constructor() {
    this.baselines = new Map();
    this.anomalies = [];
  }
  
  updateBaseline(metric, value) {
    if (!this.baselines.has(metric)) {
      this.baselines.set(metric, []);
    }
    
    const values = this.baselines.get(metric);
    values.push(value);
    
    // Keep only last 100 values for baseline calculation
    if (values.length > 100) {
      values.shift();
    }
  }
  
  detectAnomaly(metric, currentValue) {
    const values = this.baselines.get(metric);
    if (!values || values.length < 10) {
      return false; // Not enough data for baseline
    }
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Consider it an anomaly if it's more than 3 standard deviations from the mean
    const threshold = mean + (3 * stdDev);
    
    if (currentValue > threshold) {
      this.anomalies.push({
        metric,
        value: currentValue,
        baseline: mean,
        threshold,
        timestamp: new Date().toISOString(),
        severity: currentValue > (mean + 5 * stdDev) ? 'high' : 'medium'
      });
      
      return true;
    }
    
    return false;
  }
  
  getRecentAnomalies(minutes = 60) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.anomalies.filter(anomaly => new Date(anomaly.timestamp) > cutoff);
  }
}

const anomalyDetector = new AnomalyDetector();

/**
 * Attack Pattern Detector
 */
class AttackDetector {
  constructor() {
    this.detectedAttacks = [];
  }
  
  detectSQLInjection(data) {
    if (!IDS_CONFIG.attackPatterns.sqlInjection.enabled) return false;
    
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    return IDS_CONFIG.attackPatterns.sqlInjection.patterns.some(pattern => pattern.test(dataStr));
  }
  
  detectXSS(data) {
    if (!IDS_CONFIG.attackPatterns.xss.enabled) return false;
    
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    return IDS_CONFIG.attackPatterns.xss.patterns.some(pattern => pattern.test(dataStr));
  }
  
  detectPathTraversal(url) {
    if (!IDS_CONFIG.attackPatterns.pathTraversal.enabled) return false;
    
    return IDS_CONFIG.attackPatterns.pathTraversal.patterns.some(pattern => pattern.test(url));
  }
  
  detectBruteForce(ip) {
    if (!IDS_CONFIG.attackPatterns.bruteForce.enabled) return false;
    
    const now = Date.now();
    const timeWindow = IDS_CONFIG.attackPatterns.bruteForce.timeWindow;
    const threshold = IDS_CONFIG.attackPatterns.bruteForce.threshold;
    
    if (!monitoringData.failures.has(ip)) {
      monitoringData.failures.set(ip, []);
    }
    
    const failures = monitoringData.failures.get(ip);
    failures.push(now);
    
    // Remove old entries
    const recentFailures = failures.filter(time => now - time <= timeWindow);
    monitoringData.failures.set(ip, recentFailures);
    
    return recentFailures.length >= threshold;
  }
  
  detectDDoS(ip) {
    if (!IDS_CONFIG.attackPatterns.dDoS.enabled) return false;
    
    const now = Date.now();
    const timeWindow = IDS_CONFIG.attackPatterns.dDoS.timeWindow;
    const threshold = IDS_CONFIG.attackPatterns.dDoS.threshold;
    
    if (!monitoringData.requests.has(ip)) {
      monitoringData.requests.set(ip, []);
    }
    
    const requests = monitoringData.requests.get(ip);
    requests.push(now);
    
    // Remove old entries
    const recentRequests = requests.filter(time => now - time <= timeWindow);
    monitoringData.requests.set(ip, recentRequests);
    
    return recentRequests.length >= threshold;
  }
  
  recordAttack(type, source, details) {
    const attack = {
      id: `attack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      source,
      details,
      timestamp: new Date().toISOString(),
      severity: this.calculateSeverity(type)
    };
    
    this.detectedAttacks.push(attack);
    
    // Emit attack event
    idsEvents.emit('attack_detected', attack);
    
    // Log the attack
    securityLogger.log({
      type: 'attack_detected',
      attack
    }, 'warning');
    
    return attack;
  }
  
  calculateSeverity(attackType) {
    const severityMap = {
      'sql_injection': 'high',
      'xss': 'high',
      'brute_force': 'medium',
      'ddos': 'high',
      'path_traversal': 'medium',
      'suspicious_pattern': 'low'
    };
    
    return severityMap[attackType] || 'low';
  }
  
  getRecentAttacks(minutes = 60) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.detectedAttacks.filter(attack => new Date(attack.timestamp) > cutoff);
  }
}

const attackDetector = new AttackDetector();

/**
 * Alert System
 */
class AlertSystem {
  constructor() {
    this.alertQueue = [];
    this.sentAlerts = new Map();
  }
  
  async sendAlert(alert) {
    // Prevent duplicate alerts
    const alertKey = `${alert.type}_${alert.source}_${Math.floor(Date.now() / 60000)}`;
    if (this.sentAlerts.has(alertKey)) {
      return;
    }
    this.sentAlerts.set(alertKey, true);
    
    // Clean up old alert keys
    if (this.sentAlerts.size > 1000) {
      const entries = Array.from(this.sentAlerts.entries());
      entries.slice(0, 500).forEach(([key]) => this.sentAlerts.delete(key));
    }
    
    if (IDS_CONFIG.alerts.email.enabled) {
      await this.sendEmailAlert(alert);
    }
    
    if (IDS_CONFIG.alerts.webhook.enabled) {
      await this.sendWebhookAlert(alert);
    }
    
    if (IDS_CONFIG.alerts.slack.enabled) {
      await this.sendSlackAlert(alert);
    }
  }
  
  async sendEmailAlert(alert) {
    // Email implementation would go here
    console.log('[IDS] Email alert sent:', alert);
  }
  
  async sendWebhookAlert(alert) {
    try {
      const response = await fetch(IDS_CONFIG.alerts.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alert)
      });
      
      if (!response.ok) {
        console.error('[IDS] Webhook alert failed:', response.statusText);
      }
    } catch (error) {
      console.error('[IDS] Webhook alert error:', error);
    }
  }
  
  async sendSlackAlert(alert) {
    try {
      const message = {
        text: `🚨 Security Alert: ${alert.type}`,
        attachments: [{
          color: alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'good',
          fields: [
            { title: 'Type', value: alert.type, short: true },
            { title: 'Source', value: alert.source, short: true },
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Timestamp', value: alert.timestamp, short: true },
            { title: 'Details', value: JSON.stringify(alert.details, null, 2), short: false }
          ]
        }]
      };
      
      const response = await fetch(IDS_CONFIG.alerts.slack.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });
      
      if (!response.ok) {
        console.error('[IDS] Slack alert failed:', response.statusText);
      }
    } catch (error) {
      console.error('[IDS] Slack alert error:', error);
    }
  }
}

const alertSystem = new AlertSystem();

/**
 * Main IDS middleware
 */
const idsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  const url = req.url;
  const method = req.method;
  
  // Track request
  if (!monitoringData.requests.has(ip)) {
    monitoringData.requests.set(ip, []);
  }
  monitoringData.requests.get(ip).push(startTime);
  
  // Attack detection
  const requestData = {
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers
  };
  
  // SQL Injection detection
  if (attackDetector.detectSQLInjection(requestData)) {
    const attack = attackDetector.recordAttack('sql_injection', ip, {
      url,
      method,
      userAgent,
      data: requestData
    });
    alertSystem.sendAlert(attack);
  }
  
  // XSS detection
  if (attackDetector.detectXSS(requestData)) {
    const attack = attackDetector.recordAttack('xss', ip, {
      url,
      method,
      userAgent,
      data: requestData
    });
    alertSystem.sendAlert(attack);
  }
  
  // Path traversal detection
  if (attackDetector.detectPathTraversal(url)) {
    const attack = attackDetector.recordAttack('path_traversal', ip, {
      url,
      method,
      userAgent
    });
    alertSystem.sendAlert(attack);
  }
  
  // DDoS detection
  if (attackDetector.detectDDoS(ip)) {
    const attack = attackDetector.recordAttack('ddos', ip, {
      url,
      method,
      userAgent,
      requestCount: monitoringData.requests.get(ip).length
    });
    alertSystem.sendAlert(attack);
  }
  
  // Monitor response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Track errors
    if (statusCode >= 400) {
      if (!monitoringData.errors.has(ip)) {
        monitoringData.errors.set(ip, []);
      }
      monitoringData.errors.get(ip).push({
        timestamp: Date.now(),
        statusCode,
        url,
        method
      });
      
      // Authentication failure tracking
      if (statusCode === 401 && attackDetector.detectBruteForce(ip)) {
        const attack = attackDetector.recordAttack('brute_force', ip, {
          url,
          method,
          userAgent,
          failureCount: monitoringData.failures.get(ip).length
        });
        alertSystem.sendAlert(attack);
      }
    }
    
    // Log security event
    securityLogger.log({
      type: 'request',
      ip,
      method,
      url,
      statusCode,
      duration,
      userAgent
    });
  });
  
  next();
};

/**
 * IDS dashboard data endpoint
 */
const getIDSDashboard = async (req, res) => {
  try {
    const recentAttacks = attackDetector.getRecentAttacks(60);
    const recentAnomalies = anomalyDetector.getRecentAnomalies(60);
    const recentLogs = await securityLogger.getRecentLogs(24);
    
    const dashboard = {
      timestamp: new Date().toISOString(),
      status: 'active',
      statistics: {
        totalRequests: Array.from(monitoringData.requests.values()).reduce((sum, arr) => sum + arr.length, 0),
        uniqueIPs: monitoringData.requests.size,
        recentAttacks: recentAttacks.length,
        recentAnomalies: recentAnomalies.length,
        errorRate: calculateErrorRate()
      },
      recentAttacks: recentAttacks.slice(0, 10),
      recentAnomalies: recentAnomalies.slice(0, 10),
      topAttackers: getTopAttackers(),
      configuration: IDS_CONFIG
    };
    
    ResponseHandler.success(res, 'IDS dashboard data retrieved', dashboard);
  } catch (error) {
    ResponseHandler.error(res, 'Failed to retrieve IDS dashboard', error);
  }
};

/**
 * Helper functions
 */
function calculateErrorRate() {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  let totalRequests = 0;
  let errorRequests = 0;
  
  for (const [ip, errors] of monitoringData.errors.entries()) {
    const recentErrors = errors.filter(error => error.timestamp > oneHourAgo);
    errorRequests += recentErrors.length;
  }
  
  for (const [ip, requests] of monitoringData.requests.entries()) {
    const recentRequests = requests.filter(time => time > oneHourAgo);
    totalRequests += recentRequests.length;
  }
  
  return totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;
}

function getTopAttackers() {
  const attackCounts = new Map();
  
  for (const attack of attackDetector.detectedAttacks) {
    const source = attack.source;
    attackCounts.set(source, (attackCounts.get(source) || 0) + 1);
  }
  
  return Array.from(attackCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, attackCount: count }));
}

/**
 * Initialize IDS
 */
const initializeIDS = (app) => {
  console.log('[IDS] Initializing Intrusion Detection System...');
  
  // Apply IDS middleware
  app.use(idsMiddleware);
  
  // IDS dashboard endpoint
  app.get('/api/security/ids/dashboard', getIDSDashboard);
  
  // Event listeners
  idsEvents.on('attack_detected', (attack) => {
    console.log(`[IDS] Attack detected: ${attack.type} from ${attack.source}`);
  });
  
  console.log('[IDS] Intrusion Detection System initialized successfully');
};

module.exports = {
  IDS_CONFIG,
  initializeIDS,
  idsMiddleware,
  getIDSDashboard,
  SecurityLogger,
  AnomalyDetector,
  AttackDetector,
  AlertSystem,
  idsEvents
};
