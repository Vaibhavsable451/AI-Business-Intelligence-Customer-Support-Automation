const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5678;

app.use(bodyParser.json());

app.post('/webhook/customer-support', (req, res) => {
  console.log('⚡ Received webhook payload:', req.body);
  // TODO: Insert business logic here (e.g., forward to n8n, call Groq, store in DB)
  res.status(200).json({ status: 'ok', received: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Customer‑support webhook listening at http://localhost:${PORT}`);
});
