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

    // Stream response
    const stream = await client.chat.completions.stream({
      model,
      messages,
      max_tokens: 950, // cap response length
    });

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        res.write(delta);
      }
    }

    res.end();
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: err.message });
  }
}
