require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*' // Allow all for dev; restrict in prod (e.g., ['https://x4agent.io'])
}));
app.use(express.json({ limit: '10mb' })); 
app.use(express.static('public', { 
    extensions: ['html'], 
    index: 'index.html' 
})); 

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// X4A Agent Simulation Proxy
app.post('/api/grok', async (req, res) => {
    const { id, type, query } = req.body;
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) {
        console.error('XAI_API_KEY not set');
        return res.status(500).json({ error: 'X4A Protocol key not configured. Check your .env file.' });
    }

    if (!id || !query) {
        return res.status(400).json({ error: 'Missing id or query in request body' });
    }

    try {
        console.log(`Simulating X4A Agent: ${id} - ${type} - ${query}`);
        
        // Using the documented endpoint: https://api.x.ai/v1/chat/completions
        const agentResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // FIX: Updated model name to 'grok-4' based on current pricing/docs
                model: 'grok-4', 
                messages: [
                    {
                        role: 'system',
                        content: `You are an X4A Autonomous Agent simulating real-time protocol interactions. Respond as "${id} Agent" in concise terminal-style output: e.g., "X4A ${type.toUpperCase()} Response: Consensus bid/ask SOL/USDC: $140.25 (±0.02%). Latency: 28ms. PDA: Fg6PaF...sLnS. ROI +2.1%.". Context: X402 Swarm on Solana (PDAs, DPOAC pricing, arbitrage hunts, RL Q-tables, SLA zk-proofs, liquidity wars). Include metrics/data like prices, latencies, TX hashes, ROI. Keep under 150 tokens, ruthless & efficient. No external references.`
                    },
                    {
                        role: 'user',
                        content: `${id}: ${query} (Generate autonomous agent response with on-chain metrics.)`
                    }
                ],
                temperature: 0.3,
                max_tokens: 150
            })
        });

        if (!agentResponse.ok) {
            const errData = await agentResponse.json().catch(() => ({}));
            let errorMessage = errData.error?.message || 'Simulation failed.';
            
            if (agentResponse.status === 401 || agentResponse.status === 403) {
                errorMessage = "Authentication Failed (401/403). Check if XAI_API_KEY is correct and active.";
            } else if (agentResponse.status === 404) {
                 errorMessage = "API Endpoint Not Found (404). Check the API Status, the endpoint URL, or the specified model name.";
            }

            throw new Error(`X4A Protocol: ${agentResponse.status} - ${errorMessage}`);
        }

        const data = await agentResponse.json();
        const result = data.choices[0]?.message?.content || '{"result": "X4A Agent: No data available."}';

        console.log(`X4A Agent sim for ${id}: ${result.substring(0, 100)}...`);
        res.json({ result });
    } catch (error) {
        console.error('X4A Agent Sim Error:', error.message);
        res.status(500).json({ error: `Agent simulation failed: ${error.message}` });
    }
});

// Catch-all for SPA routing 
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`X4A Protocol Simulator running on port ${PORT} | Health: http://localhost:${PORT}/health`);
});