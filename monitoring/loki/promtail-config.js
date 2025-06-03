/**
 * Promtail Configuration Generator for Cardiolive Platform
 * Collects and ships logs to Loki for centralized log management
 */

const fs = require('fs');
const path = require('path');

class PromtailConfigGenerator {
  constructor() {
    this.config = {
      server: {
        http_listen_port: 9080,
        grpc_listen_port: 0
      },
      positions: {
        filename: '/tmp/positions.yaml'
      },
      clients: [
        {
          url: 'http://loki:3100/loki/api/v1/push'
        }
      ],
      scrape_configs: []
    };
  }

  /**
   * Add application log scraping configuration
   */
  addApplicationLogs() {
    // Backend application logs
    this.config.scrape_configs.push({
      job_name: 'cardiolive-backend',
      static_configs: [
        {
          targets: ['localhost'],
          labels: {
            job: 'cardiolive-backend',
            environment: process.env.NODE_ENV || 'development',
            service: 'backend',
            __path__: '/app/backend/logs/*.log'
          }
        }
      ],
      pipeline_stages: [
        {
          match: {
            selector: '{job="cardiolive-backend"}',
            stages: [
              {
                json: {
                  expressions: {
                    level: 'level',
                    message: 'message',
                    timestamp: 'timestamp',
                    userId: 'userId',
                    method: 'method',
                    url: 'url',
                    statusCode: 'statusCode',
                    responseTime: 'responseTime'
                  }
                }
              },
              {
                timestamp: {
                  source: 'timestamp',
                  format: 'RFC3339'
                }
              },
              {
                labels: {
                  level: '',
                  method: '',
                  statusCode: ''
                }
              }
            ]
          }
        }
      ]
    });

    // Nginx access logs
    this.config.scrape_configs.push({
      job_name: 'nginx-access',
      static_configs: [
        {
          targets: ['localhost'],
          labels: {
            job: 'nginx-access',
            service: 'nginx',
            log_type: 'access',
            __path__: '/var/log/nginx/access.log'
          }
        }
      ],
      pipeline_stages: [
        {
          regex: {
            expression: '^(?P<remote_addr>[\\w\\.]+) - (?P<remote_user>\\S+) \\[(?P<time_local>[^\\]]+)\\] "(?P<method>\\S+) (?P<request_uri>\\S+) (?P<protocol>\\S+)" (?P<status>\\d+) (?P<body_bytes_sent>\\d+) "(?P<http_referer>[^"]*)" "(?P<http_user_agent>[^"]*)"'
          }
        },
        {
          timestamp: {
            source: 'time_local',
            format: '02/Jan/2006:15:04:05 -0700'
          }
        },
        {
          labels: {
            method: '',
            status: '',
            remote_addr: ''
          }
        }
      ]
    });

    // Nginx error logs
    this.config.scrape_configs.push({
      job_name: 'nginx-error',
      static_configs: [
        {
          targets: ['localhost'],
          labels: {
            job: 'nginx-error',
            service: 'nginx',
            log_type: 'error',
            __path__: '/var/log/nginx/error.log'
          }
        }
      ]
    });

    // MongoDB logs
    this.config.scrape_configs.push({
      job_name: 'mongodb',
      static_configs: [
        {
          targets: ['localhost'],
          labels: {
            job: 'mongodb',
            service: 'mongodb',
            __path__: '/var/log/mongodb/mongod.log'
          }
        }
      ],
      pipeline_stages: [
        {
          regex: {
            expression: '^(?P<timestamp>\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}[+-]\\d{4}) (?P<severity>\\w+)\\s+(?P<component>\\w+)\\s+\\[(?P<context>[^\\]]+)\\] (?P<message>.*)'
          }
        },
        {
          timestamp: {
            source: 'timestamp',
            format: 'RFC3339'
          }
        },
        {
          labels: {
            severity: '',
            component: ''
          }
        }
      ]
    });

    // Security logs (WAF and IDS)
    this.config.scrape_configs.push({
      job_name: 'security-logs',
      static_configs: [
        {
          targets: ['localhost'],
          labels: {
            job: 'security-logs',
            service: 'security',
            __path__: '/app/logs/security/*.log'
          }
        }
      ],
      pipeline_stages: [
        {
          match: {
            selector: '{job="security-logs"}',
            stages: [
              {
                json: {
                  expressions: {
                    timestamp: 'timestamp',
                    level: 'level',
                    event_type: 'event_type',
                    ip: 'ip',
                    attack_type: 'attack_type',
                    blocked: 'blocked'
                  }
                }
              },
              {
                labels: {
                  level: '',
                  event_type: '',
                  attack_type: ''
                }
              }
            ]
          }
        }
      ]
    });

    return this;
  }

  /**
   * Add system logs configuration
   */
  addSystemLogs() {
    // System logs
    this.config.scrape_configs.push({
      job_name: 'syslog',
      static_configs: [
        {
          targets: ['localhost'],
          labels: {
            job: 'syslog',
            service: 'system',
            __path__: '/var/log/syslog'
          }
        }
      ]
    });

    // Docker container logs
    this.config.scrape_configs.push({
      job_name: 'docker-containers',
      static_configs: [
        {
          targets: ['localhost'],
          labels: {
            job: 'docker-containers',
            service: 'docker',
            __path__: '/var/lib/docker/containers/*/*-json.log'
          }
        }
      ],
      pipeline_stages: [
        {
          json: {
            expressions: {
              log: 'log',
              stream: 'stream',
              time: 'time'
            }
          }
        },
        {
          timestamp: {
            source: 'time',
            format: 'RFC3339Nano'
          }
        },
        {
          output: {
            source: 'log'
          }
        }
      ]
    });

    return this;
  }

  /**
   * Generate the complete Promtail configuration
   */
  generateConfig() {
    this.addApplicationLogs();
    this.addSystemLogs();
    return this.config;
  }

  /**
   * Save configuration to YAML file
   */
  saveConfig(outputPath = './monitoring/loki/promtail-config.yml') {
    const yaml = require('yaml');
    const config = this.generateConfig();
    const yamlContent = yaml.stringify(config, {
      lineWidth: 0,
      indent: 2
    });

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, yamlContent);
    console.log(`✅ Promtail configuration saved to ${outputPath}`);
    return outputPath;
  }

  /**
   * Generate Grafana dashboard for logs
   */
  generateLogsDashboard() {
    const dashboard = {
      dashboard: {
        id: null,
        title: "Cardiolive - Log Analysis Dashboard",
        description: "Centralized log analysis for Cardiolive e-commerce platform",
        tags: ["cardiolive", "logs", "monitoring"],
        timezone: "browser",
        panels: [
          {
            id: 1,
            title: "Log Volume by Service",
            type: "graph",
            targets: [
              {
                expr: 'sum by (service) (rate({job=~"cardiolive-.*|nginx-.*|mongodb|security-logs"}[5m]))',
                legendFormat: "{{service}}"
              }
            ],
            gridPos: { h: 8, w: 12, x: 0, y: 0 }
          },
          {
            id: 2,
            title: "Error Logs Rate",
            type: "stat",
            targets: [
              {
                expr: 'sum(rate({level="error"}[5m]))',
                legendFormat: "Errors/sec"
              }
            ],
            fieldConfig: {
              defaults: {
                thresholds: {
                  steps: [
                    { color: "green", value: null },
                    { color: "yellow", value: 1 },
                    { color: "red", value: 5 }
                  ]
                }
              }
            },
            gridPos: { h: 8, w: 6, x: 12, y: 0 }
          },
          {
            id: 3,
            title: "Security Events",
            type: "logs",
            targets: [
              {
                expr: '{job="security-logs"} |= "attack"'
              }
            ],
            gridPos: { h: 8, w: 6, x: 18, y: 0 }
          },
          {
            id: 4,
            title: "Top Error Messages",
            type: "table",
            targets: [
              {
                expr: 'topk(10, sum by (message) (count_over_time({level="error"}[1h])))',
                format: "table"
              }
            ],
            gridPos: { h: 8, w: 12, x: 0, y: 8 }
          },
          {
            id: 5,
            title: "HTTP Response Codes Distribution",
            type: "piechart",
            targets: [
              {
                expr: 'sum by (status) (count_over_time({job="nginx-access"}[1h]))',
                legendFormat: "{{status}}"
              }
            ],
            gridPos: { h: 8, w: 12, x: 12, y: 8 }
          },
          {
            id: 6,
            title: "Application Logs",
            type: "logs",
            targets: [
              {
                expr: '{job="cardiolive-backend"}'
              }
            ],
            options: {
              showTime: true,
              showLabels: true,
              showCommonLabels: false,
              wrapLogMessage: true
            },
            gridPos: { h: 10, w: 24, x: 0, y: 16 }
          }
        ],
        time: {
          from: "now-1h",
          to: "now"
        },
        refresh: "30s",
        schemaVersion: 27,
        version: 1
      }
    };

    return dashboard;
  }

  /**
   * Save logs dashboard
   */
  saveLogsDashboard(outputPath = './monitoring/grafana/logs-dashboard.json') {
    const dashboard = this.generateLogsDashboard();
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(dashboard, null, 2));
    console.log(`✅ Logs dashboard saved to ${outputPath}`);
    return outputPath;
  }
}

// CLI usage
if (require.main === module) {
  console.log('🔧 Generating Loki/Promtail configuration...');
  
  const generator = new PromtailConfigGenerator();
  const configPath = path.join(__dirname, '../../monitoring/loki/promtail-config.yml');
  const dashboardPath = path.join(__dirname, '../../monitoring/grafana/logs-dashboard.json');
  
  try {
    generator.saveConfig(configPath);
    generator.saveLogsDashboard(dashboardPath);
    
    console.log('\n✅ Loki log aggregation setup completed!');
    console.log('📁 Configuration files:');
    console.log(`  - Promtail config: ${configPath}`);
    console.log(`  - Logs dashboard: ${dashboardPath}`);
    console.log('\n🚀 To start log collection:');
    console.log('  1. Start Loki: docker-compose up loki');
    console.log('  2. Start Promtail: docker-compose up promtail');
    console.log('  3. Import logs dashboard to Grafana');
  } catch (error) {
    console.error('❌ Error generating configuration:', error.message);
    process.exit(1);
  }
}

module.exports = PromtailConfigGenerator;
