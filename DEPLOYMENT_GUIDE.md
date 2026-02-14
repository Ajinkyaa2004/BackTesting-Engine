# Deployment Guide for Backtesting Engine

This guide will help you deploy your Backtesting Engine to production. The project consists of two parts:
- **Frontend**: Next.js application (deployed on Vercel)
- **Backend**: FastAPI application (deployed on Railway, Render, or similar)

## 🚀 Quick Start - Local Development

### Prerequisites
- Python 3.13+
- Node.js 18+
- PostgreSQL (for production) or SQLite (for development)

### Running Locally

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Backtesting_Engine-main
```

2. **Backend Setup**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📦 Deploying to Production

### Part 1: Deploy Backend (Railway)

Railway is recommended for the Python backend as it's simple and free-tier friendly.

#### Option A: Deploy via Railway Dashboard

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account and select your repository
   - Choose the `backend` directory as the root

3. **Configure Environment Variables**
   
   In Railway dashboard, go to your project → Variables tab and add:
   
   ```
   DATABASE_URL=postgresql://user:password@host:port/dbname
   JWT_SECRET_KEY=your-super-secret-key-change-this
   JWT_ALGORITHM=HS256
   JWT_EXPIRATION_HOURS=24
   CORS_ORIGINS=https://your-app.vercel.app
   PORT=8000
   ```

4. **Database Setup**
   - In Railway, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` variable
   - Your database will be automatically connected

5. **Deploy**
   - Railway will automatically detect it's a Python app
   - It will use the `Procfile` to start the server
   - Wait for the build to complete
   - Copy your backend URL (e.g., `https://your-app.up.railway.app`)

#### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Set environment variables
railway variables set JWT_SECRET_KEY=your-super-secret-key
railway variables set CORS_ORIGINS=https://your-app.vercel.app

# Deploy
railway up
```

---

### Part 2: Deploy Frontend (Vercel)

Vercel is the best platform for Next.js applications.

#### Deploy via Vercel Dashboard

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Next.js project

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Set Environment Variables**
   
   In Vercel dashboard → Settings → Environment Variables:
   
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
   ```
   
   *(Replace with your actual Railway backend URL)*

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 1-2 minutes)
   - Your app will be live at `https://your-app.vercel.app`

6. **Update Backend CORS**
   - Go back to Railway
   - Update `CORS_ORIGINS` to include your Vercel URL
   - Redeploy backend

#### Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: backtesting-engine
# - Directory: ./
# - Override settings: No

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL

# Production deployment
vercel --prod
```

---

## 🔧 Alternative Backend Deployment Options

### Option 1: Render

1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repository
4. Configure:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (same as Railway)
6. Create PostgreSQL database in Render
7. Deploy

### Option 2: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app from backend directory
cd backend
fly launch

# Follow prompts and deploy
fly deploy
```

### Option 3: DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com
2. Create new App
3. Connect GitHub
4. Select repository and backend directory
5. Configure environment variables
6. Add PostgreSQL database
7. Deploy

---

## 🔐 Security Checklist for Production

Before deploying to production, ensure:

- [ ] Change `JWT_SECRET_KEY` to a strong random value
- [ ] Use PostgreSQL instead of SQLite for production
- [ ] Update `CORS_ORIGINS` to only include your frontend domain
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set proper environment variables on both platforms
- [ ] Enable database backups
- [ ] Review and update all default values
- [ ] Add rate limiting for API endpoints (optional)
- [ ] Set up monitoring and error tracking (optional)

---

## 🚨 Common Issues and Solutions

### Issue 1: CORS Errors
**Error**: "Access-Control-Allow-Origin" header missing

**Solution**: 
1. Verify `CORS_ORIGINS` in backend includes your frontend URL
2. Format: `https://your-app.vercel.app` (no trailing slash)
3. For multiple origins: `https://app1.com,https://app2.com`

### Issue 2: API Connection Fails
**Error**: Frontend can't reach backend

**Solution**:
1. Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
2. Verify backend is deployed and accessible
3. Test backend directly: visit `https://your-backend-url.com/docs`

### Issue 3: Database Connection Error
**Error**: "Could not connect to database"

**Solution**:
1. Verify `DATABASE_URL` is set correctly
2. Check database is running
3. Ensure connection string format is correct
4. For Railway: database should auto-connect

### Issue 4: Build Fails on Vercel
**Error**: Build or compilation errors

**Solution**:
1. Ensure all dependencies are in `package.json`
2. Check Node version compatibility
3. Review build logs in Vercel dashboard
4. Try building locally first: `npm run build`

### Issue 5: Authentication Not Working
**Error**: JWT token validation fails

**Solution**:
1. Verify `JWT_SECRET_KEY` is consistent
2. Check token expiration settings
3. Ensure HTTPS is enabled (required for secure cookies)

---

## 📊 Monitoring and Maintenance

### Vercel (Frontend)
- View logs: Vercel Dashboard → Deployments → Logs
- Analytics: Vercel Dashboard → Analytics
- Errors: Check Runtime Logs

### Railway (Backend)
- View logs: Railway Dashboard → Deployments → Logs
- Metrics: Railway Dashboard → Metrics
- Database: Railway Dashboard → PostgreSQL → Data

### Useful Commands

```bash
# View Vercel logs
vercel logs

# View Railway logs
railway logs

# Redeploy Vercel
vercel --prod

# Redeploy Railway
railway up
```

---

## 🎯 Post-Deployment Steps

1. **Test the Application**
   - Visit your Vercel frontend URL
   - Create a test account
   - Upload a test strategy
   - Run a backtest
   - Verify results

2. **Set Up Domain (Optional)**
   - Vercel: Dashboard → Settings → Domains
   - Railway: Dashboard → Settings → Domains
   - Add custom domain and configure DNS

3. **Enable Automatic Deployments**
   - Both Vercel and Railway support auto-deploy on git push
   - Ensure it's enabled in project settings

4. **Set Up Backups**
   - Railway/Render: Enable automatic database backups
   - Consider daily or weekly backup schedules

---

## 💡 Cost Estimates

### Free Tier (Suitable for testing/personal use)
- **Vercel**: Free tier includes:
  - 100GB bandwidth
  - Unlimited deployments
  - Custom domains
  
- **Railway**: Free tier includes:
  - $5 free credit/month
  - Sufficient for small apps
  - PostgreSQL included

### Paid Tiers (For production/scaling)
- **Vercel Pro**: $20/month (for teams)
- **Railway**: Pay-as-you-go (~$5-20/month for small apps)
- **Render**: Starting at $7/month per service

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the logs (Vercel and Railway dashboards)
2. Review environment variables
3. Verify database connections
4. Test API endpoints directly
5. Check CORS configuration

---

## ✅ Deployment Checklist

Before going live:

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database set up and connected
- [ ] Environment variables configured
- [ ] CORS properly set up
- [ ] JWT secret key changed
- [ ] HTTPS enabled
- [ ] Test user registration and login
- [ ] Test strategy upload
- [ ] Test backtesting functionality
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up (optional)

---

**Your app is now live! 🎉**

Frontend: `https://your-app.vercel.app`
Backend: `https://your-backend.up.railway.app`
API Docs: `https://your-backend.up.railway.app/docs`
