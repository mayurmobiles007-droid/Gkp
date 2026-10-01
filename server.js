require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

if (!API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not set.");
}

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ ok: true, name: "GKP AI Backend", model: MODEL });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const SYSTEM_PROMPT =
  "You are GKP AI, a friendly personal AI assistant. " +
  "Reply naturally and helpfully. The user prefers Hindi/Hinglish, " +
  "so answer in Hindi/Hinglish when appropriate. Keep answers clear and useful.";

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server."
      });
    }

    // History ko Gemini format me badlo (assistant -> model)
    const contents = [];
    const safeHistory = Array.isArray(history) ? history.slice(-20) : [];

    for (const item of safeHistory) {
      if (
        !item ||
        (item.role !== "user" && item.role !== "assistant") ||
        typeof item.content !== "string" ||
        !item.content.trim()
      ) continue;

      const role = item.role === "assistant" ? "model" : "user";
      const last = contents[contents.length - 1];

      if (last && last.role === role) {
        last.parts[0].text += "\n" + item.content;
      } else {
        contents.push({ role, parts: [{ text: item.content }] });
      }
    }

    // Gemini chahta hai ki baat "user" se shuru ho
    while (contents.length && contents[0].role !== "user") contents.shift();

    const last = contents[contents.length - 1];
    if (last && last.role === "user") {
      last.parts[0].text += "\n" + message;
    } else {
      contents.push({ role: "user", parts: [{ text: message }] });
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(MODEL) +
      ":generateContent";

    const apiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents
      })
    });

    const data = await apiRes.json().catch(() => ({}));

    if (!apiRes.ok) {
      const msg = data?.error?.message || ("Gemini error " + apiRes.status);
      console.error("Gemini error:", apiRes.status, msg);
      return res.status(apiRes.status === 429 ? 429 : 500).json({ error: msg });
    }

    const reply = (data?.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || "")
      .join("")
      .trim();

    res.json({
      reply: reply || "Mujhe abhi response nahi mila. Dobara try karo."
    });
  } catch (error) {
    console.error("GKP AI error:", error);
    res.status(500).json({ error: error?.message || "AI request failed." });
  }
});

app.listen(PORT, () => {
  console.log(`GKP AI backend running on port ${PORT} (model: ${MODEL})`);
});
