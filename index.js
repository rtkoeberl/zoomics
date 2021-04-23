// Build Server
const express = require('express');
const app = express();

// Import environmental variables
const dotenv = require('dotenv').config();
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } = process.env;

// Import additional tools
const cors = require('cors');
const path = require('path');
const axios = require('axios');

app.use(cors())

// Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/static/index.html'))
});

// Send to Zoom Login
app.get('/login/zoom', (req, res) => {
  res.redirect(
    `https://zoom.us/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URL)}`
  );
});

// Send Access Token Request
async function getAccessToken(code) {
  const body = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: encodeURIComponent(REDIRECT_URL)
  }
  const opts = {
    headers: {
      'Authorization': `Basic ${btoa(CLIENT_ID + ':' + CLIENT_SECRET)}`
    }
  }

  const res = await axios.post('https://zoom.us/oauth/token', body, opts);
  const data = await res.text();
  const params = new URLSearchParams(data);
  return params.get('access_token');
}

// Callback for Zoom Login - Retrieve Access Token
app.get('/login/zoom/callback', async (req, res) => {
  const code = req.query.code;
  const token = await getAccessToken(code)
  res.json({token})
})

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
