#!/bin/bash

# run_app.sh - Script to run frontend and backend

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Backtesting Engine ===${NC}"

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Stopping all services...${NC}"
    # Kill all child processes of this script
    pkill -P $$ 
    echo -e "${GREEN}Services stopped.${NC}"
}

# Trap SIGINT (Ctrl+C)
# trapping EXIT instead of just SIGINT ensures cleanup happens on normal exit or error too
trap cleanup SIGINT EXIT

# --- Backend Setup & Start ---
echo -e "${BLUE}--- Checking Backend ---${NC}"
cd "$PROJECT_ROOT/backend" || { echo -e "${RED}Backend directory not found!${NC}"; exit 1; }

# Check if venv exists, create if not
if [ ! -d "venv" ]; then
    echo -e "${BLUE}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Check if uvicorn is installed
if ! command -v uvicorn &> /dev/null; then
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    pip install -r requirements.txt
fi

echo -e "${GREEN}Starting Backend Server...${NC}"
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# --- Frontend Setup & Start ---
echo -e "${BLUE}--- Checking Frontend ---${NC}"
cd "$PROJECT_ROOT/frontend" || { echo -e "${RED}Frontend directory not found!${NC}"; exit 1; }

echo -e "${GREEN}Starting Frontend Server...${NC}"
npm run dev &
FRONTEND_PID=$!

# Go back to root
cd "$PROJECT_ROOT"

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}Backend running at: http://localhost:8000${NC}"
echo -e "${GREEN}Frontend running at: http://localhost:3000${NC}"
echo -e "${BLUE}Press Ctrl+C to stop both servers.${NC}"
echo -e "${BLUE}=======================================${NC}"

# Wait for both processes
# wait $BACKEND_PID $FRONTEND_PID is better but wait acts on all children by default if no args
# We use a keep-alive loop or just wait
wait
