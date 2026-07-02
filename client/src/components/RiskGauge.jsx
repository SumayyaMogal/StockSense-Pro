
const RiskGauge = ({ riskScore }) => {
  if (!riskScore) return null;

  const colors = {
    green: "text-green-400",
    yellow: "text-yellow-400",
    orange: "text-orange-400",
    red: "text-red-400",
  };

  const bgColors = {
    green: "bg-green-900/20 border-green-500/30",
    yellow: "bg-yellow-900/20 border-yellow-500/30",
    orange: "bg-orange-900/20 border-orange-500/30",
    red: "bg-red-900/20 border-red-500/30",
  };

  const barWidth = `${(riskScore.score / 5) * 100}%`;

  const barColor = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  return (
    <div className={`rounded-2xl p-5 border ${bgColors[riskScore.color]}`}>
      <div className="flex justify-between items-center mb-3">
        <p className="text-gray-400 text-xs uppercase tracking-wide">Portfolio Risk</p>
        <span className={`text-sm font-bold ${colors[riskScore.color]}`}>
          {riskScore.label}
        </span>
      </div>

      {/* Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor[riskScore.color]}`}
          style={{ width: barWidth }}
        />
      </div>

      {/* Score dots */}
      <div className="flex justify-between mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`w-2 h-2 rounded-full ${
              n <= riskScore.score ? barColor[riskScore.color] : "bg-gray-700"
            }`}
          />
        ))}
      </div>

      <p className="text-gray-400 text-xs">{riskScore.advice}</p>
    </div>
  );
};

export default RiskGauge;