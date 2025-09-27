(() => {
  const $ = (id) => document.getElementById(id);

  // Append message to chat box
  const append = (text, italic = false, color = "black") => {
    const box = $("chat-box");
    const div = document.createElement("div");
    div.textContent = text;
    div.style.margin = "4px 0";
    div.style.color = color;
    if (italic) {
      div.style.fontStyle = "italic";
    }
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  };

  // Main sendMessage handler
  window.sendMessage = async () => {
    const input = $("user-input");
    const box = $("chat-box");
    const message = input.value.trim();
    if (!message) return;

    // Reset input
    input.value = "";

    // User bubble
    append("You: " + message);

    // Add bot label + typing indicator
    const botBubble = document.createElement("div");
    botBubble.innerHTML = "<em>BDSBot: ...</em>";
    botBubble.style.margin = "4px 0";
    box.appendChild(botBubble);

    // Make chat visible if hidden
    box.style.display = "block";

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
        }),
      });

      if (!resp.ok) {
        throw new Error("HTTP " + resp.status);
      }

      // Stream response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      botBubble.innerHTML = "<em>BDSBot:</em> "; // reset from "..."

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        botBubble.innerHTML += decoder.decode(value, { stream: true });
        box.scrollTop = box.scrollHeight;
      }
    } catch (err) {
      append("Error: " + err.message, false, "red");
    }
  };

  // Allow pressing Enter to send
  window.addEventListener("DOMContentLoaded", () => {
    const input = $("user-input");
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") window.sendMessage();
      });
    }
  });
})();
