console.log("✅ script.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const askBtn = document.getElementById("ask-button");
  const queryInput = document.getElementById("query-input");
  const responseDiv = document.getElementById("response");

  if (!askBtn || !queryInput || !responseDiv) {
    console.error("❌ Missing one or more DOM elements");
    return;
  }

  askBtn.addEventListener("click", async () => {
    const debugWindow = window.open("about:blank", "_blank");
    if (debugWindow) {
      debugWindow.document.write("<pre id='log'>🛠️ Debug window opened. Waiting for logs...</pre>");
    }

    const logToUI = (msg) => {
      responseDiv.innerText += `\n${msg}`;
      if (debugWindow) {
        const pre = debugWindow.document.getElementById("log");
        if (pre) pre.innerText += `\n${msg}`;
      }
      console.log(msg);
    };

    logToUI("🟢 Ask button clicked!");

    const query = queryInput.value.trim();
    if (!query) {
      responseDiv.innerText = "❌ Please enter a question.";
      return;
    }

    responseDiv.innerText = "Thinking...";
    logToUI(`📥 Query: ${query}`);

    try {
      const res = await fetch("https://gpt-proxy-5hrz.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      logToUI("🤖 GPT response: " + (result.response || result.error || "❌ No response"));
      responseDiv.innerText = result.response || result.error || "❌ No response from GPT.";
    } catch (err) {
      logToUI("❌ GPT fetch error: " + err.message);
      responseDiv.innerText = "❌ GPT call failed: " + err.message;
    }
  });
});
