# AI Business Copilot — n8n + Groq + Google Sheets

A 15-node n8n workflow and HTML/CSS/JavaScript dashboard. It classifies incoming customer messages, detects sentiment, assigns priority, drafts a response, routes the request, and logs the result to Google Sheets.

## Files
- `ai_business_copilot_workflow.json` — import this into n8n (15 nodes).
- `frontend/index.html`, `styles.css`, `app.js` — browser dashboard.

## Setup

### 1. Import the workflow
In n8n: **Workflows → Import from File** → choose `ai_business_copilot_workflow.json`.

### 2. Configure Groq
The Groq HTTP Request node reads the API key from the n8n environment variable `GROQ_API_KEY`.
Set that variable in the environment where n8n runs, then restart n8n. Do not put a real API key in frontend JavaScript or commit it to Git.

Example for a self-hosted n8n environment:
`GROQ_API_KEY=your_groq_api_key`

If your n8n hosting plan does not allow custom environment variables, edit the Authorization header in node **5. Groq AI Analysis** and use a secure n8n credential/secret mechanism supported by your deployment. Avoid exposing the key in browser code.

### 3. Configure Google Sheets
Create a Google spreadsheet with a tab named `Requests`. Add these headers in row 1:
`customerName, email, channel, message, category, sentiment, priority, summary, recommendedAction, reply, sla, queue, receivedAt`

Open node **13. Save to Google Sheets**:
- Replace `YOUR_GOOGLE_SHEET_ID` with your spreadsheet ID.
- Select/create your Google Sheets OAuth2 credential in n8n.
- Ensure the connected Google account can edit the spreadsheet.

### 4. Activate webhook
Save and activate the workflow. Open node **1. Incoming Webhook**, copy its **Production URL**. The endpoint path is `ai-business-copilot`.

### 5. Connect the frontend
Open `frontend/app.js` and replace:
`PASTE_YOUR_N8N_PRODUCTION_WEBHOOK_URL_HERE`
with the Production URL copied from n8n.

Serve the frontend using a local static server (for example, `python -m http.server 5500` from the `frontend` folder), then open `http://localhost:5500`.

### 6. Test
Submit a customer name and message. Example:
> I was charged twice for my subscription and need a refund today.

Expected result: AI category/sentiment/priority/summary/action/reply, SLA/queue routing, and a new Google Sheets row.

## Important notes
- This is a starter workflow export. n8n node versions and Google Sheets credential setup can vary by n8n release; review each node after import.
- The frontend uses a browser-to-webhook request. If your n8n deployment blocks browser origins, configure the Webhook node's allowed origins/CORS for your frontend origin rather than leaving `*` in production.
- The workflow does not automatically issue refunds, change accounts, or send customer replies. It creates a draft and routing recommendation for a human to review.
- For production, add authentication/rate limiting, error notifications, data-retention rules, and human approval for high-priority cases.
