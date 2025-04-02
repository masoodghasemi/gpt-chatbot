document.addEventListener("DOMContentLoaded", () => {
  tableau.extensions.initializeAsync().then(() => {
    document.getElementById("ask-button").addEventListener("click", async () => {
      const query = document.getElementById("query-input").value.trim();
      const responseDiv = document.getElementById("response");
      if (!query) {
        responseDiv.innerText = "❌ Please enter a question.";
        return;
      }

      responseDiv.innerText = "Thinking...";

      try {
        const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets[0];
        const summary = await worksheet.getSummaryDataAsync();
        const cols = summary.columns.map(c => c.fieldName);
        const data = summary.data.map(row =>
          Object.fromEntries(row.map((cell, i) => [cols[i], cell.formattedValue]))
        );

        const fullPrompt = `${query}\n\nData:\n${JSON.stringify(data.slice(0, 30))}`;

        const res = await fetch("https://gpt-proxy-5hrz.onrender.com/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: fullPrompt })
        });

        const result = await res.json();
        responseDiv.innerText = result.response || result.error || "❌ No response from GPT.";
      } catch (err) {
        console.error("GPT error:", err);
        responseDiv.innerText = "❌ GPT call failed: " + err.message;
      }
    });
  });
});
