
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTradeHistory } from "../api/portfolio";
import AIExplainerCard from "../components/AIExplainerCard";
import AutopsyCard from "../components/AutopsyCard";

const History = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTradeHistory()
      .then((res) => setTrades(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-400">StockSense Pro</h1>
        <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white text-sm">
          ← Back to Dashboard
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-8">Trade History</h2>

        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading...</p>
        ) : trades.length === 0 ? (
          <p className="text-gray-500">No trades yet.</p>
        ) : (
          <div className="bg-gray-900 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800 text-left">
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
  <>
    <tr key={t._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
      <td className="px-6 py-4">
        <p className="font-semibold">{t.symbol}</p>
        <p className="text-gray-500 text-xs">{t.companyName}</p>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
          t.action === "BUY"
            ? "bg-green-900/50 text-green-400"
            : "bg-red-900/50 text-red-400"
        }`}>
          {t.action}
        </span>
      </td>
      <td className="px-6 py-4">{t.quantity}</td>
      <td className="px-6 py-4">₹{t.price.toFixed(2)}</td>
      <td className="px-6 py-4">₹{t.total.toFixed(2)}</td>
      <td className="px-6 py-4 text-gray-400">
        {new Date(t.createdAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })}
      </td>
    </tr>

    {/* AI Cards span full width below the row */}
    {(t.aiExplainer || t.autopsy) && (
      <tr key={`ai-${t._id}`}>
        <td colSpan={6} className="px-6 pb-4">
          <AIExplainerCard
            explainer={t.aiExplainer}
            symbol={t.symbol}
            action={t.action}
          />
          <AutopsyCard
            autopsy={t.autopsy}
            symbol={t.symbol}
          />
        </td>
      </tr>
    )}
  </>
))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;