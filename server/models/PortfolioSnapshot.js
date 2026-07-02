
const mongoose = require("mongoose");

const portfolioSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    investedValue: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PortfolioSnapshot", portfolioSnapshotSchema);