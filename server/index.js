const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const app = express();

const sentimentRoutes = require("./routes/sentimentRoutes");
app.use("/api/sentiment", sentimentRoutes);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// add alongside existing authRoutes line
app.use("/api/trade", tradeRoutes);
app.use("/api/portfolio", portfolioRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "StockSense Pro API is running" });
});

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));



