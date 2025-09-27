// api/chat.js

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { BDSBotPrompt } from "../config/systemPrompt.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const userMessages = req.body.messages || [];
const model = "gpt-5"; // always use GPT-5
    // Always prepend system prompt
    const messages = [
      { role: "system", content: BDSBotPrompt },
      ...userMessages,
    ];

    const response = await client.chat.completions.create({
      model,
      messages,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`✅ BDSBot API running at http://localhost:${port}`);
});
