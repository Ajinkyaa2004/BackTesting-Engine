# Deployment Checklist

## ✅ Pre-Deployment Checklist

### Code Preparation
- [x] Backend is deployment-ready
- [x] Frontend is deployment-ready
- [x] Environment variable templates created
- [x] CORS configuration updated for production
- [x] JWT configuration uses environment variables
- [x] Database connection supports PostgreSQL
- [x] Procfile created for backend deployment
- [x] vercel.json created for frontend deployment
- [x] .gitignore properly configured

### Testing Locally
- [ ] Backend runs successfully on localhost:8000
- [ ] Frontend runs successfully on localhost:3000
- [ ] User registration works
- [ ] User login works
- [ ] Strategy upload works
- [ ] Backtest execution works
- [ ] Results display correctly

### Backend Deployment (Railway/Render)
- [ ] Account created
- [ ] GitHub repository connected
- [ ] Backend directory selected as root
- [ ] PostgreSQL database added
- [ ] Environment variables configured:
  - [ ] JWT_SECRET_KEY (random secret)
  - [ ] CORS_ORIGINS (Vercel URL)
  - [ ] DATABASE_URL (auto-set by platform)
- [ ] Deployment successful
- [ ] Backend URL copied (save for next step)
- [ ] API docs accessible at https://your-backend.com/docs
- [ ] Health endpoint responds: https://your-backend.com/health

### Frontend Deployment (Vercel)
- [ ] Account created
- [ ] GitHub repository connected
- [ ] Frontend directory selected as root
- [ ] Environment variables configured:
  - [ ] NEXT_PUBLIC_API_URL (backend URL from above)
- [ ] Deployment successful
- [ ] Application accessible at your Vercel URL
- [ ] CORS updated in backend with Vercel URL

### Post-Deployment Testing
- [ ] Frontend loads successfully
- [ ] Can register new user
- [ ] Can login with user
- [ ] Can create/upload strategy
- [ ] Can run backtest
- [ ] Results display correctly
- [ ] No CORS errors in console
- [ ] API calls work correctly

### Security & Configuration
- [ ] JWT_SECRET_KEY is strong and unique
- [ ] CORS_ORIGINS only includes your frontend domain
- [ ] Database credentials are secure
- [ ] No .env files committed to git
- [ ] HTTPS is enabled (automatic on Vercel/Railway)
- [ ] Database backups enabled

### Documentation
- [ ] README updated with deployment URLs
- [ ] Team members have access to deployment dashboards
- [ ] Environment variables documented
- [ ] API endpoints documented

### Optional Enhancements
- [ ] Custom domain configured
- [ ] Monitoring/analytics set up
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Database backups scheduled
- [ ] Rate limiting added
- [ ] Email notifications configured

---

## 🎯 Quick Reference

### Your URLs
- Frontend: `https://your-app-name.vercel.app`
- Backend: `https://your-app-name.up.railway.app`
- API Docs: `https://your-app-name.up.railway.app/docs`

### Dashboards
- Vercel: https://vercel.com/dashboard
- Railway: https://railway.app/dashboard

### View Logs
```bash
# Vercel logs
vercel logs

# Railway logs
railway logs
```

### Redeploy
```bash
# Vercel
git push origin main  # Auto-deploys

# Railway
git push origin main  # Auto-deploys
```

---

## 🚨 If Something Goes Wrong

1. **Check logs** in deployment dashboard
2. **Verify environment variables** are set correctly
3. **Test API directly** via /docs endpoint
4. **Check CORS** configuration matches URLs
5. **Review** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) troubleshooting section

---

## ✅ Deployment Complete!

Once all items are checked, your application is fully deployed and production-ready! 🎉

Remember to:
- Monitor your application regularly
- Keep dependencies updated
- Review security settings periodically
- Check usage to stay within free tier limits
