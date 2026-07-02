import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchStocks, getStockPrice, buyStock, sellStock } from "../api/portfolio";

const Trade = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockPrice, setStockPrice] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [action, setAction] = useState("BUY");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await searchStocks(query);
      setResults(res.data);
    } catch {
      setError("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectStock = async (stock) => {
    setSelectedStock(stock);
    setResults([]);
    setQuery(stock.symbol);
    setError("");
    setMessage(null);
    try {
      const res = await getStockPrice(stock.symbol);
      setStockPrice(res.data);
    } catch {
      setError("Could not fetch price. API limit may be reached.");
    }
  };

  const handleTrade = async () => {
    if (!selectedStock || !stockPrice) return;
    setLoading(true);
    setError("");
    setMessage(null);
    try {
      let res;
      if (action === "BUY") {
        res = await buyStock({
          symbol: selectedStock.symbol,
          companyName: selectedStock.name,
          quantity: parseInt(quantity),
        });
      } else {
        res = await sellStock({
          symbol: selectedStock.symbol,
          quantity: parseInt(quantity),
        });
      }
      setMessage({
        type: "success",
        text: res.data.message,
        balance: res.data.newBalance,
        pnl: res.data.profitLoss,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  const totalCost = stockPrice ? (stockPrice.price * quantity).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-400">StockSense Pro</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 hover:text-white text-sm"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-8">Trade Stocks</h2>

        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <label className="block text-gray-400 text-sm mb-2">Search Stock</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. RELIANCE, INFY, TCS"
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {searching ? "..." : "Search"}
            </button>
          </div>

          {results.length > 0 && (
            <div className="mt-3 bg-gray-800 rounded-xl overflow-hidden">
              {results.map((r) => (
                <button
                  key={r.symbol}
                  onClick={() => handleSelectStock(r)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-0 transition"
                >
                  <span className="font-semibold">{r.symbol}</span>
                  <span className="text-gray-400 text-sm ml-3">{r.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {stockPrice && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{stockPrice.symbol}</h3>
                <p className="text-gray-400 text-sm">{selectedStock?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">₹{stockPrice.price.toFixed(2)}</p>
                <p className={`text-sm mt-1 ${parseFloat(stockPrice.change) >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {parseFloat(stockPrice.change) >= 0 ? "▲" : "▼"} {stockPrice.changePercent}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
              <div>
                <p className="text-gray-500">Open</p>
                <p className="font-semibold">₹{stockPrice.open?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">High</p>
                <p className="font-semibold text-green-400">₹{stockPrice.high?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Low</p>
                <p className="font-semibold text-red-400">₹{stockPrice.low?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {stockPrice && (
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setAction("BUY")}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  action === "BUY"
                    ? "bg-green-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setAction("SELL")}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  action === "SELL"
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Sell
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 text-lg"
              />
            </div>

            <div className="bg-gray-800 rounded-xl p-4 mb-6 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Price per share</span>
                <span>₹{stockPrice.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Quantity</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-700 pt-2 mt-2">
                <span>{action === "BUY" ? "Total Cost" : "You Receive"}</span>
                <span className={action === "BUY" ? "text-red-400" : "text-green-400"}>
                  ₹{totalCost}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-900/40 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-4 text-sm">
                <p className="font-semibold">{message.text}</p>
                <p>New Balance: ₹{parseFloat(message.balance).toLocaleString("en-IN")}</p>
                {message.pnl && (
                  <p>P&L on this trade: {parseFloat(message.pnl) >= 0 ? "+" : ""}₹{message.pnl}</p>
                )}
              </div>
            )}

            <button
              onClick={handleTrade}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 ${
                action === "BUY"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading ? "Processing..." : `${action} ${quantity} share${quantity > 1 ? "s" : ""} of ${stockPrice.symbol}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trade;