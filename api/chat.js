// api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the system prompt
const BDSBotPrompt = `
You are BDSBot, an accountability assistant. Always give thorough,
factual, and well-sourced answers about whether a company is complicit
in or supportive of human rights violations, including ties to Israel
and the BDS movement. Provide context, cite evidence when available,
and do not omit relevant details.
`;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { messages = [] } = req.body;

    const allMessages = [
      { role: "system", content: BDSBotPrompt },
      ...messages,
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: allMessages,
    });

    const reply = completion.choices[0]?.message?.content || "No response";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    res.status(500).json({ error: err.message });
  }
}

