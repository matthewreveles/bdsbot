(function () {
  const $ = (id) => document.getElementById(id);

  window.sendMessage = async () => {
    const input = $("user-input");
    const box = $("chat-box");
    const message = input.value.trim();
    if (!message) return;

    // show chat box if hidden
    box.style.display = "block";

    // user bubble
    const user = document.createElement("div");
    user.textContent = "You: " + message;
    user.style.margin = "4px 0";
    box.appendChild(user);
    box.scrollTop = box.scrollHeight;
    input.value = "";

    // typing indicator
    const typing = document.createElement("div");
    typing.textContent = "BDSBot is thinking...";
    typing.style.fontStyle = "italic";
    typing.style.opacity = "0.7";
    box.appendChild(typing);
    box.scrollTop = box.scrollHeight;

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }]
        }),
      });

      if (!resp.body) {
        typing.textContent = "BDSBot: (no response)";
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      typing.textContent = "BDSBot: ";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        typing.textContent += decoder.decode(value, { stream: true });
        box.scrollTop = box.scrollHeight;
      }
    } catch (err) {
      typing.textContent = "Error: " + err.message;
    }
  };

  // allow pressing Enter to send
  window.addEventListener("DOMContentLoaded", () => {
    const input = $("user-input");
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          window.sendMessage();
        }
      });
    }
  });
})();

