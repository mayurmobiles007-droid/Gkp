require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("WARNING: OPENAI_API_KEY is not set.");
}

const client = new OpenAI({
  apiKey
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

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured on the server."
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string"
          )
          .slice(-20)
      : [];

    const input = [
      ...safeHistory,
      {
        role: "user",
        content: message
      }
    ];

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",

      instructions:
        "You are GKP AI, a friendly personal AI assistant. " +
        "Reply naturally and helpfully. " +
        "The user prefers Hindi/Hinglish, so answer in Hindi/Hinglish when appropriate. " +
        "Keep answers clear, useful and concise.",

      input
    });

    const reply = response.output_text;

    if (!reply) {
      return res.status(500).json({
        error: "AI returned an empty response."
      });
    }

    res.json({
      reply
    });
  } catch (error) {
    console.error("GKP AI error:", error);

    res.status(500).json({
      error:
        error?.message ||
        "AI request failed. Please check the Render logs."
    });
  }
});

app.listen(PORT, () => {
  console.log(`GKP AI backend running on port ${PORT}`);
});
