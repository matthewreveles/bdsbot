// api/chat.js

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { messages } = req.body;

    // Start streaming completion
    const completion = await client.chat.completions.create({
      model: "gpt-5",       // force GPT-5
      messages,             // incoming conversation
      max_tokens: 950,      // cap response length
      stream: true,         // enable streaming
    });

    // Set headers for streaming
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    });

    // Stream chunks back to client
    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) res.write(delta);
    }

    res.end();
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: err.message });
  }
}

