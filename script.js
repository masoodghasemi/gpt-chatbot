console.log("✅ script.js loaded");

(async function () {
  // Option A: Open blank tab to manually inspect extension behavior
  const debugWindow = window.open("about:blank", "_blank");
  if (debugWindow) {
    debugWindow.document.write("<pre id='log'>🛠️ Debug window opened. Waiting for logs...</pre>");
  }

  // Logger helper for Option C
  function logToUI(message) {
    const div = document.getElementById("response");
    if (div) div.innerText += `\n${message}`;
    if (debugWindow) {
      const pre = debugWindow.document.getElementById("log");
      if (pre) pre.innerText += `\n${message}`;
    }
    console.log(message);
  }

  if (typeof tableau === "undefined") {
    logToUI("⚠️ Not running inside Tableau — skipping extension logic.");
    return;
  }

  try {
    await tableau.extensions.initializeAsync();
    logToUI("✅ Tableau extension initialized");

    const askBtn = document.getElementById("ask-button");
    const queryInput = document.getElementById("query-input");
    const responseDiv = document.getElementById("response");

    if (!askBtn || !queryInput || !responseDiv) {
      logToUI("❌ Missing required DOM elements.");
      return;
    }

    askBtn.addEventListener("click", async () => {
      const query = queryInput.value.trim();
      if (!query) {
        responseDiv.innerText = "❌ Please enter a question.";
        return;
      }

      responseDiv.innerText = "Thinking...";
      logToUI(`📥 User query: ${query}`);

      try {
        const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets[0];
        const summary = await worksheet.getSummaryDataAsync();
        const cols = summary.columns.map(c => c.fieldName);
        const data = summary.data.map(row =>
          Object.fromEntries(row.map((cell, i) => [cols[i], cell.formattedValue]))
        );

        logToUI(`📊 Data extracted: ${JSON.stringify(data.slice(0, 3))}`);

        const fullPrompt = `${query}\n\nHere is the worksheet data:\n${JSON.stringify(data.slice(0, 30))}`;

        const res = await fetch("https://gpt-proxy-5hrz.onrender.com/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: fullPrompt })
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const result = await res.json();
        logToUI("🤖 GPT response: " + (result.response || result.error || "❌ No response."));

        responseDiv.innerText = result.response || result.error || "❌ No response from GPT.";
      } catch (err) {
        logToUI("❌ GPT fetch error: " + err.message);
        responseDiv.innerText = "❌ GPT call failed: " + err.message;
      }
    });
  } catch (err) {
    logToUI("❌ Tableau Extension failed to initialize: " + err.message);
    document.body.innerHTML = `<p style='color:red'>❌ Failed to load Tableau extension.<br>${err.message}</p>`;
  }
})();
