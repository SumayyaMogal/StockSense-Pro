
import { useState, useEffect } from "react";
import { getSentiment } from "../api/portfolio";

const SentimentBadge = ({ symbol, companyName }) => {
  const [data, setData] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSentiment(symbol, companyName)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return <span className="text-xs text-gray-400">Loading...</span>;
  }

  if (!data) return null;

  const getBadgeColor = () => {
    if (data.badge === "Bullish") return "text-green-400 border-green-500";
    if (data.badge === "Bearish") return "text-red-400 border-red-500";
    return "text-yellow-400 border-yellow-500";
  };

  const getBadgeIcon = () => {
    if (data.badge === "Bullish") return "🟢";
    if (data.badge === "Bearish") return "🔴";
    return "🟡";
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === "Positive") return "text-green-400";
    if (sentiment === "Negative") return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowDrawer(!showDrawer)}
        className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColor()}`}
      >
        {getBadgeIcon()} {data.badge}
      </button>

      {showDrawer && (
        <div className="absolute top-6 left-0 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-xl w-72 p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-white text-sm font-semibold">News — {symbol}</p>
            <button
              onClick={() => setShowDrawer(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          {data.headlines.length === 0 ? (
            <p className="text-gray-500 text-xs">No news available</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.headlines.map((h, i) => (
                <div key={i} className="pb-2 border-b border-gray-800">
                  <p className="text-xs text-gray-300 mb-1">{h.title}</p>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">{h.source}</span>
                    <span className={`text-xs ${getSentimentColor(h.sentiment)}`}>
                      {h.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SentimentBadge;