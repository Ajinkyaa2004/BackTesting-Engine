# Backtesting Engine - Production Ready! 🚀

A professional algorithmic trading backtesting platform with strategy management and broker integration.

## ✅ Status: Ready for Deployment

Your project is now **fully configured** and ready to deploy to production!

### 🎯 What's Running

- **Backend API**: http://localhost:8000 (FastAPI)
- **Frontend**: http://localhost:3000 (Next.js)
- **API Documentation**: http://localhost:8000/docs

### 📦 What's Been Configured

✅ **Backend (Python/FastAPI)**
- Production-ready CORS configuration
- Environment-based settings
- PostgreSQL support
- JWT authentication
- Database migrations
- Procfile for easy deployment
- Python version specified

✅ **Frontend (Next.js/React)**
- Vercel configuration
- Environment variables setup
- Responsive UI
- API integration
- Monaco code editor for strategies

✅ **Deployment Files**
- `.env.example` files for both frontend and backend
- `vercel.json` for frontend deployment
- `Procfile` for backend deployment
- `runtime.txt` for Python version
- Comprehensive deployment guides

---

## 🚀 Deploy Now!

### Quick Deploy (5 minutes)
Follow [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for a streamlined deployment process.

### Detailed Guide
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive instructions, troubleshooting, and alternative deployment options.

---

## 🏃 Running Locally

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 Tech Stack

**Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Monaco Editor
- Recharts
- Axios

**Backend:**
- Python 3.13+
- FastAPI
- SQLAlchemy
- PostgreSQL/SQLite
- JWT Authentication
- Uvicorn

---

## 📚 Project Structure

```
Backtesting_Engine-main/
├── backend/               # FastAPI backend
│   ├── api/              # API routes
│   ├── auth/             # Authentication
│   ├── brokers/          # Broker integrations
│   ├── engine/           # Backtesting engine
│   ├── models/           # Database models
│   ├── strategies/       # Strategy management
│   ├── main.py           # Application entry
│   ├── requirements.txt  # Python dependencies
│   ├── Procfile          # Deployment config
│   └── .env.example      # Environment template
│
├── frontend/             # Next.js frontend
│   ├── app/             # Next.js pages
│   ├── components/      # React components
│   ├── lib/             # Utilities
│   ├── vercel.json      # Vercel config
│   └── .env.example     # Environment template
│
├── DEPLOYMENT_GUIDE.md   # Detailed deployment guide
├── QUICK_DEPLOY.md       # Quick start guide
└── README.md             # This file
```

---

## 🌐 Deployment Platforms

### Recommended:
- **Frontend**: Vercel (native Next.js support)
- **Backend**: Railway (easy Python deployment)
- **Database**: PostgreSQL (included with Railway)

### Alternatives:
- **Backend**: Render, Fly.io, DigitalOcean, Heroku
- **Database**: Supabase, Neon, AWS RDS

---

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Environment-based secrets
- CORS protection
- SQL injection protection via SQLAlchemy
- Input validation with Pydantic

---

## 📊 Features

### Strategy Management
- Upload and manage custom trading strategies
- Python-based strategy definition
- Built-in indicators (RSI, MACD, Moving Averages)
- Strategy validation and syntax checking

### Backtesting Engine
- Historical data from multiple brokers
- Real-time position tracking
- Performance metrics calculation
- Risk management
- Multi-timeframe support

### Broker Integration
- Binance support
- Extensible architecture for additional brokers
- Real-time market data fetching

### User Interface
- Modern, responsive design
- Interactive charts with Recharts
- Code editor with syntax highlighting
- Strategy templates
- Detailed backtest results

---

## 🎓 Getting Started

1. **Clone the repository**
2. **Set up environment variables** (see `.env.example` files)
3. **Run locally** (see "Running Locally" above)
4. **Deploy** (follow [QUICK_DEPLOY.md](./QUICK_DEPLOY.md))

---

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [Quick Deploy](./QUICK_DEPLOY.md) - Fast-track deployment steps
- [Backend README](./backend/README.md) - Backend documentation
- [API Documentation](http://localhost:8000/docs) - Interactive API docs (when running)

---

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

**CORS errors:**
- Check `CORS_ORIGINS` in backend environment
- Ensure frontend URL is correctly configured

**Database connection failed:**
- Verify `DATABASE_URL` is set correctly
- Check database is running
- For SQLite: ensure proper file permissions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🆘 Support

For issues and questions:
1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) troubleshooting section
2. Review deployment logs
3. Verify environment variables
4. Check API status at `/health` endpoint

---

## 🎉 Ready to Deploy!

Your backtesting engine is fully configured and ready for production deployment.

**Next Steps:**
1. Review [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
2. Deploy backend to Railway
3. Deploy frontend to Vercel
4. Start backtesting! 📈

---

Made with ❤️ for algorithmic traders
