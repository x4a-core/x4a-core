/**
 * X4A SDK - JavaScript Client Library
 * 
 * This SDK provides a programmatic interface to interact with the X4A Autonomous Agents Market system.
 * It wraps API endpoints from the main server (server.js), agent servers (agent-server.js), and provides
 * utilities for handling the frontend (index.html) and animation diagram (x4a-animation-timeline.mmd).
 * 
 * Features:
 * - Fetch X4A token data, transactions, and holders.
 * - Buy agent shares with Solana payment handling.
 * - Interact with perpetual trading simulator (Perp Sim).
 * - Query AI agents via OpenAI-backed endpoints.
 * - Render Mermaid animation timelines.
 * - Wallet integration helpers.
 * 
 * Installation:
 * npm install --save x4a-sdk (hypothetical; in practice, save this file as index.js in your project)
 * 
 * Usage:
 * const X4ASDK = require('x4a-sdk');
 * const sdk = new X4ASDK({ serverUrl: 'http://localhost:3000', agentPortBase: 4021 });
 * 
 * Dependencies: 
 * - node-fetch (for Node.js)
 * - @solana/web3.js (for Solana interactions)
 * - mermaid (for rendering diagrams)
 * - openai (optional, for local agent simulation)
 * 
 * Note: This SDK assumes the servers are running. For production, secure with HTTPS and auth.
 */

const fetch = require('node-fetch');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const mermaid = require('mermaid'); // For rendering .mmd files
const OpenAI = require('openai'); // Optional for simulating agent queries locally

class X4ASDK {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   * @param {string} options.serverUrl - Base URL for main server (default: http://localhost:3000)
   * @param {number} options.agentPortBase - Base port for agent servers (default: 4021)
   * @param {string} options.solanaRpc - Solana RPC URL (default: https://api.mainnet-beta.solana.com)
   * @param {string} [options.openaiApiKey] - OpenAI API key for local simulations
   */
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || 'http://localhost:3000';
    this.agentPortBase = options.agentPortBase || 4021;
    this.solanaConnection = new Connection(options.solanaRpc || 'https://api.mainnet-beta.solana.com');
    this.openai = options.openaiApiKey ? new OpenAI({ apiKey: options.openaiApiKey }) : null;
    this.x4aMint = 'CMfDaPo69x4NQ2ELiz5grPzptj8aDocodXDMz1mVpump'; // From server.js
    this.agentEscrowPda = 'YourEscrowPDAAddressHere'; // Replace with actual PDA
    this.agentSharePriceLamports = 1000000000; // 1 SOL
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
  }

  // --- Utility Methods ---

  /**
   * Helper to make API requests
   * @param {string} endpoint - API path
   * @param {Object} [options] - Fetch options
   * @returns {Promise<Object>} JSON response
   */
  async _apiRequest(endpoint, options = {}) {
    const url = `${this.serverUrl}${endpoint}`;
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`API error: ${res.status} - ${await res.text()}`);
    return res.json();
  }

  // --- X4A Data Endpoints (from server.js) ---

  /**
   * Fetch X4A token data, transactions, and holders
   * @returns {Promise<Object>} { token, txns, holders, holderCount }
   */
  async getX4AData() {
    return this._apiRequest('/api/x4a-data');
  }

  /**
   * Submit Grok analysis query
   * @param {string} id - Query ID
   * @param {string} type - Query type (pricing, arbitrage, rl)
   * @returns {Promise<Object>} { success, result }
   */
  async submitGrokQuery(id, type) {
    return this._apiRequest('/api/grok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type }),
    });
  }

  // --- Agent Buying (from server.js) ---

  /**
   * Initiate agent share purchase
   * @param {string} walletAddress - Buyer's wallet address
   * @param {string} [agentId='X4A'] - Agent ID
   * @returns {Promise<Object>} Payment request details
   */
  async buyAgentShare(walletAddress, agentId = 'X4A') {
    return this._apiRequest('/api/buy-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, agentId }),
    });
  }

  /**
   * Confirm agent share purchase transaction
   * @param {string} txSignature - Solana transaction signature
   * @returns {Promise<Object>} { success, message, agentId }
   */
  async confirmBuyAgent(txSignature) {
    return this._apiRequest('/api/buy-agent/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txSignature }),
    });
  }

  /**
   * Verify Solana transaction status
   * @param {string} txSignature - Transaction signature
   * @returns {Promise<Object>} Signature status
   */
  async verifySolanaTx(txSignature) {
    return this.solanaConnection.getSignatureStatus(txSignature);
  }

  // --- Perp Sim Endpoints (from server.js) ---

  /**
   * Get perpetual trading candles
   * @param {string} symbol - Symbol (e.g., BTCUSDT)
   * @param {string} interval - Interval (1m, 5m, etc.)
   * @returns {Promise<Array>} Candle data
   */
  async getPerpCandles(symbol = 'BTCUSDT', interval = '1m') {
    return this._apiRequest(`/api/candles?symbol=${symbol}&interval=${interval}`);
  }

  /**
   * Get order book
   * @param {string} symbol - Symbol
   * @returns {Promise<Object>} { bids, asks, mid }
   */
  async getOrderBook(symbol = 'BTCUSDT') {
    return this._apiRequest(`/api/orderbook?symbol=${symbol}`);
  }

  /**
   * Get recent trades
   * @param {string} [symbol] - Optional symbol filter
   * @returns {Promise<Array>} Trade data
   */
  async getTrades(symbol) {
    const query = symbol ? `?symbol=${symbol}` : '';
    return this._apiRequest(`/api/trades${query}`);
  }

  /**
   * Get user portfolio snapshot
   * @param {string} wallet - Wallet address
   * @returns {Promise<Object>} Portfolio data
   */
  async getPortfolio(wallet) {
    return this._apiRequest(`/api/portfolio?wallet=${wallet}`);
  }

  /**
   * Place a perp order
   * @param {string} wallet - Wallet address
   * @param {string} symbol - Symbol
   * @param {string} side - buy/sell
   * @param {number} qty - Quantity
   * @returns {Promise<Object>} { ok, fill, snapshot }
   */
  async placeOrder(wallet, symbol, side, qty) {
    return this._apiRequest('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet, symbol, side, qty }),
    });
  }

  /**
   * Get user data
   * @param {string} wallet - Wallet address
   * @returns {Promise<Object>} { ok, user }
   */
  async getUser(wallet) {
    return this._apiRequest(`/api/user?wallet=${wallet}`);
  }

  // --- Agent Query (from agent-server.js) ---

  /**
   * Query an AI agent
   * @param {string} agentId - Agent ID (used to calculate port)
   * @param {string} query - Query string
   * @returns {Promise<Object>} { agentId, agentName, result }
   */
  async queryAgent(agentId, query) {
    const portOffset = parseInt(agentId.slice(-4)) % 1000;
    const agentUrl = `http://localhost:${this.agentPortBase + portOffset}`;
    const res = await fetch(`${agentUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`Agent query error: ${res.status}`);
    return res.json();
  }

  /**
   * Simulate agent query locally (if OpenAI key provided)
   * @param {string} agentName - Agent name
   * @param {string} agentDescription - Agent description
   * @param {string} query - Query string
   * @returns {Promise<Object>} Simulated response
   */
  async simulateAgentQuery(agentName, agentDescription, query) {
    if (!this.openai) throw new Error('OpenAI API key not provided');
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: `You are an expert ${agentName}: ${agentDescription}. Respond to: ${query}` }],
    });
    return { agentName, result: completion.choices[0].message.content };
  }

  // --- Rendering Utilities ---

  /**
   * Render Mermaid diagram from x4a-animation-timeline.mmd content
   * @param {string} mmdContent - Mermaid markdown content
   * @returns {Promise<string>} SVG string
   */
  async renderAnimationTimeline(mmdContent) {
    const { svg } = await mermaid.render('mermaid-diagram', mmdContent);
    return svg;
  }

  // --- Wallet Helpers (from index.html scripts) ---

  /**
   * Connect to Solana wallet (client-side only; for Node, use @solana/wallet-adapter)
   * Note: This is a placeholder; in browser, use wallet-adapter libraries directly.
   * @returns {Promise<string>} Wallet public key
   */
  async connectWallet() {
    if (typeof window === 'undefined' || !window.solana) throw new Error('Solana wallet not available (browser only)');
    await window.solana.connect();
    return window.solana.publicKey.toString();
  }

  // --- Additional Helpers ---

  /**
   * Format number (from index.html fmt function)
   * @param {number} n - Number
   * @param {number} d - Decimals
   * @returns {string} Formatted string
   */
  formatNumber(n, d = 2) {
    return (n === null || n === undefined || isNaN(n)) ? '-' : Number(n).toLocaleString(undefined, { maximumFractionDigits: d });
  }
}

module.exports = X4ASDK;