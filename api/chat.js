import OpenAI from "openai";
import { BDSBotPrompt } from "../config/systemPrompt.js";

// Create OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Vercel expects a default export handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userMessages = req.body.messages || [];
    const model = "gpt-5"; // force GPT-5 every time

    // Prepend system prompt
    const messages = [
      { role: "system", content: BDSBotPrompt },
      ...userMessages,
    ];

    const response = await client.chat.completions.create({
      model,
      messages,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
}

