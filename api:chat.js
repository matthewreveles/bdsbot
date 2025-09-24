// api/chat.js

import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Init OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // <- set your key in an .env file
});

// POST endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request: messages array required." });
    }

    const response = await client.chat.completions.create({
      model: "gpt-5", // use gpt-5 for your BDSBot
      messages: [
        { role: "system", content: "You are BDSBot, a research assistant trained on boycott, divestment, and sanctions criteria. Adhere to uploaded files and style pack when evaluating companies." },
        ...messages,
      ],
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ BDSBot API running at http://localhost:${port}`);
});
