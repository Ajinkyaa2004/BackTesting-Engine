# 🎯 Quick Deploy: Vercel + Render

## ⚡ Super Fast Deployment (10 minutes)

### 🔷 Step 1: Deploy Backend to Render (5 min)

**A. Create Database**
1. Go to https://render.com (sign up with GitHub)
2. New + → PostgreSQL
3. Name: `backtesting-db` → Create
4. Copy **Internal Database URL**

**B. Create Backend Service**
1. New + → Web Service
2. Connect GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build**: `pip install -r requirements.txt`
   - **Start**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**C. Add Environment Variables**
```bash
DATABASE_URL=<paste Internal Database URL>
JWT_SECRET_KEY=<run: openssl rand -base64 32>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=https://your-app.vercel.app  # Update later
```

4. Create Web Service → Copy URL (e.g., `https://xxx.onrender.com`)

---

### 🔷 Step 2: Deploy Frontend to Vercel (3 min)

1. Go to https://vercel.com (sign up with GitHub)
2. New Project → Import your repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js ✅
4. Environment Variables:
   ```bash
   NEXT_PUBLIC_API_URL=<your Render backend URL>
   ```
5. Deploy → Copy URL (e.g., `https://xxx.vercel.app`)

---

### 🔷 Step 3: Update CORS (2 min)

1. Go back to Render → Your backend service
2. Environment tab → Edit `CORS_ORIGINS`
3. Change to: `https://your-actual-vercel-url.vercel.app`
4. Save → Auto redeploys

---

## ✅ Done! Test Your App

Visit your Vercel URL and test:
- ✅ Register
- ✅ Login  
- ✅ Upload Strategy
- ✅ Run Backtest

---

## 🆘 Common Issues

**CORS Error?**
→ Make sure `CORS_ORIGINS` matches your Vercel URL exactly (no trailing slash)

**Backend slow on first load?**
→ Normal on free tier - wakes up in ~30 seconds

**Can't connect to API?**
→ Verify `NEXT_PUBLIC_API_URL` in Vercel environment variables

---

## 💰 Cost: 100% FREE

- Vercel: Free tier (100GB bandwidth)
- Render Backend: Free (sleeps after 15 min inactivity)
- Render Database: Free for 90 days

**Upgrade when needed**: ~$7-14/month for always-on

---

## 📚 Full Documentation

For detailed steps with troubleshooting:
→ Open [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

---

**That's it! Your app is live! 🎉**
