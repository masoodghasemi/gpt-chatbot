document.addEventListener("DOMContentLoaded", () => {
  const askBtn = document.getElementById("ask-button");
  const queryInput = document.getElementById("query-input");
  const responseDiv = document.getElementById("response");

  function logToUI(msg) {
    if (responseDiv) {
      responseDiv.innerText += `\n${msg}`;
    }
    console.log(msg);
  }

  logToUI("✅ script.js loaded inside Tableau");

  if (!askBtn || !queryInput || !responseDiv) {
    logToUI("❌ DOM elements not found");
    return;
  }

  askBtn.addEventListener("click", async () => {
    logToUI("🟢 Ask GPT button clicked");

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

      logToUI("🤖 GPT says: " + (result.response || result.error || "❌ No response"));
      responseDiv.innerText = result.response || "❌ No response.";
    } catch (err) {
      logToUI("❌ Fetch error: " + err.message);
      responseDiv.innerText = "❌ GPT call failed.";
    }
  });
});
