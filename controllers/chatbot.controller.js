require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("../models/Questions.js");
console.log(Question);
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to generate vector embeddings using Gemini
async function generateEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const response = await model.embedContent({
      content: {
        parts: [{ text: text }], // Correct structure with parts array
      },
    });

    console.log("Generated Embedding:", response.embedding.values);
    return response.embedding.values;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    console.error(error); // Log the full error object for debugging
    return [];
  }
}

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

// Search MongoDB for a relevant Q&A match
async function searchDatabase(query) {
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding.length) return null;

  const questions = await Question.find();
  let bestMatch = null;
  let highestSimilarity = -1;

  for (let q of questions) {
    const similarity = cosineSimilarity(q.embedding, queryEmbedding);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = q;
    }
  }

  return highestSimilarity > 0.75 ? bestMatch.answer : null; // Returns answer if similarity is high
}

// Function to get chat response from Gemini AI
async function getChatResponse(message) {
  // Step 1: Search MongoDB for a relevant Q&A match
  const dbAnswer = await searchDatabase(message);

  if (dbAnswer) {
    return dbAnswer; // Return stored answer if found
  }

  // Step 2: If no match found, use Gemini AI to generate a response
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
    });
    return result.response.text();
  } catch (error) {
    console.error("Error getting chat response from Gemini:", error);
    return "I'm sorry, but I couldn't process your request.";
  }
}

module.exports = { getChatResponse, generateEmbedding };
