use serde_json::json;
use std::time::Duration;

// --- Required Structs/Enums (Placeholders for context) ---

/// Parameters required for a chat interaction
pub struct ChatParams<'a> {
    pub id: &'a str,
    pub r#type: &'a str,
    pub query: &'a str,
}

/// The response structure returned by the X4A chat endpoint
#[derive(Debug)]
pub struct X4AResponse {
    pub result: Option<String>,
    pub choices: Option<serde_json::Value>, // Optional: For raw Grok response structure
    pub model: Option<String>,
    pub error: Option<String>,
}

/// Core X4A Client to interact with the proxy/API
pub struct X4AClient {
    base_url: String,
    api_key: Option<String>,
    timeout: Duration,
}

impl X4AClient {
    /// Constructs the ureq Agent (HTTP client) with the defined timeout.
    fn agent(&self) -> ureq::Agent {
        ureq::AgentBuilder::new().timeout(self.timeout).build()
    }

    /// Sends a query to the X4A agent proxy and parses the resulting data.
    pub fn chat(&self, params: ChatParams) -> Result<X4AResponse, String> {
        // Construct the full URL for the local Node.js proxy: e.g., http://localhost:3000/api/grok
        let url = format!("{}/api/grok", self.base_url.trim_end_matches('/'));
        
        let mut req = self.agent().post(&url).set("Content-Type", "application/json");
        
        // Add Authorization header if an API key is provided
        if let Some(key) = &self.api_key {
            req = req.set("Authorization", &format!("Bearer {}", key));
        }

        // Send the JSON payload containing agent ID, type, and query
        let resp = req.send_json(json!({"id": params.id, "type": params.r#type, "query": params.query}))
            .map_err(|e| e.to_string())?;
        
        let status = resp.status();
        let data: serde_json::Value = resp.into_json().map_err(|e| e.to_string())?;
        
        // Handle HTTP errors (status code >= 400)
        if status >= 400 {
            // Attempt to extract the specific error message from the JSON body
            return Err(data.get("error").and_then(|v| v.as_str()).unwrap_or("HTTP error").to_string());
        }
        
        // Try to extract the final result string from two possible locations:
        // 1. The direct "result" field (from the Node.js proxy wrapper)
        // 2. The standard Grok structure: choices[0].message.content (as a fallback)
        let result = data.get("result")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .or_else(|| {
                data.get("choices")
                    .and_then(|v| v.as_array())
                    .and_then(|arr| arr.get(0))
                    .and_then(|c| c.get("message").and_then(|m| m.get("content")).and_then(|s| s.as_str()).map(|s| s.to_string())
                        .or_else(|| c.get("text").and_then(|s| s.as_str()).map(|s| s.to_string())))
            });

        // Return the successfully parsed X4AResponse
        Ok(X4AResponse {
            result,
            choices: None, // Simplified, keeping choices data out of the final struct
            model: data.get("model").and_then(|v| v.as_str()).map(|s| s.to_string()),
            error: None,
        })
    }
}
