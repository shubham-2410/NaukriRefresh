module.exports = {
  apps: [{
    name: 'naukri-refresh',
    script: 'scheduler.js',
    cwd: '/home/NaukriRefresh',
    env: {
      DISPLAY: ':99'
    }
  }]
}