
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getPortfolio } from "../api/portfolio";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import RiskGauge from "../components/RiskGauge";
import SentimentBadge from "../components/SentimentBadge";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await getPortfolio();
      setPortfolio(res.data);
    } catch (err) {
      setError("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-purple-400 text-lg animate-pulse">Loading portfolio...</p>
      </div>
    );
  }

  const pnlPositive = parseFloat(portfolio?.totalPnL) >= 0;

  const chartData = portfolio?.snapshots?.map((s, i) => ({
    name: `T${i + 1}`,
    value: parseFloat(s.totalValue).toFixed(0),
  })) || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-400">StockSense Pro</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate("/trade")}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Trade
          </button>
          <button
            onClick={() => navigate("/history")}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition"
          >
            History
          </button>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white text-sm transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Welcome back, {user?.name} 👋</h2>
          <p className="text-gray-400 mt-1">Here's your portfolio overview</p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-2xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Cash Balance</p>
            <p className="text-2xl font-bold text-white mt-2">
              ₹{parseFloat(portfolio?.balance).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Invested</p>
            <p className="text-2xl font-bold text-white mt-2">
              ₹{parseFloat(portfolio?.totalInvested).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Current Value</p>
            <p className="text-2xl font-bold text-white mt-2">
              ₹{parseFloat(portfolio?.totalCurrentValue).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Total P&L</p>
            <p className={`text-2xl font-bold mt-2 ${pnlPositive ? "text-green-400" : "text-red-400"}`}>
              {pnlPositive ? "+" : ""}₹{parseFloat(portfolio?.totalPnL).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
            <p className={`text-xs mt-1 ${pnlPositive ? "text-green-500" : "text-red-500"}`}>
              {pnlPositive ? "▲" : "▼"} {portfolio?.totalPnLPercent}%
            </p>
            {/* Add after the 4 stat cards */}
            <div className="col-span-2 md:col-span-4">
              <RiskGauge riskScore={portfolio?.riskScore} />
            </div>
          </div>
        </div>

        {/* Portfolio Chart */}
        {chartData.length > 1 && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Portfolio Value Over Time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }}
                  labelStyle={{ color: "#9ca3af" }}
                  formatter={(value) => [`₹${parseFloat(value).toLocaleString("en-IN")}`, "Portfolio Value"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Holdings Table */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Your Holdings</h3>
            <button
              onClick={() => navigate("/trade")}
              className="text-purple-400 text-sm hover:underline"
            >
              + Add position
            </button>
          </div>

          {portfolio?.holdings?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No holdings yet.</p>
              <button
                onClick={() => navigate("/trade")}
                className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-sm font-semibold transition"
              >
                Make your first trade
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left py-3 pr-4">Stock</th>
                    <th className="text-right py-3 pr-4">Qty</th>
                    <th className="text-right py-3 pr-4">Avg Buy</th>
                    <th className="text-right py-3 pr-4">Current</th>
                    <th className="text-right py-3 pr-4">Invested</th>
                    <th className="text-right py-3">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio?.holdings?.map((h) => (
                    <tr key={h.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-4 pr-4">
                        <p className="font-semibold">{h.symbol}</p>
                        <p className="text-gray-500 text-xs">{h.companyName}</p>
                      </td>
                      <td className="text-right py-4 pr-4">{h.quantity}</td>
                      <td className="text-right py-4 pr-4">₹{h.avgBuyPrice.toFixed(2)}</td>
                      <td className="text-right py-4 pr-4">
                        <p>₹{h.currentPrice.toFixed(2)}</p>
                        <p className={`text-xs ${parseFloat(h.change) >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {parseFloat(h.change) >= 0 ? "▲" : "▼"} {h.changePercent}
                        </p>
                      </td>
                      <td className="text-right py-4 pr-4">₹{parseFloat(h.totalInvested).toFixed(2)}</td>
                      <td className={`text-right py-4 font-semibold ${parseFloat(h.pnl) >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {parseFloat(h.pnl) >= 0 ? "+" : ""}₹{parseFloat(h.pnl).toFixed(2)}
                        <p className="text-xs font-normal">{h.pnlPercent}%</p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-semibold">{h.symbol}</p>
                        <p className="text-gray-500 text-xs">{h.companyName}</p>
                        <div className="mt-1">
                          <SentimentBadge symbol={h.symbol} companyName={h.companyName} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;