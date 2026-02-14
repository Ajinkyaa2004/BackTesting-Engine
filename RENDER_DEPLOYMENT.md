# 🚀 Deploy to Render - Complete Guide

This guide covers deploying your Backtesting Engine using Render for the backend (and optionally frontend too).

## 📋 Table of Contents
- [Option 1: Frontend on Vercel + Backend on Render](#option-1-frontend-on-vercel--backend-on-render-recommended)
- [Option 2: Both on Render](#option-2-both-frontend-and-backend-on-render)

---

## Option 1: Frontend on Vercel + Backend on Render (Recommended)

This is the **recommended approach** as Vercel is optimized for Next.js.

### ⏱️ Time: ~10 minutes
### 💰 Cost: Free tier available

---

## Part A: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub (easiest option)
4. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database

1. From Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure database:
   ```
   Name: backtesting-db
   Database: backtesting
   User: backtesting_user
   Region: Oregon (US West) or nearest to you
   Plan: Free
   ```
3. Click **"Create Database"**
4. Wait ~2 minutes for database to provision
5. **Important**: Copy the **"Internal Database URL"** (starts with `postgresql://`)
   - Save this URL, you'll need it in Step 4

### Step 3: Create Web Service for Backend

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:
   ```
   Name: backtesting-backend
   Region: Same as your database (e.g., Oregon)
   Branch: main (or master)
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   Plan: Free
   ```

### Step 4: Add Environment Variables

In the **Environment** section, add these variables:

```bash
# 1. Database URL (use Internal Database URL from Step 2)
DATABASE_URL=postgresql://backtesting_user:password@host/database

# 2. JWT Secret (generate a random string)
JWT_SECRET_KEY=your-super-secret-random-string-change-this

# 3. JWT Algorithm
JWT_ALGORITHM=HS256

# 4. JWT Expiration
JWT_EXPIRATION_HOURS=24

# 5. CORS Origins (you'll update this after deploying frontend)
CORS_ORIGINS=https://your-app-name.vercel.app

# 6. Python Version (optional, for clarity)
PYTHON_VERSION=3.13.1
```

**To generate a secure JWT_SECRET_KEY:**
```bash
openssl rand -base64 32
```

### Step 5: Deploy Backend

1. Click **"Create Web Service"**
2. Render will start building your backend
3. Wait 3-5 minutes for deployment to complete
4. Once deployed, you'll see a URL like: `https://backtesting-backend.onrender.com`
5. **Copy this URL** - you'll need it for frontend deployment

### Step 6: Test Backend

1. Visit: `https://backtesting-backend.onrender.com/docs`
2. You should see the FastAPI Swagger documentation
3. Also test: `https://backtesting-backend.onrender.com/health`
4. Should return: `{"status":"healthy", ...}`

✅ **Backend deployment complete!**

---

## Part B: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Sign up with GitHub
4. Authorize Vercel to access your repositories

### Step 2: Import Project

1. From Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Find your repository in the list
3. Click **"Import"**

### Step 3: Configure Build Settings

1. **Framework Preset**: Next.js ✅ (auto-detected)
2. **Root Directory**: Click **"Edit"** → Type: `frontend`
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)
5. **Install Command**: `npm install` (auto-detected)

### Step 4: Add Environment Variable

Click **"Environment Variables"** and add:

```bash
# Variable name
NEXT_PUBLIC_API_URL

# Value (use your Render backend URL from Part A, Step 5)
https://backtesting-backend.onrender.com
```

**Important**: No trailing slash!

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes for build to complete
3. Once deployed, Vercel gives you a URL like: `https://your-app-name.vercel.app`
4. **Copy this URL**

### Step 6: Update Backend CORS

1. Go back to **Render Dashboard**
2. Go to your backend service
3. Go to **Environment** tab
4. Update the `CORS_ORIGINS` variable:
   ```bash
   CORS_ORIGINS=https://your-app-name.vercel.app
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy (~2 minutes)

### Step 7: Test Your Application

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Try to register a new user
3. Login with the user
4. Upload a strategy
5. Run a backtest

✅ **Frontend deployment complete!**

🎉 **Your app is now live with Frontend on Vercel + Backend on Render!**

---

## Option 2: Both Frontend and Backend on Render

You can deploy both on Render if you prefer everything in one place.

### ⏱️ Time: ~15 minutes
### 💰 Cost: Free tier available

---

## Part A: Deploy Backend to Render

Follow **Part A** from Option 1 above (Steps 1-6). Same process!

---

## Part B: Deploy Frontend to Render

### Step 1: Create Static Site for Frontend

1. From Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure the service:
   ```
   Name: backtesting-frontend
   Region: Same as backend (e.g., Oregon)
   Branch: main (or master)
   Root Directory: frontend
   Build Command: npm run build
   Publish Directory: out
   ```

### Step 2: Configure Next.js for Static Export

Before deploying, you need to update Next.js config for static export:

**Update: `frontend/next.config.ts`**

Add this to your config:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static export
  images: {
    unoptimized: true,  // Required for static export
  },
  trailingSlash: true,  // Recommended for static hosting
};

export default nextConfig;
```

**Commit and push** this change to GitHub:
```bash
cd frontend
git add next.config.ts
git commit -m "Configure Next.js for static export on Render"
git push origin main
```

### Step 3: Add Environment Variables

In the **Environment** section, add:

```bash
NEXT_PUBLIC_API_URL=https://backtesting-backend.onrender.com
```

Use your backend URL from Part A.

### Step 4: Deploy Frontend

1. Click **"Create Static Site"**
2. Render will build your frontend
3. Wait 2-3 minutes
4. You'll get a URL like: `https://backtesting-frontend.onrender.com`

### Step 5: Update Backend CORS

1. Go to backend service in Render
2. Update `CORS_ORIGINS`:
   ```bash
   CORS_ORIGINS=https://backtesting-frontend.onrender.com
   ```
3. Save and wait for auto-redeploy

### Step 6: Test Your Application

Visit `https://backtesting-frontend.onrender.com` and test all features.

✅ **Both deployed on Render!**

---

## 📊 Comparison: Vercel vs Render for Frontend

| Feature | Vercel | Render Static Site |
|---------|--------|-------------------|
| **Optimization** | Native Next.js support | Generic static hosting |
| **Build Speed** | Very fast (1-2 min) | Fast (2-3 min) |
| **Edge Network** | Global CDN | CDN included |
| **Free Tier** | 100GB bandwidth | 100GB bandwidth |
| **Price** | Free → $20/mo | Free → $7/mo |
| **Image Optimization** | Built-in | Requires config changes |
| **Server Components** | Full support | Limited (static only) |
| **Automatic Updates** | Yes | Yes |
| **Recommendation** | ⭐ **Best for Next.js** | Good alternative |

**Recommendation**: Use **Vercel for frontend** + **Render for backend** (Option 1)

---

## 🔧 Render-Specific Configuration

### Free Tier Limitations

**Backend (Web Service):**
- Free tier spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- 750 hours/month free (enough for personal projects)

**Database:**
- Free PostgreSQL expires after 90 days
- 1GB storage
- Sufficient for development/testing

**Frontend (Static Site):**
- Always awake (no sleep)
- 100GB bandwidth/month
- Unlimited static sites

### Keeping Backend Awake

If you want to keep the backend awake (avoid cold starts):

**Option 1: Upgrade to Paid Plan**
- $7/month - Backend stays always on

**Option 2: Use a Cron Job Service** (Free)
Use a service like UptimeRobot or Cron-job.org to ping your backend every 10 minutes:

1. Go to https://uptimerobot.com (free)
2. Create monitor:
   ```
   URL: https://backtesting-backend.onrender.com/health
   Interval: 10 minutes
   ```

This keeps your backend warm and responsive!

---

## 🚨 Troubleshooting

### Issue 1: Build Fails on Render

**Error**: "Build failed" or dependency issues

**Solution**:
1. Check build logs in Render dashboard
2. Verify `requirements.txt` has all dependencies
3. Ensure `Root Directory` is set to `backend`
4. Check Python version compatibility

### Issue 2: Database Connection Error

**Error**: "Could not connect to database"

**Solution**:
1. Use **Internal Database URL** (not External)
2. Format: `postgresql://user:pass@host/db`
3. Verify database is in same region as backend
4. Check database status in Render dashboard

### Issue 3: CORS Errors

**Error**: "Access-Control-Allow-Origin" error

**Solution**:
1. Verify `CORS_ORIGINS` matches frontend URL exactly
2. Include `https://` and remove trailing `/`
3. For Render frontend: `https://your-app.onrender.com`
4. For Vercel frontend: `https://your-app.vercel.app`
5. Redeploy backend after updating

### Issue 4: Environment Variables Not Working

**Error**: App uses default values instead of env vars

**Solution**:
1. Check Environment tab in Render dashboard
2. Ensure variables are saved
3. Click "Manual Deploy" to force redeploy
4. Check logs for any env var loading errors

### Issue 5: Frontend Not Loading API Data

**Error**: Frontend shows no data or errors

**Solution**:
1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Must be set during build time (redeploy if changed)
3. Test backend directly: visit `/docs` endpoint
4. Check browser console for CORS errors
5. Verify backend is awake (may take 30s on free tier)

### Issue 6: Static Export Issues (Render Frontend)

**Error**: Dynamic features not working

**Solution**:
- Next.js static export has limitations
- No server-side features (API routes, server components)
- This is why **Vercel is recommended** for frontend
- If using Render, ensure all features are client-side

---

## 🔐 Security Checklist

Before going live:

- [ ] Generate strong `JWT_SECRET_KEY` (use `openssl rand -base64 32`)
- [ ] Use Internal Database URL (more secure than External)
- [ ] Set `CORS_ORIGINS` to only your frontend URL (not `*`)
- [ ] Enable HTTPS (automatic on Render)
- [ ] Review environment variables (no sensitive data visible)
- [ ] Set up database backups (Render dashboard)
- [ ] Test authentication flow
- [ ] Verify API endpoints require authentication

---

## 📊 Deployment Checklist

### Backend (Render)
- [ ] PostgreSQL database created
- [ ] Web service created with correct root directory
- [ ] Environment variables set (5-6 variables)
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Deployment successful
- [ ] `/docs` endpoint accessible
- [ ] `/health` endpoint returns healthy

### Frontend (Vercel)
- [ ] Vercel account created
- [ ] Project imported
- [ ] Root directory set to `frontend`
- [ ] `NEXT_PUBLIC_API_URL` environment variable set
- [ ] Deployment successful
- [ ] Site loads correctly
- [ ] Can connect to backend API

### Or Frontend (Render)
- [ ] `next.config.ts` updated for static export
- [ ] Static site created
- [ ] Root directory set to `frontend`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `out`
- [ ] `NEXT_PUBLIC_API_URL` set
- [ ] Deployment successful

### Final Testing
- [ ] Can register new user
- [ ] Can login
- [ ] Can upload strategy
- [ ] Can run backtest
- [ ] Results display correctly
- [ ] No CORS errors

---

## 💰 Cost Summary

### Option 1: Vercel + Render
```
Frontend (Vercel):  FREE (100GB bandwidth)
Backend (Render):   FREE (with sleep) or $7/month (always on)
Database (Render):  FREE (1GB, 90 days) → $7/month after
Total:              FREE or $7-14/month for production
```

### Option 2: Both on Render
```
Frontend (Render):  FREE (static site, 100GB bandwidth)
Backend (Render):   FREE (with sleep) or $7/month (always on)
Database (Render):  FREE (1GB, 90 days) → $7/month after
Total:              FREE or $7-14/month for production
```

### Recommended for Production:
- Start with **free tiers** to test
- Upgrade backend when you need always-on ($7/month)
- Upgrade database after 90 days ($7/month)
- Total: ~$14/month for fully production-ready

---

## 🎯 Quick Reference

### Your URLs (Example)
```
Frontend:  https://backtesting-app.vercel.app
Backend:   https://backtesting-backend.onrender.com
API Docs:  https://backtesting-backend.onrender.com/docs
Database:  Internal URL in Render dashboard
```

### Render Dashboard Sections
- **Web Services**: Your backend API
- **Static Sites**: Your frontend (if using Render)
- **PostgreSQL**: Your database
- **Environment**: Environment variables

### Redeploy Commands

**Manual Redeploy:**
1. Go to Render dashboard
2. Select your service
3. Click "Manual Deploy" → "Clear build cache & deploy"

**Auto Redeploy:**
- Push to GitHub → Render auto-deploys
- Same for Vercel

### View Logs

**Render:**
1. Dashboard → Your Service → Logs tab
2. Real-time logs shown

**Vercel:**
1. Dashboard → Project → Deployments
2. Click deployment → View Function Logs

---

## 🎓 Next Steps After Deployment

1. **Set up monitoring**
   - Use Render built-in metrics
   - Set up UptimeRobot for backend health checks

2. **Configure custom domain** (Optional)
   - Vercel: Settings → Domains
   - Render: Settings → Custom Domain

3. **Enable database backups**
   - Render PostgreSQL → Backups tab
   - Set up daily backups

4. **Add error tracking** (Optional)
   - Sentry, LogRocket, or similar
   - Monitor production errors

5. **Set up CI/CD**
   - Already automatic with GitHub integration!
   - Push to main = auto-deploy

---

## 🎉 You're Done!

Your Backtesting Engine is now deployed and live!

**Option 1 URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

**Option 2 URLs:**
- Frontend: `https://your-frontend.onrender.com`
- Backend: `https://your-backend.onrender.com`

### Quick Test:
1. Visit your frontend URL
2. Register → Login → Upload Strategy → Run Backtest
3. Everything should work perfectly!

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

---

**Need help?** Check the troubleshooting section or refer to [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for more details.

**Happy deploying!** 🚀
