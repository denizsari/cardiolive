const prometheus = require('prom-client');

// Create a Registry which registers the metrics
const register = new prometheus.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'cardiolive-backend'
});

// Enable the collection of default metrics
prometheus.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5, 10]
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const databaseConnections = new prometheus.Gauge({
  name: 'database_connections',
  help: 'Number of active database connections'
});

const errorRate = new prometheus.Counter({
  name: 'application_errors_total',
  help: 'Total number of application errors',
  labelNames: ['type', 'severity']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseConnections);
register.registerMetric(errorRate);

// Middleware to collect HTTP metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const method = req.method;
    const status = res.statusCode;
    
    httpRequestDuration.observe(
      { method, route, status },
      duration
    );
    
    httpRequestTotal.inc({ method, route, status });
  });
  
  next();
};

// Health check with metrics
const healthCheck = async () => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };

  // Check database connection
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      healthData.database = 'connected';
      databaseConnections.set(1);
    } else {
      healthData.database = 'disconnected';
      healthData.status = 'unhealthy';
      databaseConnections.set(0);
    }
  } catch (error) {
    healthData.database = 'error';
    healthData.status = 'unhealthy';
    databaseConnections.set(0);
  }

  return healthData;
};

module.exports = {
  register,
  metricsMiddleware,
  healthCheck,
  metrics: {
    httpRequestDuration,
    httpRequestTotal,
    activeConnections,
    databaseConnections,
    errorRate
  }
};
