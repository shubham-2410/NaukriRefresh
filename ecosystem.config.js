module.exports = {
  apps: [{
    name: 'naukri-refresh',
    script: '/home/NaukriRefresh/start.sh',
    cwd: '/home/NaukriRefresh',
    interpreter: 'bash',
    autorestart: true,
    restart_delay: 5000,
  }]
}
