
const axios = require("axios");

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const API_KEYS = [
  process.env.ALPHA_VANTAGE_KEY_1,
  process.env.ALPHA_VANTAGE_KEY_2,
  process.env.ALPHA_VANTAGE_KEY_3,
  process.env.ALPHA_VANTAGE_KEY_4,
].filter(Boolean);

let keyIndex = 0;
const getNextKey = () => {
  const key = API_KEYS[keyIndex];
  keyIndex = (keyIndex + 1) % API_KEYS.length;
  return key;
};

const isRateLimited = (data) => {
  return data["Note"] || data["Information"];
};

const buildResult = (symbol, data) => ({
  symbol,
  price: parseFloat(data["05. price"]),
  change: parseFloat(data["09. change"]),
  changePercent: data["10. change percent"],
  open: parseFloat(data["02. open"]),
  high: parseFloat(data["03. high"]),
  low: parseFloat(data["04. low"]),
  volume: parseInt(data["06. volume"]),
  previousClose: parseFloat(data["08. previous close"]),
});

const fetchStockPrice = async (symbol) => {
  const upperSymbol = symbol.toUpperCase()
    .replace(".BSE", "")
    .replace(".NS", "")
    .replace(".BO", "");

  // Return from cache if available
  const cached = cache.get(upperSymbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit: ${upperSymbol} ₹${cached.data.price}`);
    return cached.data;
  }

  // Try each key until one works
  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKey = getNextKey();

    try {
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "GLOBAL_QUOTE",
          symbol: `${upperSymbol}.BSE`,
          apikey: apiKey,
        },
        timeout: 10000,
      });

      if (isRateLimited(response.data)) {
        console.log(`Key ${apiKey.slice(0, 6)}... rate limited — trying next`);
        continue; // try next key
      }

      const data = response.data["Global Quote"];

      if (!data || !data["05. price"]) {
        console.log(`No data for ${upperSymbol} with this key — trying next`);
        continue;
      }

      const result = buildResult(upperSymbol, data);
      cache.set(upperSymbol, { data: result, timestamp: Date.now() });
      console.log(`Price for ${upperSymbol}: ₹${result.price} (${result.changePercent})`);
      return result;

    } catch (err) {
      console.error(`Key ${apiKey.slice(0, 6)}... error: ${err.message}`);
      continue;
    }
  }

  // All keys exhausted
  console.log(`All API keys rate limited for ${upperSymbol} — returning null`);
  return null;
};

const searchStocks = async (keyword) => {
  // Try each key until one works
  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKey = getNextKey();

    try {
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "SYMBOL_SEARCH",
          keywords: keyword,
          apikey: apiKey,
        },
        timeout: 10000,
      });

      if (isRateLimited(response.data)) {
        console.log(`Search key ${apiKey.slice(0, 6)}... rate limited — trying next`);
        continue;
      }

      const matches = response.data["bestMatches"] || [];

      return matches
        .filter((m) => m["4. region"] === "India/Bombay" || m["4. region"] === "India")
        .map((m) => ({
          symbol: m["1. symbol"].replace(".BSE", "").replace(".NSE", ""),
          name: m["2. name"],
          exchange: "BSE",
        }));

    } catch (err) {
      console.error(`Search error: ${err.message}`);
      continue;
    }
  }

  // All keys exhausted — return empty, no fallback
  console.log("All API keys rate limited for search — returning empty");
  return [];
};

module.exports = { fetchStockPrice, searchStocks };