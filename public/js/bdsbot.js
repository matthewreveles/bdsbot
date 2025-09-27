(function () {
  const $ = (id) => document.getElementById(id);

  // Append helper (plain text fallback)
  function append(content, color = "black", italic = false) {
    const box = $("chat-box");
    if (!box) return;

    const el = document.createElement("div");
    el.textContent = content;
    el.style.color = color;
    if (italic) el.style.fontStyle = "italic";

    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
  }

  // Show chatbox if hidden
  function ensureVisible() {
    const box = $("chat-box");
    if (box && box.style.display === "none") {
      box.style.display = "block";
    }
  }

  // Typing indicator
  let typingEl = null;
  function showTyping() {
    ensureVisible();
    typingEl = document.createElement("div");
    typingEl.textContent = "BDSBot is typing...";
    typingEl.style.fontStyle = "italic";
    typingEl.style.color = "gray";
    $("chat-box").appendChild(typingEl);
    $("chat-box").scrollTop = $("chat-box").scrollHeight;
  }

  function hideTyping() {
    if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  // Send message
  window.sendMessage = async function () {
    const input = $("user-input");
    const message = input.value.trim();
    if (!message) return;

    ensureVisible();
    append("You: " + message, "black", false);
    input.value = "";

    showTyping();

    try {
      const resp = await fetch("https://project-rurvf.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
        }),
      });

      hideTyping();

      if (!resp.ok) {
        append("Error: HTTP " + resp.status, "red");
        return;
      }

      const data = await resp.json();

      // ✅ Render Markdown safely
      const box = $("chat-box");
      const wrapper = document.createElement("div");

      // Convert Markdown to HTML
      let parsed = marked.parse(data.reply || "No response");

      // Downstyle headings: convert h1/h2/h3 → strong inline labels
      parsed = parsed.replace(/<h[1-6]>(.*?)<\/h[1-6]>/g, "<strong>$1</strong><br>");

      wrapper.innerHTML = "<strong>BDSBot:</strong> " + parsed;
      box.appendChild(wrapper);
      box.scrollTop = box.scrollHeight;
    } catch (err) {
      hideTyping();
      append("Error: " + err.message, "red");
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

