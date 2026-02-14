# 📸 Visual Step-by-Step Vercel Deployment Guide

This guide provides detailed, step-by-step instructions with what you'll see on screen.

---

## Part 1: Deploy Backend on Railway (3 minutes)

### Step 1: Sign Up / Login to Railway
🌐 Go to: **https://railway.app**

1. Click "Login with GitHub"
2. Authorize Railway to access your GitHub account
3. You'll see the Railway dashboard

### Step 2: Create New Project
1. Click the **"New Project"** button (big purple button)
2. Select **"Deploy from GitHub repo"**
3. If this is your first time:
   - Click "Configure GitHub App"
   - Select your repository access (All repos or specific repos)
   - Click "Install & Authorize"

### Step 3: Select Repository
1. You'll see a list of your GitHub repositories
2. Find and click on your **"Backtesting_Engine-main"** (or whatever you named it)
3. Railway will ask which directory to deploy from
4. **Important**: Select **"backend"** as the root directory
   - Or configure it in settings later

### Step 4: Add PostgreSQL Database
1. In your new project dashboard, click **"New"** button
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway will provision a database and automatically set `DATABASE_URL`

### Step 5: Configure Environment Variables
1. Click on your backend service (not the database)
2. Go to **"Variables"** tab
3. Click **"New Variable"** and add each of these:

```
JWT_SECRET_KEY = [generate a random string - explained below]
JWT_ALGORITHM = HS256
JWT_EXPIRATION_HOURS = 24
CORS_ORIGINS = http://localhost:3000
```

**To generate JWT_SECRET_KEY:**
- Mac/Linux: Run in terminal: `openssl rand -base64 32`
- Or use: https://randomkeygen.com/ (copy a "Fort Knox" password)
- Example: `dGhpcyBpcyBhIHZlcnkgc2VjcmV0IGtleSBmb3IgSldU`

### Step 6: Deploy & Get URL
1. Railway will automatically deploy your backend
2. Wait for "Success" status (usually 2-3 minutes)
3. Click on your backend service
4. Go to **"Settings"** tab
5. Scroll to **"Domains"** section
6. Click **"Generate Domain"**
7. **Copy this URL!** You'll need it for frontend deployment
   - Example: `https://backtesting-engine-production-xxxx.up.railway.app`

---

## Part 2: Deploy Frontend on Vercel (2 minutes)

### Step 1: Sign Up / Login to Vercel
🌐 Go to: **https://vercel.com**

1. Click "Sign Up" or "Login"
2. Choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub account

### Step 2: Import Project
1. You'll see the Vercel dashboard
2. Click **"Add New..."** dropdown (top right)
3. Select **"Project"**
4. You'll see "Import Git Repository" page

### Step 3: Select Repository
1. In the "Import Git Repository" section:
   - Find your **"Backtesting_Engine-main"** repository
   - Click **"Import"**
2. If you don't see it:
   - Click "Adjust GitHub App Permissions"
   - Grant access to the repository
   - Go back and click "Import"

### Step 4: Configure Project
On the "Configure Project" page:

1. **Framework Preset**: Should auto-detect as "Next.js" ✅
2. **Root Directory**: Click "Edit" and select **"frontend"**
   - Browse folders and click on "frontend"
   - Click "Continue"
3. **Build Settings**: Leave defaults (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 5: Add Environment Variables
Still on the "Configure Project" page:

1. Expand **"Environment Variables"** section
2. Add variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your Railway backend URL from Part 1, Step 6
   - Example: `https://backtesting-engine-production-xxxx.up.railway.app`
3. Make sure to **NOT** add a trailing slash

### Step 6: Deploy!
1. Click the big **"Deploy"** button
2. Watch the build process (fun to watch! 📦)
3. Wait for "Congratulations!" (usually 1-2 minutes)
4. Click **"Visit"** to see your app
5. **Copy your Vercel URL**
   - Example: `https://backtesting-engine-main.vercel.app`

---

## Part 3: Update CORS (1 minute)

### Update Backend CORS Configuration
1. Go back to **Railway dashboard**
2. Click on your backend service
3. Go to **"Variables"** tab
4. Find **`CORS_ORIGINS`**
5. Change from `http://localhost:3000` to your **Vercel URL**
   - Example: `https://backtesting-engine-main.vercel.app`
6. **Important**: No trailing slash!
7. Railway will automatically redeploy

---

## 🎉 Done! Test Your Deployment

### Verify Everything Works:

1. **Visit your Vercel URL**
   - Example: `https://backtesting-engine-main.vercel.app`
   - You should see the login/register page ✅

2. **Check API Docs**
   - Go to: `https://your-railway-url.up.railway.app/docs`
   - You should see the FastAPI documentation ✅

3. **Test Health Endpoint**
   - Go to: `https://your-railway-url.up.railway.app/health`
   - Should return: `{"status":"ok"}` ✅

4. **Register & Login**
   - Create a new account on your Vercel URL
   - Login with the account
   - Everything should work! ✅

---

## 🚨 Troubleshooting Visual Aids

### Problem: CORS Error in Browser Console

**Symptoms:**
```
Access to XMLHttpRequest at 'https://your-backend...' from origin 'https://your-frontend...' 
has been blocked by CORS policy
```

**Solution:**
1. Open Railway dashboard
2. Select backend service
3. Go to Variables tab
4. Check `CORS_ORIGINS` matches your Vercel URL **exactly**
5. No `http://` if your Vercel URL is `https://`
6. No trailing slash `/`

### Problem: "Network Error" or "Failed to Fetch"

**Symptoms:**
- Login button doesn't work
- Registration fails
- Console shows network errors

**Solution:**
1. Open Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Verify `NEXT_PUBLIC_API_URL` is correct
5. Should match your Railway URL exactly
6. Click "Redeploy" if you changed anything

### Problem: Build Failed on Vercel

**Symptoms:**
- Deployment shows "Failed" status
- Build logs show errors

**Solution:**
1. Click on the failed deployment
2. Read the error logs
3. Common issues:
   - Wrong root directory (should be "frontend")
   - Missing environment variables
   - Syntax errors in code
4. Fix the issue and push to GitHub (auto-redeploys)

### Problem: Backend Not Responding

**Symptoms:**
- 404 or 502 errors
- "Application failed to respond"

**Solution:**
1. Check Railway logs:
   - Dashboard → Your backend service → Logs tab
2. Look for errors in startup
3. Common issues:
   - Missing environment variables
   - Database connection failed
4. Verify `DATABASE_URL` is set (should be automatic)

---

## 📝 What You Should Have Now

### URLs to Save:
- ✅ Frontend: `https://your-app.vercel.app`
- ✅ Backend: `https://your-app.up.railway.app`
- ✅ API Docs: `https://your-app.up.railway.app/docs`
- ✅ Database: Managed by Railway (internal URL)

### Dashboard Access:
- ✅ [Vercel Dashboard](https://vercel.com/dashboard) - View deployments, logs, settings
- ✅ [Railway Dashboard](https://railway.app/dashboard) - View backend, database, logs

### Environment Variables Set:
- ✅ Vercel: `NEXT_PUBLIC_API_URL`
- ✅ Railway: `JWT_SECRET_KEY`, `CORS_ORIGINS`, `DATABASE_URL`

---

## 🎓 Pro Tips

1. **Automatic Deployments**
   - Push to GitHub → Vercel & Railway automatically redeploy
   - No need to manually deploy each time!

2. **View Logs Anytime**
   - Vercel: Dashboard → Your project → Deployments → Logs
   - Railway: Dashboard → Your service → Logs tab

3. **Custom Domain (Optional)**
   - Vercel: Settings → Domains → Add
   - Railway: Settings → Domains → Custom domain

4. **Free Tier Limits**
   - Vercel: 100GB bandwidth/month (plenty for small apps)
   - Railway: $5 free credit/month (usually enough for 1 app + DB)

5. **Monitoring**
   - Set up email alerts in Railway for downtime
   - Check Vercel Analytics for traffic

---

## ✅ Final Checklist

- [ ] Backend deployed on Railway ✅
- [ ] Database created on Railway ✅
- [ ] Frontend deployed on Vercel ✅
- [ ] Environment variables configured ✅
- [ ] CORS updated with Vercel URL ✅
- [ ] Can access frontend ✅
- [ ] Can access API docs ✅
- [ ] Can register new user ✅
- [ ] Can login ✅
- [ ] No errors in console ✅

---

## 🎉 You're Live!

Congratulations! Your backtesting engine is now deployed and accessible worldwide! 🌍

Share your URL with others:
`https://your-app-name.vercel.app`

---

## 📸 Screenshots Checklist

When following this guide, you'll see:
1. ✅ Railway "New Project" button
2. ✅ GitHub repository selector
3. ✅ PostgreSQL database option
4. ✅ Environment variables form
5. ✅ Generated domain URL
6. ✅ Vercel "Import Project" button
7. ✅ Root directory selector
8. ✅ Framework preset (Next.js detected)
9. ✅ Environment variables section
10. ✅ "Deploying..." animation
11. ✅ "Congratulations!" success page
12. ✅ Your live application!

---

Need more help? Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed troubleshooting!
