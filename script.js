document.addEventListener("DOMContentLoaded", () => {
  const askButton = document.getElementById("ask-button");
  const responseDiv = document.getElementById("response");

  askButton.addEventListener("click", async () => {
    const query = document.getElementById("query-input").value.trim();
    if (!query) {
      responseDiv.innerText = "❌ Please enter a question.";
      return;
    }

    responseDiv.innerText = "Thinking...";

    try {
      const res = await fetch("https://gpt-proxy-5hrz.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      responseDiv.innerText = data.response || data.error || "❌ No response from GPT.";
    } catch (err) {
      console.error("❌ Error calling GPT:", err);
      responseDiv.innerText = "❌ Error: " + err.message;
    }
  });
});
