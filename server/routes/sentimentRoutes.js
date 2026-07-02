
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { fetchNewsAndSentiment } = require("../utils/fetchNews");

// GET /api/sentiment/:symbol
router.get("/:symbol", protect, async (req, res) => {
  try {
    const { symbol } = req.params;
    const companyName = req.query.name || symbol;
    const data = await fetchNewsAndSentiment(symbol, companyName);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sentiment" });
  }
});

module.exports = router;