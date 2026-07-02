
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Trade Explainer — fires after every buy/sell
const generateTradeExplainer = async (symbol, companyName, action, price, changePercent, headlines) => {
  try {
    const headlineText = headlines.length > 0
      ? headlines.slice(0, 3).map((h, i) => `${i + 1}. ${h}`).join("\n")
      : "No recent news available.";

    const prompt = `You are a financial educator helping beginner investors understand the stock market.

A user just ${action === "BUY" ? "bought" : "sold"} ${companyName} (${symbol}) at ₹${price}.
The stock has moved ${changePercent} today.

Recent news headlines:
${headlineText}

Write a 3-4 sentence explanation in simple language:
1. Why the stock price moved today
2. What market concept this demonstrates
3. What the user should watch next

Keep it beginner-friendly, factual, and under 100 words. Do not give investment advice.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    return message.content[0].text;
  } catch (err) {
    console.error("AI Explainer error:", err.message);
    return null;
  }
};

// Trade Autopsy — fires when sell price < buy price
const generateTradeAutopsy = async (symbol, companyName, buyPrice, sellPrice, holdDays, headlines) => {
  try {
    const loss = ((sellPrice - buyPrice) / buyPrice * 100).toFixed(2);
    const headlineText = headlines.length > 0
      ? headlines.slice(0, 3).map((h, i) => `${i + 1}. ${h}`).join("\n")
      : "No recent news available.";

    const prompt = `You are a financial coach helping a beginner investor learn from a losing trade.

Trade details:
- Stock: ${companyName} (${symbol})
- Bought at: ₹${buyPrice}
- Sold at: ₹${sellPrice}
- Loss: ${loss}%
- Held for: ${holdDays} days
- Recent news: 
${headlineText}

Write a trade autopsy with exactly these 4 sections:
**What Happened:** (1-2 sentences explaining the price drop)
**Signal You Missed:** (1 sentence about what to look for next time)
**Risk Management Mistake:** (1 sentence about position sizing or stop loss)
**Lesson:** (1 sentence key takeaway)

Keep it educational, not discouraging. Under 120 words total.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 250,
      messages: [{ role: "user", content: prompt }],
    });

    return message.content[0].text;
  } catch (err) {
    console.error("AI Autopsy error:", err.message);
    return null;
  }
};

// Bankruptcy Analysis
const generateBankruptcyAnalysis = async (trades) => {
  try {
    const tradesSummary = trades
      .slice(0, 10)
      .map((t) => `${t.action} ${t.symbol} at ₹${t.price} (qty: ${t.quantity})`)
      .join("\n");

    const prompt = `You are a financial coach. A beginner investor lost 90% of their virtual portfolio.

Their last 10 trades:
${tradesSummary}

Write a bankruptcy analysis with exactly these 3 sections:
**What Went Wrong:** (2 sentences about trading patterns)
**Key Mistakes:** (2-3 bullet points)
**Recovery Plan:** (2 sentences on how to restart smarter)

Keep it encouraging and educational. Under 150 words.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    return message.content[0].text;
  } catch (err) {
    console.error("AI Bankruptcy error:", err.message);
    return null;
  }
};

module.exports = {
  generateTradeExplainer,
  generateTradeAutopsy,
  generateBankruptcyAnalysis,
};