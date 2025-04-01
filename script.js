let selectedWorksheet = null;
let worksheetMap = {};

document.addEventListener("DOMContentLoaded", async () => {
  await tableau.extensions.initializeAsync();
  populateWorksheetDropdown();

  document.getElementById("ask-button").addEventListener("click", async () => {
    const query = document.getElementById("query-input").value;
    const responseDiv = document.getElementById("response");
    responseDiv.innerText = "Thinking...";

    if (!selectedWorksheet) {
      responseDiv.innerText = "❌ Please select a worksheet.";
      return;
    }

    try {
      const worksheet = worksheetMap[selectedWorksheet];
      const summary = await worksheet.getSummaryDataAsync();
      const columns = summary.columns.map(col => col.fieldName);
      const data = summary.data.map(row =>
        Object.fromEntries(row.map((cell, i) => [columns[i], cell.formattedValue]))
      );

      const fullPrompt = `${query}\n\nHere is the current dashboard data:\n${JSON.stringify(data.slice(0, 50))}`;

      const res = await fetch("https://gpt-proxy-5hrz.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: fullPrompt })
      });

      const result = await res.json();
      responseDiv.innerText = result.response || result.error || "❌ No response from GPT.";
    } catch (err) {
      responseDiv.innerText = "❌ Error: " + err.message;
    }
  });

  document.getElementById("worksheet-select").addEventListener("change", (e) => {
    selectedWorksheet = e.target.value;
  });
});

function populateWorksheetDropdown() {
  const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
  const select = document.getElementById("worksheet-select");

  worksheets.forEach(ws => {
    worksheetMap[ws.name] = ws;
    const option = document.createElement("option");
    option.value = ws.name;
    option.text = ws.name;
    select.appendChild(option);
  });

  selectedWorksheet = worksheets[0].name;
}
