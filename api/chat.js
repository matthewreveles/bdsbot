// api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { messages } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-5", // default to GPT-5
      messages,
      max_completion_tokens: 950, // ✅ FIXED
    });

    const reply = completion.choices[0]?.message?.content || "No response";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    res.status(500).json({ error: err.message });
  }
}

