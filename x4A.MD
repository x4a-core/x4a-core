fn agent(&self) -> ureq::Agent {
    ureq::AgentBuilder::new().timeout(self.timeout).build()
}

pub fn chat(&self, params: ChatParams) -> Result<X4AResponse, String> {
    let url = format!("{}/api/grok", self.base_url.trim_end_matches('/'));
    let mut req = self.agent().post(&url).set("Content-Type", "application/json");
    if let Some(key) = &self.api_key {
        req = req.set("Authorization", &format!("Bearer {}", key));
    }
    let resp = req.send_json(json!({"id": params.id, "type": params.r#type, "query": params.query}))
        .map_err(|e| e.to_string())?;
    let status = resp.status();
    let data: serde_json::Value = resp.into_json().map_err(|e| e.to_string())?;
    if status >= 400 {
        return Err(data.get("error").and_then(|v| v.as_str()).unwrap_or("HTTP error").to_string());
    }
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

    Ok(X4AResponse {
        result,
        choices: None,
        model: data.get("model").and_then(|v| v.as_str()).map(|s| s.to_string()),
        error: None,
    })
}
