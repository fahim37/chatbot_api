const express = require("express");
const router = express.Router();
const Question = require("../models/Questions");
const { generateEmbedding } = require("../controllers/chatbot.controller");

// Add Q&A data with embeddings
router.post("/add-question", async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({
      status: false,
      message: "Both question and answer are required",
    });
  }

  try {
    const embedding = await generateEmbedding(question);

    const newQuestion = new Question({ question, answer, embedding });
    await newQuestion.save();

    res.json({ status: true, message: "Question added successfully!" });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ status: false, message: "Failed to add question" });
  }
});

module.exports = router;
