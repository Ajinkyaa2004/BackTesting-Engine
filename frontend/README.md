# Algo Trading Platform - Frontend

Professional dashboard for the Algorithmic Trading Engine.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS (Strict strict light theme)
- **Components**: Radix UI primitives
- **Charts**: Recharts
- **Editor**: Monaco Editor
- **Data Fetching**: Axios

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser.

## Configuration
The API URL is configured in `lib/api.ts`.
Default: `http://localhost:8000`

## Features
- **Strategy Management**: Create, edit (Monaco), and delete Python strategies.
- **Backtesting Lab**: Configure and run simulations with real-time visualization.
- **History**: Archive of all past backtest runs with detailed trade logs.
- **Authentication**: Secure JWT login/registration.

## Color System
This project uses a strict **Light Mode** theme defined in `app/globals.css`.
Do not introduce dark mode or arbitrary colors. Use CSS variables (e.g., `var(--color-primary)`).
