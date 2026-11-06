<<<<<<< HEAD
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
=======
# AI-Business-Intelligence-Customer-Support-Automation
<div align="center">

# AI Customer Support & Business Intelligence

**Turn every customer message into a category, sentiment, priority, drafted reply and a saved record, in seconds.**

![n8n](https://img.shields.io/badge/n8n-15%20nodes-ea4b71?style=for-the-badge&logo=n8n&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-gpt--oss--120b-f55036?style=for-the-badge)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-storage-0f9d58?style=for-the-badge&logo=googlesheets&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-2f4bdb?style=for-the-badge)

<!-- Repository badges: replace OWNER/REPO once with your GitHub path. Each badge then shows live data for your repo. -->
![Repo](https://img.shields.io/badge/repo-REPO-181717?logo=github)
[![Stars](https://img.shields.io/github/stars/OWNER/REPO?style=flat&logo=github)](https://github.com/OWNER/REPO/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/OWNER/REPO?style=flat)](https://github.com/OWNER/REPO/commits)
[![Issues](https://img.shields.io/github/issues/OWNER/REPO?style=flat)](https://github.com/OWNER/REPO/issues)

</div>

---

## What it does

| Step | Result |
|---|---|
| A customer request is submitted in the dashboard | Sent to an n8n webhook |
| Input is validated | Bad requests get a clear error |
| Groq AI analyses the message | Category, sentiment, score, priority, summary |
| Priority sets the SLA | Critical and High get 1 hour, everything else 24 hours |
| A reply is drafted | Ready for an agent to send |
| Everything is saved | One new row in Google Sheets |
| Stats are recalculated | The dashboard updates charts and recent tickets |

## System design

```mermaid
flowchart LR
    U[Support agent] --> F[Dashboard<br/>HTML / CSS / JS]
    F -- POST JSON --> W[n8n Webhook]
    W --> V{Valid input?}
    V -- no --> E[400 error response]
    V -- yes --> G[Groq API<br/>gpt-oss-120b]
    G --> P[Parse AI result]
    P --> S{Critical or High?}
    S -- yes --> A1[SLA 1 hour<br/>escalated]
    S -- no --> A2[SLA 24 hours]
    A1 --> R[Build record]
    A2 --> R
    R --> GS[(Google Sheets<br/>Tickets tab)]
    GS --> C[Calculate stats]
    C --> OK[200 JSON response]
    OK --> F
    E --> F
```

### Request flow

```mermaid
sequenceDiagram
    participant D as Dashboard
    participant N as n8n
    participant Q as Groq
    participant S as Google Sheets
    D->>N: POST /webhook/customer-support
    N->>N: Validate name, email, message
    N->>Q: Chat completion (JSON mode)
    Q-->>N: category, sentiment, priority, reply
    N->>N: Set SLA, build ticket record
    N->>S: Append row
    N->>S: Read all rows
    N-->>D: ticket + stats + recent tickets
```

## The 15 workflow nodes

| # | Node | Type | Job |
|---|---|---|---|
| 1 | Webhook | Webhook | Receives the POST request |
| 2 | Validate Input | Code | Cleans and checks the fields |
| 3 | Is Valid? | IF | Routes valid and invalid requests |
| 4 | Groq AI Analysis | HTTP Request | Calls the Groq chat completions API |
| 5 | Parse AI Result | Code | Reads the JSON, applies safe defaults |
| 6 | Is Urgent? | IF | Critical or High priority |
| 7 | Urgent SLA | Set | SLA 1 hour, escalated |
| 8 | Standard SLA | Set | SLA 24 hours |
| 9 | Join Paths | NoOp | Brings both branches together |
| 10 | Build Record | Code | Creates ticket ID, timestamp, final fields |
| 11 | Save to Google Sheets | Google Sheets | Appends the ticket |
| 12 | Read All Tickets | Google Sheets | Loads rows for analytics |
| 13 | Calculate Stats | Code | Totals and breakdowns |
| 14 | Respond Success | Respond to Webhook | Returns the result |
| 15 | Respond Error | Respond to Webhook | Returns a 400 with the reason |

## Requirements

- n8n 1.x, self-hosted or cloud
- A Groq account and API key from [console.groq.com](https://console.groq.com)
- A Google account with a Google Sheet and an OAuth connection in n8n
- Any modern browser for the dashboard
- No build step and no dependencies for the frontend

## Quick start

1. **Sheet.** Create a Google Sheet with a tab named `Tickets`. Import `google-sheet-template.csv` so row 1 holds the headers.
2. **Import.** In n8n choose *Import from file* and select `n8n-ai-support-workflow.json`.
3. **Groq credential.** Create a *Header Auth* credential:
   - Name: `Authorization`
   - Value: `Bearer gsk_your_key`
   - Rename the credential itself to "Groq API Key" (this label may contain spaces; the header name may not).
4. **Google credential.** Connect Google Sheets OAuth in nodes 11 and 12. Pick the same document and tab in both.
5. **Mapping.** In node 11 set *Mapping Column Mode* to **Map Automatically**.
6. **Activate** the workflow and copy the **Production** webhook URL.
7. **Dashboard.** Open `support-dashboard.html`, click *Webhook settings*, paste the URL and save.

## API

`POST /webhook/customer-support`

```json
{
  "customerName": "Alex Morgan",
  "email": "alex@example.com",
  "channel": "Website",
  "message": "I was charged twice for my subscription. Please help me."
}
```

Success (`200`) returns `success`, `ticket`, `stats` and `recent`. Failure (`400`) returns `{ "success": false, "error": "reason" }`.

## Sheet columns

`ticket_id, timestamp, name, email, message, category, sentiment, sentiment_score, priority, summary, ai_response, suggested_action, business_insight, sla, escalated, status`

Add `channel` as a column if you save it.

## Troubleshooting

| Message | Cause | Fix |
|---|---|---|
| `Header name must be a valid HTTP token` | Spaces in the credential's Name field | Set Name to `Authorization` |
| `model ... does not exist` | Model not available to your key | List models with `GET https://api.groq.com/openai/v1/models` and use an available id |
| `invalid syntax` in the body | Placeholder left in the expression | Paste the full body expression with no `...` |
| `At least one value has to be added under 'Values to Send'` | Manual mapping with empty fields | Use **Map Automatically** |
| Always the error branch | Node 3 checks a field node 2 does not output | Node 2 must output `valid` |
| Blank category and reply | AI output cut off | Raise `max_tokens`, or remove `response_format` |

## Project structure

```
.
├── README.md
├── n8n-ai-support-workflow.json
├── support-dashboard.html
└── google-sheet-template.csv
```

## Roadmap

- Email or Slack alert for escalated tickets
- Duplicate detection on repeated requests
- Weekly summary of top issues and sentiment trend
- Webhook secret and origin restriction

## Security notes

Keep API keys in n8n credentials, never in the workflow JSON or the dashboard. Restrict the webhook's allowed origin to your own domain before going live.
>>>>>>> 752b8653b1bc631fb83bd958b5f4807b482d9b0b
