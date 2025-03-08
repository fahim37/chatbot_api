const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  embedding: { type: [Number], required: true }, // Stores vector embeddings
});

const Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;
