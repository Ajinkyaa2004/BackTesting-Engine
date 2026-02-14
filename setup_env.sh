#!/bin/bash
# setup_env.sh - Quick environment setup script

set -e

echo "🚀 Setting up Backtesting Engine for deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running from project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Backend setup
echo -e "${BLUE}📦 Setting up Backend...${NC}"
cd backend

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating backend .env file...${NC}"
    cat > .env << EOF
# Database Configuration
DATABASE_URL=sqlite:///./algo_trading.db

# JWT Configuration
JWT_SECRET_KEY=$(openssl rand -base64 32)
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS Configuration
CORS_ORIGINS=http://localhost:3000

# Server Configuration
HOST=0.0.0.0
PORT=8000
EOF
    echo -e "${GREEN}✅ Backend .env created${NC}"
else
    echo -e "${GREEN}✅ Backend .env already exists${NC}"
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${GREEN}✅ Virtual environment already exists${NC}"
fi

# Install dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
source venv/bin/activate
pip install -q -r requirements.txt
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

cd ..

# Frontend setup
echo ""
echo -e "${BLUE}📦 Setting up Frontend...${NC}"
cd frontend

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating frontend .env.local file...${NC}"
    cat > .env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
    echo -e "${GREEN}✅ Frontend .env.local created${NC}"
else
    echo -e "${GREEN}✅ Frontend .env.local already exists${NC}"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install --silent
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

cd ..

# Summary
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo ""
echo "  1. Start the backend:"
echo "     cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo ""
echo "  2. Start the frontend (in a new terminal):"
echo "     cd frontend && npm run dev"
echo ""
echo "  3. Access the application:"
echo "     Frontend: http://localhost:3000"
echo "     Backend API: http://localhost:8000"
echo "     API Docs: http://localhost:8000/docs"
echo ""
echo -e "${BLUE}🚀 Ready to deploy? See QUICK_DEPLOY.md${NC}"
echo ""
