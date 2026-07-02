const express = require("express");
const router = express.Router();
const { getPortfolio, getStockPrice, searchStock } = require("../controllers/portfolioController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getPortfolio);
router.get("/stock/:symbol", protect, getStockPrice);
router.get("/search/:keyword", protect, searchStock);

module.exports = router;