// IMPORTANT: use the Production URL (/webhook/), and make the workflow Active.
// For the live Vercel site this must be a public n8n URL, not localhost.
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
      headers: { "Content-Type": "application/json" },
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
      " Check that n8n is running, the workflow is active and the webhook URL is correct."
    );
  } finally {
    button.disabled = false;
    button.querySelector("span:first-child").textContent = "Analyze with AI";
  }
});

function escapeHtml(value = "") {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function renderResult(data) {
  // The n8n workflow returns the AI result inside data.ticket
  const t = data.ticket || data;

  const fields = [
    ["AI summary", t.summary],
    ["Recommended action", t.suggested_action],
    ["Service level", t.sla],
    ["Assigned queue", t.assigned_queue]
  ];

  result.innerHTML = `
    <div class="metrics">
      <div class="metric">
        <small>Category</small>
        <strong>${escapeHtml(t.category || "—")}</strong>
      </div>
      <div class="metric">
        <small>Sentiment</small>
        <strong>${escapeHtml(t.sentiment || "—")}</strong>
      </div>
      <div class="metric">
        <small>Priority</small>
        <strong class="priority">${escapeHtml(t.priority || "—")}</strong>
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
      <p>${escapeHtml(t.ai_response || "—")}</p>
    </div>

    <p class="hint">
      ✓ Saved to Google Sheets · ${escapeHtml(t.ticket_id || "")} · ${escapeHtml(t.timestamp || "")}
    </p>
  `;
}

function showError(message) {
  emptyState.classList.add("hidden");
  result.classList.remove("hidden");
  result.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}
