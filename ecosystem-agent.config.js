module.exports = {
  apps: [
    {
      name: 'hackeval-agent-api',
      script: 'python3',
      args: 'api.py',
      cwd: '/var/www/hackeval/Hackeval_agent',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        PORT: 8000
      },
      error_file: '/var/www/hackeval/logs/agent-err.log',
      out_file: '/var/www/hackeval/logs/agent-out.log',
      log_file: '/var/www/hackeval/logs/agent-combined.log',
      time: true,
      interpreter: 'none'
    }
  ]
};
