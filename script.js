console.log("✅ script.js loaded");

(async function () {
  try {
    await tableau.extensions.initializeAsync();
    console.log("✅ Tableau Extensions API initialized");

    const askBtn = document.getElementById("ask-button");
    const queryInput = document.getElementById("query-input");
    const responseDiv = document.getElementById("response");

    if (!askBtn || !queryInput || !responseDiv) {
      console.error("❌ Missing DOM elements.");
      return;
    }

    askBtn.addEventListener("click", async () => {
      const query = queryInput.value.trim();
      if (!query) {
        responseDiv.innerText = "❌ Please enter a question.";
        return;
      }

      responseDiv.innerText = "Thinking...";
      console.log("📥 GPT query triggered:", query);

      try {
        const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets[0];
        const summary = await worksheet.getSummaryDataAsync();
        const cols = summary.columns.map(c => c.fieldName);
        const data = summary.data.map(row =>
          Object.fromEntries(row.map((cell, i) => [cols[i], cell.formattedValue]))
        );

        console.log("📊 Worksheet data extracted:", data.slice(0, 5));

        const fullPrompt = `${query}\n\nHere is the worksheet data:\n${JSON.stringify(data.slice(0, 30))}`;

        const res = await fetch("https://gpt-proxy-5hrz.onrender.com/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: fullPrompt })
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const result = await res.json();
        console.log("🤖 GPT response received:", result);

        responseDiv.innerText = result.response || result.error || "❌ No response from GPT.";
      } catch (err) {
        console.error("❌ GPT fetch failed:", err);
        responseDiv.innerText = "❌ GPT call failed: " + err.message;
      }
    });
  } catch (err) {
    console.error("❌ Tableau Extension failed to initialize:", err);
    document.body.innerHTML = "<p style='color:red'>❌ Failed to load Tableau extension.<br>" + err.message + "</p>";
  }
})();

