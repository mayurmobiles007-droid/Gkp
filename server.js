require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is not set.");
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    name: "GKP AI Backend",
    message: "Backend is running."
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured on the server."
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(item =>
            item &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string"
          )
          .slice(-20)
      : [];

    const input = [
      ...safeHistory.map(item => ({
        role: item.role,
        content: item.content
      })),
      {
        role: "user",
        content: message
      }
    ];

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions:
        "You are GKP AI, a friendly personal AI assistant. " +
        "Reply naturally and helpfully. The user prefers Hindi/Hinglish, " +
        "so answer in Hindi/Hinglish when appropriate. Keep answers clear and useful.",
      input
    });

    res.json({
      reply: response.output_text || "Mujhe abhi response nahi mila."
    });
  } catch (error) {
    console.error("GKP AI error:", error);

    res.status(500).json({
      error: error?.message || "AI request failed."
    });
  }
});

app.listen(PORT, () => {
  console.log(`GKP AI backend running on port ${PORT}`);
});
