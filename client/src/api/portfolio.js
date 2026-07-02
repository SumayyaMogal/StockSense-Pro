
import api from "./axios";

export const getPortfolio = () => api.get("/portfolio");
export const getStockPrice = (symbol) => api.get(`/portfolio/stock/${symbol}`);
export const searchStocks = (keyword) => api.get(`/portfolio/search/${keyword}`);
export const buyStock = (data) => api.post("/trade/buy", data);
export const sellStock = (data) => api.post("/trade/sell", data);
export const getTradeHistory = () => api.get("/trade/history");
export const getSentiment = (symbol, name) =>
  api.get(`/sentiment/${symbol}?name=${encodeURIComponent(name)}`);