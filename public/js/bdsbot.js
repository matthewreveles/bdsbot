(() => {
  // --- CONFIG ---
  const API_URL = "https://project-rurvf.vercel.app/api/chat"; // your API
  const MAX_TOKENS = 950; // cap responses for speed + cost

  // helpers
  const $ = (id) => document.getElementById(id);
  const append = (text, color = "#333") => {
    const box = $("chat-box");
    const div = document.createElement("div");
    div.textContent = text;
    div.style.margin = "4px 0";
    div.style.color = color;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  };

  // expose for the button
  window.sendMessage = async function sendMessage() {
    const input = $("user-input");
    const box = $("chat-box");
    const message = (input.value || "").trim();
    if (!message) return;

    append("You: " + message);
    input.value = "";

    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // backend already forces GPT-5; we still include the cap here
          max_tokens: MAX_TOKENS,
          messages: [{ role: "user", content: message }],
        }),
      });

      // If your API streams as text/plain, handle stream; else fallback to JSON
      const ctype = (resp.headers.get("content-type") || "").toLowerCase();

      if (ctype.includes("text/plain")) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        const bot = document.createElement("div");
        bot.textContent = "BDSBot: ";
        bot.style.margin = "4px 0";
        bot.style.color = "#222";
        box.appendChild(bot);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          bot.textContent += decoder.decode(value, { stream: true });
          box.scrollTop = box.scrollHeight;
        }
      } else {
        const data = await resp.json();
        append("BDSBot: " + (data.reply || "No response"));
      }
    } catch (err) {
      append("Error: " + err.message, "red");
    }
  };

  // allow pressing Enter to send
  window.addEventListener("DOMContentLoaded", () => {
    const input = $("user-input");
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") window.sendMessage();
      });
    }
  });
})();

