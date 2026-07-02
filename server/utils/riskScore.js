
const calculateRiskScore = (holdings, balance, totalInvested) => {
  if (!holdings || holdings.length === 0) {
    return {
      score: 1,
      label: "Low",
      color: "green",
      advice: "Your portfolio is all cash. Start investing to build your portfolio.",
    };
  }

  const totalPortfolio = balance + totalInvested;
  const cashRatio = balance / totalPortfolio;

  // Sector concentration (simplified — using first word of company name)
  const sectorMap = {};
  holdings.forEach((h) => {
    const sector = h.symbol; // using symbol as proxy for sector
    sectorMap[sector] = (sectorMap[sector] || 0) + h.currentValue;
  });

  const maxSectorValue = Math.max(...Object.values(sectorMap));
  const maxSectorPercent = maxSectorValue / totalPortfolio;

  // Largest single stock weight
  const largestStock = Math.max(...holdings.map((h) => h.currentValue));
  const largestStockPercent = largestStock / totalPortfolio;

  // Score calculation (1-5)
  let score = 1;

  if (largestStockPercent > 0.7) score += 2;
  else if (largestStockPercent > 0.5) score += 1;

  if (holdings.length === 1) score += 2;
  else if (holdings.length === 2) score += 1;

  if (cashRatio < 0.1) score += 1;
  else if (cashRatio < 0.2) score += 0.5;

  score = Math.min(5, Math.round(score));

  const labels = {
    1: { label: "Low", color: "green", advice: "Well diversified portfolio. Keep maintaining balance across sectors." },
    2: { label: "Moderate", color: "yellow", advice: "Decent diversification. Consider adding one more stock from a different sector." },
    3: { label: "Medium", color: "orange", advice: "Moderate concentration risk. Try diversifying across at least 4-5 different stocks." },
    4: { label: "High", color: "red", advice: "High concentration in few stocks. Consider spreading your investment across more sectors." },
    5: { label: "Aggressive", color: "red", advice: "⚠️ Danger zone. Your portfolio is heavily concentrated. Diversify immediately to reduce risk." },
  };

  return { score, ...labels[score] };
};

module.exports = { calculateRiskScore };