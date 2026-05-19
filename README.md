# Naukri Auto-Refresh

Automatically keeps your Naukri profile updated daily so it stays at the top of recruiter searches.

## Setup

### 1. Install dependencies
```bash
npm install
npx playwright install chromium
```

### 2. Add your password
Edit `.env` file:
```
NAUKRI_EMAIL=phalkeshubham2003@gmail.com
NAUKRI_PASSWORD=your_actual_password
```

### 3. Test it once
```bash
node refresh.js
```
You should see "✅ Profile updated successfully!" in the terminal.

### 4. Run the daily scheduler
```bash
node scheduler.js
```
This will run every day at 10:00 AM IST automatically.

---

## Running on Hostinger VPS (Recommended)

Since you already have a VPS running, host this there so it runs 24/7.

### SSH into your VPS
```bash
ssh root@your-vps-ip
```

### Clone or upload the files
Upload the entire `naukri-refresh` folder to your VPS.

### Install Node + dependencies
```bash
npm install
npx playwright install chromium
npx playwright install-deps chromium
```

### Run with PM2 (keeps it alive forever)
```bash
npm install -g pm2
pm2 start scheduler.js --name "naukri-refresh"
pm2 save
pm2 startup
```

### Check logs anytime
```bash
pm2 logs naukri-refresh
```

### Stop it
```bash
pm2 stop naukri-refresh
```

---

## Debugging

If refresh fails, edit `refresh.js` and change:
```js
headless: true  →  headless: false
```
Then run `node refresh.js` on your local machine to watch it run in a real browser window.

---

## Notes
- Runs daily at 10:00 AM IST
- Uses your existing Hostinger VPS — no extra cost
- Credentials stored locally in `.env` — never committed to Git
- Add `.env` to `.gitignore` if you push this to GitHub
