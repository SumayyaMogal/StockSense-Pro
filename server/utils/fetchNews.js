
const axios = require("axios");
const Sentiment = require("sentiment");

const sentimentAnalyzer = new Sentiment();
const newsCache = new Map();
const NEWS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const fetchNewsAndSentiment = async (symbol, companyName) => {
  const cacheKey = symbol.toUpperCase();
  const cached = newsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < NEWS_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const query = companyName || symbol;
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: `${query} stock`,
        language: "en",
        sortBy: "publishedAt",
        pageSize: 5,
        apiKey: process.env.NEWS_API_KEY,
      },
      timeout: 10000,
    });

    const articles = response.data.articles || [];

    const headlines = articles.map((a) => a.title).filter(Boolean);

    // Analyze sentiment for each headline
    const analyzedHeadlines = headlines.map((headline) => {
      const result = sentimentAnalyzer.analyze(headline);
      let label;
      if (result.score > 1) label = "Positive";
      else if (result.score < -1) label = "Negative";
      else label = "Neutral";

      return {
        title: headline,
        url: articles.find((a) => a.title === headline)?.url || "#",
        source: articles.find((a) => a.title === headline)?.source?.name || "News",
        sentiment: label,
        publishedAt: articles.find((a) => a.title === headline)?.publishedAt,
      };
    });

    // Overall badge
    const scores = analyzedHeadlines.map((h) => sentimentAnalyzer.analyze(h.title).score);
    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    let badge;
    if (avgScore > 1) badge = "Bullish";
    else if (avgScore < -1) badge = "Bearish";
    else badge = "Neutral";

    const result = {
      symbol: symbol.toUpperCase(),
      badge,
      headlines: analyzedHeadlines,
      rawHeadlines: headlines,
    };

    newsCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;

  } catch (err) {
    console.error("News fetch error:", err.message);
    return {
      symbol: symbol.toUpperCase(),
      badge: "Neutral",
      headlines: [],
      rawHeadlines: [],
    };
  }
};

module.exports = { fetchNewsAndSentiment };