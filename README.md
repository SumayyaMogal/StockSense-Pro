# StockSense Pro 📈

> **AI-powered paper trading platform that transforms every trade into a learning experience.**  
> Trade with ₹1,00,000 virtual money. Get AI explanations after every trade. Learn from every loss — for free.

---

## What Is StockSense Pro?

Most people lose real money in the stock market not because they are unintelligent, but because they have no safe space to practice. Opening a brokerage account and trading with real money is the only way most people learn — and the market charges full price for those lessons.

**StockSense Pro solves this.** It is a full-stack MERN web application that lets users simulate buying and selling real NSE-listed stocks with virtual money, while an AI layer explains every price movement, analyzes every losing trade, and scores portfolio risk in real time.

Unlike traditional paper trading apps that only simulate trades, StockSense Pro makes every trade a lesson — without any real money at risk.

---

## Live Demo

> **Frontend:** `http://localhost:5173`  
> **Backend API:** `http://localhost:5000`

---

## Features

### 🔐 Authentication
- Secure user registration with JWT-based login
- bcrypt password hashing — passwords never stored in plain text
- Email OTP verification via Gmail SMTP (Nodemailer)
- Protected routes — dashboard inaccessible without valid token
- Every new user starts with ₹1,00,000 virtual balance

### 📊 Trading Engine
- Search 15+ popular NSE stocks by name or symbol
- Live stock prices via Alpha Vantage API with 5-minute caching
- Buy and sell stocks with real-time balance deduction
- Average cost basis calculation for stocks bought at multiple prices
- Oversell and insufficient funds validation
- Instant portfolio update after every trade

### 💼 Portfolio Dashboard
- Cash balance, total invested, current value, and overall P&L
- Holdings table with quantity, avg buy price, current price, and P&L per stock
- Portfolio value over time chart (Recharts line chart)
- Real-time P&L shown in green (profit) and red (loss)

### 🧠 AI Trade Explainer (Powered by Claude)
- Fires automatically after every buy or sell
- Claude AI receives stock name, price movement, and recent news headlines
- Returns a 3-4 sentence plain-English explanation of why the stock moved
- Explains the financial concept involved (earnings, FII activity, macro events)
- Saved to trade history — visible on every trade card
- Generated in background — trade executes instantly without waiting for AI

### 🔍 Trade Autopsy Engine
- Triggers automatically when a user sells at a loss
- AI analyzes the specific trade: what happened, signals missed, risk management mistake, and key lesson
- Displayed as a red card below the trade in history
- Turns every losing trade into a structured learning moment

### 📰 News Sentiment Analysis
- Fetches top 5 recent headlines for each stock via NewsAPI
- VADER sentiment scoring classifies each headline: Positive / Negative / Neutral
- Aggregate badge displayed on each holding: 🟢 Bullish / 🔴 Bearish / 🟡 Neutral
- Click badge to open news drawer with all headlines and individual sentiment labels
- Cached for 30 minutes per stock to conserve API calls

### 📉 Portfolio Risk Score
- Calculates risk score (1-5) after every trade
- Factors: single stock concentration, number of holdings, sector diversity, cash ratio
- Displayed as a visual gauge on the dashboard: Low / Moderate / Medium / High / Aggressive
- Personalized advice card generated per score level
- No external API needed — pure mathematical formula in backend

### 🏆 Leaderboard
- All users ranked by portfolio return percentage (not absolute value — fair for all)
- Three tabs: All Time, This Week, Today
- Logged-in user's row highlighted with their rank and P&L
- Redis-cached with 15-minute TTL to avoid repeated database hits

### 💀 Bankruptcy Recovery Module
- Triggers when portfolio value drops below ₹10,000 (90% loss from starting balance)
- AI analyzes last 10 trades and generates a "What Went Wrong" breakdown
- Three recovery options: Guided Restart (₹50,000 + mandatory lessons), Full Restart (₹1,00,000), Practice Mode
- All bankruptcy events logged as "Battle Scars" on user profile

### 📋 Transaction History
- Full log of every buy and sell with timestamp, quantity, price, and total
- AI Explainer card displayed below every trade
- Trade Autopsy card displayed below loss trades
- Filterable by stock name, action type, and date

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js + Vite | UI framework and build tool |
| Styling | Tailwind CSS | Utility-first CSS |
| Charts | Recharts | Portfolio value chart, P&L visualization |
| Routing | React Router v6 | Client-side navigation |
| HTTP Client | Axios | API calls from frontend |
| Backend | Node.js + Express.js | REST API server |
| Database | MongoDB Atlas | Users, trades, holdings, snapshots |
| ODM | Mongoose | MongoDB schema and queries |
| Auth | JWT + bcrypt | Stateless auth tokens + password hashing |
| Email | Nodemailer | OTP email via Gmail SMTP |
| Caching | Redis (Upstash) | Leaderboard and sentiment caching |
| Stock Prices | Alpha Vantage API | Live + historical NSE stock data |
| News | NewsAPI | Stock-related news headlines |
| Sentiment | VADER (npm sentiment) | Headline sentiment classification |
| AI | Anthropic Claude API | Trade explainer, autopsy, bankruptcy analysis |

---

## Project Structure

```
stocksense-pro/
├── client/                          # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js             # Axios instance with JWT interceptor
│   │   │   └── portfolio.js         # Portfolio and trade API functions
│   │   ├── components/
│   │   │   ├── AIExplainerCard.jsx  # AI insight card shown after trades
│   │   │   ├── AutopsyCard.jsx      # Trade autopsy card for loss trades
│   │   │   ├── ProtectedRoute.jsx   # Route guard for authenticated pages
│   │   │   ├── RiskGauge.jsx        # Portfolio risk score gauge
│   │   │   └── SentimentBadge.jsx   # News sentiment badge with drawer
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state, login, register, logout
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Main portfolio dashboard
│   │   │   ├── History.jsx          # Trade history with AI cards
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration page
│   │   │   ├── Trade.jsx            # Stock search and trading page
│   │   │   └── VerifyOTP.jsx        # Email OTP verification page
│   │   ├── App.jsx                  # Router and route definitions
│   │   └── main.jsx                 # React entry point
│   └── package.json
│
└── server/                          # Node.js + Express backend
    ├── controllers/
    │   ├── authController.js        # Register, login, OTP verify, resend
    │   ├── portfolioController.js   # Portfolio fetch, stock price, search
    │   └── tradeController.js       # Buy, sell, trade history
    ├── middleware/
    │   └── authMiddleware.js        # JWT token verification
    ├── models/
    │   ├── Holding.js               # Holdings schema (symbol, qty, avgBuy)
    │   ├── PortfolioSnapshot.js     # Portfolio value snapshots for chart
    │   ├── Trade.js                 # Trade history with AI fields
    │   └── User.js                  # User schema with OTP fields
    ├── routes/
    │   ├── authRoutes.js            # /api/auth/* routes
    │   ├── portfolioRoutes.js       # /api/portfolio/* routes
    │   ├── sentimentRoutes.js       # /api/sentiment/* routes
    │   └── tradeRoutes.js           # /api/trade/* routes
    ├── utils/
    │   ├── aiHelper.js              # Anthropic Claude API calls
    │   ├── fetchNews.js             # NewsAPI + VADER sentiment
    │   ├── fetchStockPrice.js       # Alpha Vantage with key rotation
    │   ├── riskScore.js             # Portfolio risk calculator
    │   └── sendEmail.js             # Nodemailer OTP email sender
    ├── .env                         # Environment variables (not committed)
    ├── index.js                     # Express server entry point
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- MongoDB Atlas account (free tier)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/stocksense-pro.git
cd stocksense-pro
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/stocksense
JWT_SECRET=your_super_secret_jwt_key_here

# Alpha Vantage (get free key at alphavantage.co)
ALPHA_VANTAGE_KEY_1=your_key_1
ALPHA_VANTAGE_KEY_2=your_key_2
ALPHA_VANTAGE_KEY_3=your_key_3
ALPHA_VANTAGE_KEY_4=your_key_4

# NewsAPI (get free key at newsapi.org)
NEWS_API_KEY=your_newsapi_key

# Anthropic Claude (get key at console.anthropic.com)
ANTHROPIC_API_KEY=your_anthropic_key

# Gmail SMTP (use Gmail App Password — not regular password)
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=StockSense Pro <yourgmail@gmail.com>
```

Start the backend:

```bash
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

### 3. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login with email + password | No |
| POST | `/api/auth/verify-otp` | Verify email OTP | No |
| POST | `/api/auth/resend-otp` | Resend OTP email | No |
| GET | `/api/auth/me` | Get logged-in user data | Yes |

### Portfolio

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/portfolio` | Get full portfolio with P&L and risk score | Yes |
| GET | `/api/portfolio/stock/:symbol` | Get live price for a stock | Yes |
| GET | `/api/portfolio/search/:keyword` | Search stocks by name or symbol | Yes |

### Trading

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/trade/buy` | Buy shares of a stock | Yes |
| POST | `/api/trade/sell` | Sell shares of a stock | Yes |
| GET | `/api/trade/history` | Get all trades with AI cards | Yes |

### Sentiment

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/sentiment/:symbol` | Get news sentiment for a stock | Yes |

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Backend server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for JWT token signing |
| `ALPHA_VANTAGE_KEY_1` to `_4` | Yes | Alpha Vantage API keys (25 calls/day each) |
| `NEWS_API_KEY` | Yes | NewsAPI key (100 calls/day free) |
| `ANTHROPIC_API_KEY` | Yes | Anthropic Claude API key |
| `EMAIL_USER` | Yes | Gmail address for sending OTPs |
| `EMAIL_PASS` | Yes | Gmail App Password (16 characters, no spaces) |
| `EMAIL_FROM` | Yes | Display name + email for OTP sender |

---

## How the AI Pipeline Works

```
User executes a trade (buy or sell)
            ↓
Trade saved to MongoDB immediately
            ↓
Response sent to user instantly (no AI delay)
            ↓
Background async process starts:
    1. Fetch news headlines for the stock (NewsAPI)
    2. Build dynamic prompt with stock name, price, change%, headlines
    3. Call Anthropic Claude API (claude-sonnet-4-6)
    4. Receive 3-4 sentence explanation
    5. Save explanation to trade document in MongoDB
            ↓
Next time user opens Trade History:
    → AI Explainer card appears below the trade
    → If loss trade: Autopsy card also appears
```

---

## How the Risk Score Is Calculated

```
Inputs:
  - Number of distinct stocks held
  - Largest single stock as % of total portfolio
  - Cash balance as % of total portfolio

Formula:
  score = base 1
  + 2 if single stock > 70% of portfolio
  + 1 if single stock > 50% of portfolio
  + 2 if only 1 stock held
  + 1 if only 2 stocks held
  + 1 if cash < 10% of portfolio
  + 0.5 if cash < 20% of portfolio

  capped at 5

Output: score (1-5) + label + advice string
```

---

## Testing Checklist

### Week 1 — Authentication
- [ ] Register → OTP email arrives in inbox
- [ ] Enter OTP → redirected to dashboard with ₹1,00,000 balance
- [ ] Login → JWT token returned, dashboard loads
- [ ] Access `/dashboard` without token → redirected to `/login`
- [ ] Wrong password → "Invalid email or password" error

### Week 2 — Trading
- [ ] Search stock → results appear → select → live price loads
- [ ] Buy stock → balance deducted → holding appears in dashboard
- [ ] Sell stock → balance increases → holding reduces or disappears
- [ ] Buy more than balance → "Insufficient balance" error
- [ ] Sell more than owned → error message
- [ ] Portfolio chart updates after each trade

### Week 3 — AI Features
- [ ] Buy a stock → wait 10 seconds → check History → AI Explainer card appears
- [ ] Sell at a loss → check History → Trade Autopsy card appears
- [ ] Dashboard → Risk gauge visible with score and advice
- [ ] Holdings → sentiment badge (🟢/🔴/🟡) visible on each stock
- [ ] Click sentiment badge → news drawer opens with headlines

---

## Known Limitations

- **Alpha Vantage free tier:** 25 API calls/day per key. Using 4 keys gives 100 calls/day. Prices are cached for 5 minutes to conserve calls.
- **NewsAPI free tier:** 100 calls/day. News is cached for 30 minutes per stock.
- **AI response time:** Claude API takes 2-5 seconds. AI explainer is generated in the background so trades execute instantly.
- **Market hours:** Alpha Vantage returns last closing price outside NSE market hours (9:15 AM – 3:30 PM IST, Mon-Fri).

---

## Roadmap

- [ ] Price trend prediction using ML (Linear Regression on 30-day historical data)
- [ ] AI Quiz Generator — personalized MCQs based on each trade's financial concept
- [ ] AI Chat Assistant — beginner Q&A ("What is P/E ratio?")
- [ ] Interactive learning lessons with progress tracking
- [ ] Gamification — XP, badges, streaks
- [ ] Mobile app (React Native)
- [ ] WebSocket real-time price updates

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Author

Built for IIITA Hackathon — Problem Statement 1: Smart Trading & Portfolio Platform

> *"Every trade is a lesson. Every loss is a lecture."*
