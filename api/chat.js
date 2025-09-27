// api/chat.js

import OpenAI from "openai";
import { BDSBotPrompt } from "../config/systemPrompt.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userMessages = req.body.messages || [];

    // Always force GPT-5
    const model = "gpt-5";

    const messages = [
      { role: "system", content: BDSBotPrompt },
      ...userMessages,
    ];

    const response = await client.chat.completions.create({
      model,
      messages,
    });

    res.status(200).json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: err.message });
  }
}

