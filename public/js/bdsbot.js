// public/js/bdsbot.js
(() => {
  const $ = (id) => document.getElementById(id);

  const box = $("chat-box");
  const input = $("user-input");

  // Append message to chat box
  const append = (text, color = "black", italic = false) => {
    const div = document.createElement("div");
    div.style.color = color;
    div.style.margin = "4px 0";
    if (italic) {
      div.style.fontStyle = "italic";
    }
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    box.style.display = "block"; // reveal chat box when a message arrives
  };

  // Typing indicator
  let typingEl = null;
  const showTyping = () => {
    if (!typingEl) {
      typingEl = document.createElement("div");
      typingEl.style.fontStyle = "italic";
      typingEl.style.color = "#888";
      typingEl.textContent = "BDSBot is typing…";
      box.appendChild(typingEl);
      box.scrollTop = box.scrollHeight;
    }
  };
  const hideTyping = () => {
    if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  };

  // Main send function
  window.sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;

    append("You: " + text, "#222");
    input.value = "";

    showTyping();

    try {
      const resp = await fetch("https://project-rurvf.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
      });

      hideTyping();

      if (!resp.ok) {
        append("Error: HTTP " + resp.status, "red");
        return;
      }

      // Stream response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let botLine = document.createElement("div");
      botLine.innerHTML = "<em>BDSBot:</em> ";
      box.appendChild(botLine);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        botLine.textContent += decoder.decode(value, { stream: true });
        box.scrollTop = box.scrollHeight;
      }
    } catch (err) {
      hideTyping();
      append("Error: " + err.message, "red");
    }
  };

  // Enter key submits
  window.addEventListener("DOMContentLoaded", () => {
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") window.sendMessage();
      });
    }
  });
})();
