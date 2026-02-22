# Stocks Portfolio Tracker

A real-time stock portfolio dashboard that tracks Indian stock holdings across sectors with live market data from Yahoo Finance and Google Finance.

Built with **Next.js 16** (frontend) and **Express + TypeScript** (backend).

## Features

- Live CMP (Current Market Price) from Yahoo Finance
- P/E ratios scraped from Google Finance with derived EPS
- Sector-wise grouping with gain/loss summaries
- Portfolio-level totals and percentage breakdowns
- Manual refresh with smart cache invalidation
- Responsive dark-themed UI

## Tech Stack

| Layer    | Tech                                           |
| -------- | ---------------------------------------------- |
| Frontend | Next.js 16, React 19, TailwindCSS 4, Recharts |
| Backend  | Express, TypeScript, Cheerio, Axios            |
| Caching  | node-cache (in-memory)                         |

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### 1. Clone the repo

```bash
git clone <repo-url>
cd stocks-portfolio
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file (optional):

```env
PORT=5000
```

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:5000/api/portfolio`.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

| Method | Endpoint                 | Description                                          |
| ------ | ------------------------ | ---------------------------------------------------- |
| GET    | `/api/portfolio`         | Full portfolio data with live CMP, P/E, and earnings |
| GET    | `/api/portfolio/refresh` | Clears portfolio cache and returns fresh data         |
| GET    | `/api/health`            | Health check                                         |

## Project Structure

```
stocks-portfolio/
├── backend/
│   └── src/
│       ├── index.ts              # Express server entry
│       ├── routes/portfolio.ts   # Portfolio API routes
│       ├── services/
│       │   ├── yahooFinance.ts   # Yahoo Finance CMP fetcher
│       │   ├── googleFinance.ts  # Google Finance P/E scraper
│       │   └── cache.ts         # In-memory cache (node-cache)
│       └── data/holdings.ts     # Stock holdings data
├── frontend/
│   ├── app/page.tsx             # Main dashboard page
│   ├── components/              # UI components
│   └── lib/
│       ├── api.ts               # API client
│       └── utils.ts             # Utility functions
```
