
const AutopsyCard = ({ autopsy, symbol }) => {
  if (!autopsy) return null;

  // Parse sections from AI response
  const sections = autopsy.split("**").filter(Boolean);

  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mt-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔍</span>
        <span className="text-red-400 text-sm font-semibold">
          Trade Autopsy — {symbol}
        </span>
      </div>
      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
        {autopsy}
      </div>
    </div>
  );
};

export default AutopsyCard;