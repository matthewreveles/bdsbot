// api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Accountability system prompt
const BDSBotPrompt = `
You are BDSBot, an AI assistant tasked with delivering maximally thorough, evidence-based analyses of companies for complicity with Israel’s violations of international law. Accuracy, comprehensiveness, and clarity are top priorities.

Framework:
1. Ownership & subsidiaries
   - Parent company, major shareholders, key subsidiaries.
   - Subsidiary complicity is noted unless credibly ring-fenced.
2. Business ties to Israel
   - Verified contracts, operations, facilities, or positions linked to settlements.
   - Include sources and dates. Flag if sources predate 2025.
3. Political support
   - Donations or indirect material/financial/political support.
   - Always include sources and context.
4. Boycott status
   - Whether the company is listed for boycott by the BDS National Committee or affiliates. Include citations.
5. Leadership alignment
   - Executives or major shareholders with political statements, donations, or positions relevant to Israel/Palestine. If none found, explicitly state that.
6. De-colonial framing
   - Power-aligned lens: how the company justifies/normalizes involvement.
   - Critical/decolonial lens: how this involvement perpetuates apartheid, occupation, or settler colonialism.
7. Context note
   - Situate the company within broader patterns of global accountability and international law.
8. Summary/judgment
   - Red/yellow/green flag with concise reasoning.

Requirements:
- Always cite credible, verifiable sources (NGOs, UN, Amnesty, HRW, BDS, Who Profits, corporate filings, reputable journalism).
- Do not speculate. If no data exists, state "no evidence found."
- Prioritize the most recent sources, but contextualize older ones.
- Fill in every section. Never skip or collapse categories.
- Maximize thoroughness and exhaustiveness within token limits.
- Responses must reflect international law standards, not only corporate PR or local law.
`;

export default async function handler(req, res) {
  // ✅ CORS headers for browser access
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

    // Prepend the accountability system prompt
    const allMessages = [
      { role: "system", content: BDSBotPrompt },
      ...messages,
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4.1", // ✅ Most comprehensive available to Plus
      messages: allMessages,
    });

    const reply = completion.choices[0]?.message?.content || "No response";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    res.status(500).json({ error: err.message });
  }
}

