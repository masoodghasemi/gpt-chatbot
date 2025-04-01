let selectedWorksheet = null;
let worksheetMap = {};

document.addEventListener("DOMContentLoaded", () => {
  tableau.extensions.initializeAsync().then(() => {
    populateWorksheetDropdown();

    document.getElementById("ask-button").addEventListener("click", async () => {
      await handleAskGPT();
    });

    document.getElementById("worksheet-select").addEventListener("change", (e) => {
      selectedWorksheet = e.target.value;
    });
  }).catch(err => {
    document.getElementById("response").innerText =
      "❌ Tableau Extensions API failed to load: " + err.message;
    console.error("Extensions init error:", err);
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

  selectedWorksheet = worksheets[0]?.name;
  console.log("🧠 Worksheets loaded:", Object.keys(worksheetMap));
}

async function handleAskGPT() {
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
    const columns = summary.columns.map(c => c.fieldName);

    const data = summary.data.map(row =>
      Object.fromEntries(row.map((cell, i) => [columns[i], cell.formattedValue]))
    );

    console.log("📥 Query:", query);
    console.log("📊 Extracted data:", data.slice(0, 5));

    const fullPrompt = `${query}\n\nHere is the current Tableau worksheet data:\n${JSON.stringify(data.slice(0, 50))}`;

    const res = await fetch("https://gpt-proxy-5hrz.onrender.com/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: fullPrompt })
    });

    const result = await res.json();
    responseDiv.innerText = result.response || result.error || "❌ No response from GPT.";
  } catch (err) {
    console.error("❌ GPT call failed:", err);
    responseDiv.innerText = "❌ Error: " + err.message;
  }
}
