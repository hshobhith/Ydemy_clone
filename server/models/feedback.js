
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    username: String,
    email: String,
    rating: Number,
    feedbackText: String,
    courseId: String,
    date: { type: Date, default: Date.now },
  });

  module.exports = mongoose.model("Feedback", feedbackSchema);