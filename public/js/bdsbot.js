// public/js/bdsbot.js
(function () {
  // === CONFIG ===
  const API_BASE = "https://project-rurvf.vercel.app"; // <- update if your deployment uses a different URL
  const ENDPOINT = API_BASE + "/api/chat";

  // helper
  function $(id) { return document.getElementById(id); }

  function appendBubble(text, classes = "") {
    const box = $("chat-box");
    if (!box) return;
    const div = document.createElement("div");
    div.style.margin = "6px 0";
    div.className = classes;
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function showBox() {
    const box = $("chat-box");
    if (!box) return;
    box.style.display = "block";
  }

  function hideBox() {
    const box = $("chat-box");
    if (!box) return;
    box.style.display = "none";
  }

  // typing indicator element we append temporarily
  function makeTypingIndicator() {
    const el = document.createElement("div");
    el.id = "typing-indicator";
    el.style.fontStyle = "italic";
    el.textContent = "BDSBot: …";
    return el;
  }

  // send message
  window.sendMessage = async function sendMessage() {
    const input = $("user-input");
    const chatBox = $("chat-box");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    // show user and open the box
    showBox();
    appendBubble("You: " + text, "user-bubble");
    input.value = "";

    // add typing indicator
    const typing = makeTypingIndicator();
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const payload = { messages: [{ role: "user", content: text }] };
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // remove typing indicator (we will append actual response)
      typing.remove();

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        appendBubble("Error: " + (resp.status + " " + resp.statusText), "error");
        console.error("API returned non-ok:", resp.status, resp.statusText, txt);
        return;
      }

      const data = await resp.json();
      const reply = data.reply || "No response";
      appendBubble("BDSBot: " + reply, "bot-bubble");
    } catch (err) {
      // network error
      typing.remove();
      appendBubble("Error: " + (err.message || err), "error");
      console.error("Fetch failed:", err);
    }
  };

  // DOM ready: wire up Enter key to trigger sendMessage
  window.addEventListener("DOMContentLoaded", () => {
    const input = $("user-input");
    if (!input) return;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  });
})();
