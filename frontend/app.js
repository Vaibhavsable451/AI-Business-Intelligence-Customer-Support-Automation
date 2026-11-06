
const WEBHOOK_URL = "http://localhost:5678/webhook/customer-support";

const form = document.querySelector("#requestForm");
const button = document.querySelector("#submitBtn");
const result = document.querySelector("#result");
const emptyState = document.querySelector("#emptyState");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    customerName: document.querySelector("#customerName").value.trim(),
    email: document.querySelector("#email").value.trim(),
    channel: document.querySelector("#channel").value,
    message: document.querySelector("#message").value.trim()
  };

  if (!payload.customerName || !payload.email || payload.message.length < 10) {
    showError("Enter a name, a valid email and a message of at least 10 characters.");
    return;
  }

  button.disabled = true;
  button.querySelector("span:first-child").textContent = "Analyzing...";

  emptyState.classList.add("hidden");
  result.classList.remove("hidden");

  result.innerHTML = `
    <div class="empty">
      <div class="empty-icon">◌</div>
      <p>Groq is analyzing the request...</p>
    </div>
  `;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "The workflow returned an error.");
    }

    renderResult(data);

  } catch (error) {
    showError(
      error.message +
      " Check that n8n is running and the webhook URL is correct."
    );

  } finally {
    button.disabled = false;
    button.querySelector("span:first-child").textContent = "Analyze with AI";
  }
});

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function renderResult(data) {
  const fields = [
    ["AI summary", data.summary],
    ["Recommended action", data.recommendedAction],
    ["Service level", data.sla],
    ["Assigned queue", data.queue]
  ];

  result.innerHTML = `
    <div class="metrics">
      <div class="metric">
        <small>Category</small>
        <strong>${escapeHtml(data.category)}</strong>
      </div>
      <div class="metric">
        <small>Sentiment</small>
        <strong>${escapeHtml(data.sentiment)}</strong>
      </div>
      <div class="metric">
        <small>Priority</small>
        <strong class="priority">${escapeHtml(data.priority)}</strong>
      </div>
    </div>

    ${fields.map(([label, value]) => `
      <div class="detail">
        <small>${escapeHtml(label)}</small>
        <p>${escapeHtml(value || "—")}</p>
      </div>
    `).join("")}

    <div class="detail reply">
      <small>AI-drafted customer reply</small>
      <p>${escapeHtml(data.reply)}</p>
    </div>

    <p class="hint">
      ${data.loggedToGoogleSheets
        ? "✓ Saved to Google Sheets"
        : "Analysis complete"}
      · ${escapeHtml(data.receivedAt || "")}
    </p>
  `;
}

function showError(message) {
  emptyState.classList.add("hidden");
  result.classList.remove("hidden");

  result.innerHTML = `
    <div class="error">${escapeHtml(message)}</div>
  `;
}
