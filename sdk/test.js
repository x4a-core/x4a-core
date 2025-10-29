// In any .js file (e.g., test.js)
const X4ASDK = require('./sdk/x4a-sdk.js');  // Path relative to your file

const sdk = new X4ASDK({
  serverUrl: 'http://localhost:3000',
  agentPortBase: 4021,
  openaiApiKey: process.env.OPENAI_API_KEY  // Optional
});

// Example call
sdk.getX4AData().then(console.log);