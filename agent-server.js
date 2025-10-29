// agent-server.js

const express = require('express');
// NOTE: 'x402-express' is a placeholder/mock library in a real-world scenario
// it would be replaced by your actual payment/middleware solution.
const { paymentMiddleware } = require('x402-express'); 
const OpenAI = require('openai');
require('dotenv').config();

// --- Configuration ---
// These arguments would typically be passed when running the agent, e.g.:
// node agent-server.js AGENT_ID AgentName "Agent Description" WALLET_PUBKEY
const [,, agentId, name, description, walletPubkey] = process.argv;
const AGENT_ID = agentId || 'RL-Agent-7'; 
const AGENT_NAME = name || 'CMAA Arbitrage Hunter';
const AGENT_DESCRIPTION = description || 'Cross-Market Arbitrage Agent for Solana DEXs.';
const WALLET_PUBKEY = walletPubkey || 'Fg6PaF...sLnS'; // Placeholder Public Key

// --- Initialization ---
const app = express();
app.use(express.json()); // for parsing application/json
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Requires OPENAI_API_KEY in .env

// --- Payment Middleware (MOCK) ---
// This middleware intercepts the request, checks for payment, and only
// proceeds to the '/query' handler if a payment (or micro-fee) is confirmed.
app.use(paymentMiddleware(
  WALLET_PUBKEY,
  {
    // Define the priced endpoint
    'POST /query': {
      price: '$0.001',
      network: 'solana', // Mainnet
      config: {
        discoverable: true,
        description: `${AGENT_NAME}: ${AGENT_DESCRIPTION}`,
        inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
        outputSchema: { type: 'object', properties: { result: { type: 'string' } } }
      }
    }
  },
  { 
      url: process.env.X402_FACILITATOR_URL || 'http://localhost:3000/x402' // MOCK Facilitator URL
  } 
));

// --- Agent Endpoint ---
app.post('/query', async (req, res) => {
  const { query } = req.body;
  console.log(`[${AGENT_NAME}] Received paid query: ${query}`);

  try {
    // 1. Call LLM (Simulated heavy lifting)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: `You are an expert ${AGENT_NAME}. Based on this user query, provide a technical, concise, on-chain response: ${query}` }]
    });

    const response = completion.choices[0].message.content;

    // 2. Respond to the client
    res.json({ 
        agentId: AGENT_ID,
        agentName: AGENT_NAME,
        result: response
    });
    
    // 3. Post-execution hook (e.g., webhook earnings, log transaction)
    // NOTE: This is where you would typically record the $0.001 USDC earned
    // await fetch(`http://localhost:3001/api/earnings`, { 
    //     method: 'POST', 
    //     body: JSON.stringify({ agentMint: AGENT_ID, amountUsdc: 0.001 }) 
    // });

  } catch (error) {
    console.error(`Error processing query for ${AGENT_NAME}:`, error);
    res.status(500).json({ error: 'Agent execution failed due to internal error.' });
  }
});

// --- Start Server ---
// Deterministic port based on the agent ID's hash for simple scaling.
const port = 4021 + parseInt(AGENT_ID.slice(-4)) % 1000; 

app.listen(port, () => console.log(`X402 Agent: ${AGENT_NAME} deployed on port :${port}`));