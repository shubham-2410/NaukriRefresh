const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

console.log('🕐 Naukri Auto-Refresh Scheduler started.');
console.log('Will refresh profile at 9:45 AM and 2:30 PM IST daily.\n');

const runRefresh = () => {
  console.log(`[${new Date().toLocaleString()}] Running scheduled refresh...`);
  exec(`node ${path.join(__dirname, 'refresh.js')}`, (error, stdout, stderr) => {
    if (error) { console.error('Error:', error.message); return; }
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  });
};

// 9:00 AM IST
cron.schedule('45 9 * * *', runRefresh, { timezone: 'Asia/Kolkata' });

// 2:00 PM IST
cron.schedule('30 14 * * *', runRefresh, { timezone: 'Asia/Kolkata' });