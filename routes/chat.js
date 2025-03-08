const express = require("express");
const { getChatResponse } = require("../controllers/chatbot.controller");
const router = express.Router();

// POST endpoint for chatbot interactions
router.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res
      .status(400)
      .json({ status: false, message: "Message is required" });
  }

  try {
    const reply = await getChatResponse(message);
    res.json({ status: true, message: "Success", data: [{ reply }] });
  } catch (error) {
    console.error("Error processing chat request:", error);
    res
      .status(500)
      .json({ status: false, message: "Failed to fetch response" });
  }
});

module.exports = router;
