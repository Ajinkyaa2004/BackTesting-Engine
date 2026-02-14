#!/bin/bash
# start_local.sh - Start both backend and frontend for local development

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Backtesting Engine Locally...${NC}"
echo ""

# Check if running from project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Stopping all services...${NC}"
    pkill -P $$
    echo -e "${GREEN}Services stopped.${NC}"
}

trap cleanup SIGINT EXIT

# Start backend
echo -e "${BLUE}Starting Backend Server...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Run ./setup_env.sh first${NC}"
    exit 1
fi

./venv/bin/python3 -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start frontend
echo -e "${BLUE}Starting Frontend Server...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Both servers are starting up!${NC}"
echo ""
echo -e "${BLUE}Access your application at:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for background processes
wait
