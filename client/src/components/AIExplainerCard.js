
const AIExplainerCard = ({ explainer, symbol, action }) => {
  if (!explainer) return null;

  return (
    <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mt-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🧠</span>
        <span className="text-purple-400 text-sm font-semibold">
          AI Insight — Why {symbol} moved
        </span>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{explainer}</p>
    </div>
  );
};

export default AIExplainerCard;