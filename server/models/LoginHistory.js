const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  browser: {
    type: String,
    required: true
  },
  os: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    enum: ["Desktop", "Laptop", "Mobile"],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["SUCCESS", "FAILED"],
    required: true
  }
});

module.exports = mongoose.model("LoginHistory", loginHistorySchema);