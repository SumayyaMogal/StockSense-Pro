
const User = require("../models/User");
const Holding = require("../models/Holding");
const PortfolioSnapshot = require("../models/PortfolioSnapshot");
const { fetchStockPrice } = require("../utils/fetchStockPrice");
const { calculateRiskScore } = require("../utils/riskScore");

// GET /api/portfolio
const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    const holdings = await Holding.find({ userId });

    // Fetch live prices for all holdings
    
    // Sequential fetch with delay to avoid rate limiting
const holdingsWithPnL = [];
for (const h of holdings) {
  const stockData = await fetchStockPrice(h.symbol);
  const currentPrice = stockData ? stockData.price : h.avgBuyPrice;
  const currentValue = currentPrice * h.quantity;
  const pnl = currentValue - h.totalInvested;
  const pnlPercent = ((pnl / h.totalInvested) * 100).toFixed(2);

  holdingsWithPnL.push({
    symbol: h.symbol,
    companyName: h.companyName,
    quantity: h.quantity,
    avgBuyPrice: h.avgBuyPrice,
    currentPrice,
    totalInvested: h.totalInvested,
    currentValue,
    pnl: pnl.toFixed(2),
    pnlPercent,
    change: stockData?.change || 0,
    changePercent: stockData?.changePercent || "0%",
  });

  // Small delay between calls to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 500));
}

    // Overall portfolio stats
    const totalInvested = holdingsWithPnL.reduce((sum, h) => sum + h.totalInvested, 0);
    const totalCurrentValue = holdingsWithPnL.reduce((sum, h) => sum + h.currentValue, 0);
    const totalPnL = totalCurrentValue - totalInvested;
    const totalPnLPercent = totalInvested > 0
      ? ((totalPnL / totalInvested) * 100).toFixed(2)
      : "0.00";

    // Portfolio snapshots for chart (last 30)
    const snapshots = await PortfolioSnapshot.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);

      const riskScore = calculateRiskScore(
  holdingsWithPnL,
  user.balance,
  parseFloat(totalInvested)
);

    res.json({
      balance: user.balance,
      totalInvested: totalInvested.toFixed(2),
      totalCurrentValue: totalCurrentValue.toFixed(2),
      totalPnL: totalPnL.toFixed(2),
      totalPnLPercent,
      holdings: holdingsWithPnL,
      snapshots: snapshots.reverse(), // chronological order
      riskScore,
    });
  } catch (err) {
    console.error("Portfolio error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/portfolio/stock/:symbol
const getStockPrice = async (req, res) => {
  try {
    const { symbol } = req.params;
    const stockData = await fetchStockPrice(symbol);

    if (!stockData) {
      return res.status(404).json({ message: "Stock not found" });
    }

    res.json(stockData);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/portfolio/search/:keyword
const searchStock = async (req, res) => {
  try {
    const { searchStocks } = require("../utils/fetchStockPrice");
    const results = await searchStocks(req.params.keyword);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPortfolio, getStockPrice, searchStock };