const User = require("../models/User");
const Holding = require("../models/Holding");
const Trade = require("../models/Trade");
const PortfolioSnapshot = require("../models/PortfolioSnapshot");
const { fetchStockPrice } = require("../utils/fetchStockPrice");
const { generateTradeExplainer, generateTradeAutopsy } = require("../utils/aiHelper");
const { fetchNewsAndSentiment } = require("../utils/fetchNews");

const saveSnapshot = async (userId) => {
const user = await User.findById(userId);
const holdings = await Holding.find({ userId });

  let currentValue = 0;
  for (const h of holdings) {
    const stockData = await fetchStockPrice(h.symbol);
    const price = stockData ? stockData.price : h.avgBuyPrice;
    currentValue += price * h.quantity;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await PortfolioSnapshot.create({
    userId,
    totalValue: user.balance + currentValue,
    balance: user.balance,
    investedValue: currentValue,
  });
};

// POST /api/trade/buy
const buyStock = async (req, res) => {
  try {
    const { symbol, companyName, quantity } = req.body;
    const userId = req.user.id;

    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid symbol or quantity" });
    }

    const stockData = await fetchStockPrice(symbol);
    if (!stockData) {
      return res.status(404).json({ message: "Stock not found or API limit reached" });
    }

    const price = stockData.price;
    const total = price * quantity;

    const user = await User.findById(userId);
    if (user.balance < total) {
      return res.status(400).json({
        message: `Insufficient balance. You need ₹${total.toFixed(2)} but have ₹${user.balance.toFixed(2)}`,
      });
    }

    user.balance -= total;
    await user.save();

    const existingHolding = await Holding.findOne({ userId, symbol });
    if (existingHolding) {
      const totalShares = existingHolding.quantity + quantity;
      const totalCost = existingHolding.totalInvested + total;
      existingHolding.quantity = totalShares;
      existingHolding.avgBuyPrice = totalCost / totalShares;
      existingHolding.totalInvested = totalCost;
      await existingHolding.save();
    } else {
      await Holding.create({
        userId,
        symbol,
        companyName: companyName || symbol,
        quantity,
        avgBuyPrice: price,
        totalInvested: total,
      });
    }

    const trade = await Trade.create({
      userId,
      symbol,
      companyName: companyName || symbol,
      action: "BUY",
      quantity,
      price,
      total,
    });

    await saveSnapshot(userId);

    // Generate AI explainer in background
    (async () => {
      try {
        const newsData = await fetchNewsAndSentiment(symbol, companyName);
        const explainer = await generateTradeExplainer(
          symbol,
          companyName,
          "BUY",
          price,
          stockData.changePercent,
          newsData.rawHeadlines
        );
        if (explainer) {
          await Trade.findByIdAndUpdate(trade._id, { aiExplainer: explainer });
          console.log(`AI Explainer saved for ${symbol}`);
        }
      } catch (err) {
        console.error("Background AI error:", err.message);
      }
    })();

    res.status(201).json({
      message: `Successfully bought ${quantity} shares of ${symbol}`,
      trade,
      newBalance: user.balance,
    });

  } catch (err) {
    console.error("Buy error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Record trade
const trade = await Trade.create({
  userId,
  symbol,
  companyName: companyName || symbol,
  action: "BUY",
  quantity,
  price,
  total,
});

// Save portfolio snapshot
await saveSnapshot(userId);

// Generate AI explainer in background (don't await — non-blocking)
(async () => {
  try {
    const newsData = await fetchNewsAndSentiment(symbol, companyName);
    const explainer = await generateTradeExplainer(
      symbol,
      companyName,
      "BUY",
      price,
      stockData.changePercent,
      newsData.rawHeadlines
    );
    if (explainer) {
      await Trade.findByIdAndUpdate(trade._id, { aiExplainer: explainer });
      console.log(`AI Explainer saved for ${symbol} trade`);
    }
  } catch (err) {
    console.error("Background AI explainer error:", err.message);
  }
})();

res.status(201).json({
  message: `Successfully bought ${quantity} shares of ${symbol}`,
  trade,
  newBalance: user.balance,
});

// POST /api/trade/sell
const sellStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user.id;

    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid symbol or quantity" });
    }

    const holding = await Holding.findOne({ userId, symbol });
    if (!holding) {
      return res.status(400).json({ message: `You don't own any shares of ${symbol}` });
    }

    if (holding.quantity < quantity) {
      return res.status(400).json({
        message: `You only own ${holding.quantity} shares of ${symbol}`,
      });
    }

    const stockData = await fetchStockPrice(symbol);
    if (!stockData) {
      return res.status(404).json({ message: "Stock not found or API limit reached" });
    }

    const price = stockData.price;
    const total = price * quantity;
    const costBasis = holding.avgBuyPrice * quantity;
    const profitLoss = total - costBasis;

    const user = await User.findById(userId);
    user.balance += total;
    await user.save();

    holding.quantity -= quantity;
    holding.totalInvested -= costBasis;

    if (holding.quantity === 0) {
      await Holding.deleteOne({ _id: holding._id });
    } else {
      await holding.save();
    }

    const trade = await Trade.create({
      userId,
      symbol,
      companyName: holding.companyName,
      action: "SELL",
      quantity,
      price,
      total,
    });

    await saveSnapshot(userId);

    // Generate AI explainer + autopsy in background
    (async () => {
      try {
        const newsData = await fetchNewsAndSentiment(symbol, holding.companyName);

        const explainer = await generateTradeExplainer(
          symbol,
          holding.companyName,
          "SELL",
          price,
          stockData.changePercent,
          newsData.rawHeadlines
        );

        let autopsy = null;
        if (price < holding.avgBuyPrice) {
          const holdDays = Math.ceil(
            (Date.now() - new Date(holding.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          autopsy = await generateTradeAutopsy(
            symbol,
            holding.companyName,
            holding.avgBuyPrice,
            price,
            holdDays,
            newsData.rawHeadlines
          );
        }

        await Trade.findByIdAndUpdate(trade._id, {
          aiExplainer: explainer,
          autopsy: autopsy,
        });

        console.log(`AI content saved for ${symbol} sell`);
      } catch (err) {
        console.error("Background AI sell error:", err.message);
      }
    })();

    res.json({
      message: `Successfully sold ${quantity} shares of ${symbol}`,
      trade,
      newBalance: user.balance,
      profitLoss: profitLoss.toFixed(2),
    });

  } catch (err) {
    console.error("Sell error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Record trade
const trade = await Trade.create({
  userId,
  symbol,
  companyName: holding.companyName,
  action: "SELL",
  quantity,
  price,
  total,
});

// Save portfolio snapshot
await saveSnapshot(userId);

// Generate AI explainer + autopsy in background
(async () => {
  try {
    const newsData = await fetchNewsAndSentiment(symbol, holding.companyName);

    // Always generate explainer
    const explainer = await generateTradeExplainer(
      symbol,
      holding.companyName,
      "SELL",
      price,
      stockData.changePercent,
      newsData.rawHeadlines
    );

    // Generate autopsy only if sold at a loss
    let autopsy = null;
    if (price < holding.avgBuyPrice) {
      const holdDays = Math.ceil(
        (Date.now() - new Date(holding.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      autopsy = await generateTradeAutopsy(
        symbol,
        holding.companyName,
        holding.avgBuyPrice,
        price,
        holdDays,
        newsData.rawHeadlines
      );
    }

    await Trade.findByIdAndUpdate(trade._id, {
      aiExplainer: explainer,
      autopsy: autopsy,
    });

    console.log(`AI content saved for ${symbol} sell trade`);
  } catch (err) {
    console.error("Background AI sell error:", err.message);
  }
})();

res.json({
  message: `Successfully sold ${quantity} shares of ${symbol}`,
  trade,
  newBalance: user.balance,
  profitLoss: profitLoss.toFixed(2),
});

// GET /api/trade/history
const getTradeHistory = async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { buyStock, sellStock, getTradeHistory };