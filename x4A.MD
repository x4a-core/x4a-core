<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>X4A Rust Client Documentation</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Chosen Palette: "Slate Serenity" (Tailwind Slate + Teal Accents) -->
    <!-- Application Structure Plan: A single-page vertical layout with a sticky navigation header. Sections directly map to the README content (Overview, Quickstart, Implementation, Data Structures) for logical flow and ease of reference for developers. Interactions include smooth scrolling via navigation links. This linear structure is chosen for developer documentation clarity, mirroring the source document's logical progression. -->
    <!-- Visualization & Content Choices: 
        - README Intro -> Goal: Inform -> Presentation: Formatted Text Block -> Interaction: None -> Justification: Clear introductory text -> Library/Method: HTML/Tailwind.
        - Prerequisites -> Goal: Inform -> Presentation: Text + Code Block -> Interaction: None -> Justification: Shows setup steps clearly -> Library/Method: HTML/Tailwind, Custom CSS for code.
        - Cargo.toml -> Goal: Inform -> Presentation: Code Block -> Interaction: None -> Justification: Displays dependency configuration -> Library/Method: HTML/Tailwind, Custom CSS for code.
        - Client Structure -> Goal: Inform -> Presentation: Text Block -> Interaction: None -> Justification: Explains code organization -> Library/Method: HTML/Tailwind.
        - Core Implementation (chat fn) -> Goal: Inform/Organize -> Presentation: Text + Code Block -> Interaction: None -> Justification: Details the main function -> Library/Method: HTML/Tailwind, Custom CSS for code.
        - Data Structures (Structs) -> Goal: Inform/Organize -> Presentation: Text + Code Blocks -> Interaction: None -> Justification: Defines necessary types -> Library/Method: HTML/Tailwind, Custom CSS for code.
        - Chart.js/Plotly: Not used as the source material (README) contains code snippets and explanatory text, not quantitative data suitable for charting. Focus is on clear presentation of code and technical documentation.
    -->
    <!-- CONFIRMATION: NO SVG graphics used. NO Mermaid JS used. -->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc; /* Tailwind Slate-50 */
        }
        .nav-link {
            @apply px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-100 transition-colors;
        }
        .nav-link.active {
            @apply font-semibold text-teal-600 bg-slate-100;
        }
        /* Basic syntax highlighting for Rust code blocks */
        .code-block {
            @apply bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono shadow-md;
        }
        .code-block .keyword { color: #5eead4; } /* Teal-300 */
        .code-block .type { color: #67e8f9; } /* Cyan-300 */
        .code-block .function { color: #a5b4fc; } /* Indigo-300 */
        .code-block .string { color: #fde047; } /* Yellow-300 */
        .code-block .comment { color: #94a3b8; } /* Slate-400 */
        .code-block .number { color: #f9a8d4; } /* Pink-300 */
        .code-block .attribute { color: #fdba74; } /* Orange-300 */
        
        section {
            @apply mb-12 scroll-mt-20; /* scroll-mt accounts for sticky header */
        }
        h2 {
            @apply text-3xl font-bold text-slate-800 mb-4 border-b border-slate-300 pb-2;
        }
        h3 {
            @apply text-xl font-semibold text-slate-700 mt-6 mb-3;
        }
        p {
            @apply text-slate-600 leading-relaxed mb-4;
        }
        li {
            @apply text-slate-600;
        }
        strong {
           @apply text-slate-700 font-semibold; 
        }
    </style>
</head>
<body class="text-slate-800">

    <header class="sticky top-0 bg-white/90 backdrop-blur-md shadow-sm z-50 border-b border-slate-200">
        <nav class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex-shrink-0 flex items-center">
                    <span class="text-2xl font-bold text-teal-600">🦀</span>
                    <span class="ml-3 text-xl font-semibold text-slate-800">X4A Rust Client</span>
                </div>
                <div class="hidden sm:ml-6 sm:flex sm:space-x-2">
                    <a href="#overview" class="nav-link active" data-nav-link>Overview</a>
                    <a href="#quickstart" class="nav-link" data-nav-link>Quickstart</a>
                    <a href="#implementation" class="nav-link" data-nav-link>Implementation</a>
                    <a href="#data-structures" class="nav-link" data-nav-link>Data Structures</a>
                </div>
            </div>
        </nav>
    </header>

    <main class="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 mt-8">

        <section id="overview">
            <h2>Overview</h2>
            <p>This client library provides a robust, native interface for the X4A Protocol, allowing asynchronous, high-speed interaction with live X4A Agents and the core Swarm Orchestrator. It leverages the performance of Rust and the <code>ureq</code> library for minimal latency critical for decentralized finance applications.</p>
            <p>This interactive documentation provides a guide to setting up and using the client.</p>
        </section>

        <section id="quickstart">
            <h2>🚀 Quickstart</h2>
            <p>Follow these steps to integrate the X4A Rust client into your project.</p>

            <h3>Prerequisites</h3>
            <p>Ensure you have a recent Rust toolchain installed. You will also need access to the XAI Grok API key, which should ideally be set as an environment variable (e.g., `XAI_API_KEY`) or passed explicitly during client initialization.</p>
            
            <h3>Dependencies (`Cargo.toml`)</h3>
            <p>Add the following required dependencies to your project's `Cargo.toml` file to enable HTTP requests and JSON handling:</p>
            <div class="code-block">
<pre><code><span class="attribute">[dependencies]</span>
<span class="keyword">ureq</span> = { version = <span class="string">"2.9"</span>, features = [<span class="string">"json"</span>] }
<span class="keyword">serde</span> = { version = <span class="string">"1.0"</span>, features = [<span class="string">"derive"</span>] }
<span class="keyword">serde_json</span> = <span class="string">"1.0"</span></code></pre>
            </div>

            <h3>Client Structure (`src/x4a_client.rs`)</h3>
            <p>The core interaction logic is handled by the <code>X4AClient</code> struct and its <code>chat</code> method. This method acts as a proxy, sending requests to a defined base URL (typically your running Node.js proxy service). It manages API authentication using the provided key and parses the responses, converting them into structured Rust types.</p>
            <p>This section outlines the main implementation details and the data structures used.</p>
        </section>

        <section id="implementation">
            <h2>⚙️ Core Client Implementation</h2>
            <p>The <code>chat</code> function within the <code>X4AClient</code> implementation is the primary method for interacting with the X4A agent proxy. It constructs the HTTP POST request, includes the necessary headers (like `Content-Type` and `Authorization`), sends the JSON payload containing the agent ID, type, and query, and handles the response.</p>
            <p>Error handling is built-in: if the proxy returns an HTTP status code of 400 or higher, the function attempts to extract an error message from the JSON response body and returns it as a `Result::Err`. Successful responses are parsed to extract the agent's textual result.</p>
            <div class="code-block">
<pre><code><span class="comment">/// Sends a query to the X4A agent proxy and parses the resulting data.</span>
<span class="keyword">pub fn</span> <span class="function">chat</span>(&<span class="keyword">self</span>, params: ChatParams) -> <span class="type">Result</span>&lt;<span class="type">X4AResponse</span>, <span class="type">String</span>&gt; {
    <span class="comment">// Construct the full URL: e.g., http://localhost:3000/api/grok</span>
    <span class="keyword">let</span> url = <span class="function">format!</span>(<span class="string">"{}/api/grok"</span>, <span class="keyword">self</span>.base_url.<span class="function">trim_end_matches</span>(<span class="string">'/'</span>));
    
    <span class="keyword">let</span> <span class="keyword">mut</span> req = <span class="keyword">self</span>.<span class="function">agent</span>().<span class="function">post</span>(&url).<span class="function">set</span>(<span class="string">"Content-Type"</span>, <span class="string">"application/json"</span>);
    
    <span class="comment">// Authorization: Bearer &lt;API_KEY&gt;</span>
    <span class="keyword">if let</span> <span class="type">Some</span>(key) = &<span class="keyword">self</span>.api_key {
        req = req.<span class="function">set</span>(<span class="string">"Authorization"</span>, &<span class="function">format!</span>(<span class="string">"Bearer {}"</span>, key));
    }

    <span class="comment">// Send the payload</span>
    <span class="keyword">let</span> resp = req.<span class="function">send_json</span>(<span class="function">json!</span>({<span class="string">"id"</span>: params.id, <span class="string">"type"</span>: params.r#type, <span class="string">"query"</span>: params.query}))
        .<span class="function">map_err</span>(|e| e.<span class="function">to_string</span>())?;
    
    <span class="keyword">let</span> status = resp.<span class="function">status</span>();
    <span class="keyword">let</span> data: <span class="type">serde_json::Value</span> = resp.<span class="function">into_json</span>().<span class="function">map_err</span>(|e| e.<span class="function">to_string</span>())?;
    
    <span class="comment">// Handle HTTP status errors</span>
    <span class="keyword">if</span> status >= <span class="number">400</span> {
        <span class="keyword">return</span> <span class="type">Err</span>(data.<span class="function">get</span>(<span class="string">"error"</span>).<span class="function">and_then</span>(|v| v.<span class="function">as_str</span>()).<span class="function">unwrap_or</span>(<span class="string">"HTTP error"</span>).<span class="function">to_string</span>());
    }
    
    <span class="comment">// Parse result from proxy's 'result' field or Grok's native 'choices[0].message.content'</span>
    <span class="keyword">let</span> result = data.<span class="function">get</span>(<span class="string">"result"</span>)
        .<span class="function">and_then</span>(|v| v.<span class="function">as_str</span>())
        .<span class="function">map</span>(|s| s.<span class="function">to_string</span>())
        .<span class="function">or_else</span>(|| {
            data.<span class="function">get</span>(<span class="string">"choices"</span>)
                .<span class="function">and_then</span>(|v| v.<span class="function">as_array</span>())
                .<span class="function">and_then</span>(|arr| arr.<span class="function">get</span>(<span class="number">0</span>))
                .<span class="function">and_then</span>(|c| c.<span class="function">get</span>(<span class="string">"message"</span>).<span class="function">and_then</span>(|m| m.<span class="function">get</span>(<span class="string">"content"</span>)).<span class="function">and_then</span>(|s| s.<span class="function">as_str</span>()).<span class="function">map</span>(|s| s.<span class="function">to_string</span>())
                    .<span class="function">or_else</span>(|| c.<span class="function">get</span>(<span class="string">"text"</span>).<span class="function">and_then</span>(|s| s.<span class="function">as_str</span>()).<span class="function">map</span>(|s| s.<span class="function">to_string</span>())))
        });

    <span class="type">Ok</span>(<span class="type">X4AResponse</span> {
        result,
        choices: <span class="type">None</span>,
        model: data.<span class="function">get</span>(<span class="string">"model"</span>).<span class="function">and_then</span>(|v| v.<span class="function">as_str</span>()).<span class="function">map</span>(|s| s.<span class="function">to_string</span>()),
        error: <span class="type">None</span>,
    })
}</code></pre>
            </div>
        </section>

        <section id="data-structures">
            <h2>Data Structures</h2>
            <p>The client utilizes these core Rust structs for clear and type-safe data handling when interacting with the X4A proxy API.</p>

            <h3>`ChatParams`</h3>
            <p>This struct defines the input parameters required for every call to the <code>chat</code> function. It ensures that the necessary agent ID, component type, and query text are provided.</p>
            <div class="code-block">
<pre><code><span class="comment">/// Parameters required for a chat interaction</span>
<span class="keyword">pub struct</span> <span class="type">ChatParams</span>&lt;<span class="string">'a'</span>&gt; {
    <span class="keyword">pub</span> id: &<span class="string">'a'</span> <span class="type">str</span>,      <span class="comment">// The agent ID or component ID (e.g., "ARB1")</span>
    <span class="keyword">pub</span> r#type: &<span class="string">'a'</span> <span class="type">str</span>,  <span class="comment">// The type of swarm component (e.g., "arbitrage")</span>
    <span class="keyword">pub</span> query: &<span class="string">'a'</span> <span class="type">str</span>,   <span class="comment">// The specific query being executed</span>
}</code></pre>
            </div>

            <h3>`X4AResponse`</h3>
            <p>This struct represents the parsed response received from the X4A proxy. The primary field is <code>result</code>, which contains the core, terminal-style text output from the agent. It also includes optional fields for the underlying model name and potentially raw choices data (though currently simplified to <code>None</code>).</p>
            <div class="code-block">
<pre><code><span class="comment">/// The structured response returned by the X4A chat endpoint</span>
<span class="attribute">#[derive(Debug)]</span>
<span class="keyword">pub struct</span> <span class="type">X4AResponse</span> {
    <span class="keyword">pub</span> result: <span class="type">Option</span>&lt;<span class="type">String</span>&gt;, <span class="comment">// The core, terminal-style response from the agent</span>
    <span class="keyword">pub</span> choices: <span class="type">Option</span>&lt;<span class="type">serde_json::Value</span>&gt;, 
    <span class="keyword">pub</span> model: <span class="type">Option</span>&lt;<span class="type">String</span>&gt;,  <span class="comment">// The model used by the Grok backend (e.g., "grok-4")</span>
    <span class="keyword">pub</span> error: <span class="type">Option</span>&lt;<span class="type">String</span>&gt;,
}</code></pre>            
            </div>
        </section>

    </main>

    <footer class="border-t border-slate-200 mt-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-500 text-sm">
            <p>X4A Rust Client Documentation</p>
        </div>
    </footer>

    <script>
        // === Navigation Active State & Smooth Scroll ===
        document.addEventListener('DOMContentLoaded', () => {
            const navLinks = document.querySelectorAll('[data-nav-link]');
            const sections = document.querySelectorAll('section[id]');
            
            // Function to update active link
            const updateActiveLink = () => {
                let currentSectionId = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    // Adjust threshold slightly below header height (64px)
                    if (window.scrollY >= sectionTop - 70) { 
                        currentSectionId = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSectionId}`) {
                        link.classList.add('active');
                    }
                });
                
                // Default to overview if near top
                if (window.scrollY < 100 && !currentSectionId) {
                     navLinks.forEach(link => link.classList.remove('active'));
                     const overviewLink = document.querySelector('a[href="#overview"]');
                     if(overviewLink) overviewLink.classList.add('active');
                }
            };

            // Initial call and on scroll
            updateActiveLink();
            window.addEventListener('scroll', updateActiveLink);

            // Smooth scroll for nav links
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        // Use scrollIntoView for smooth behavior
                         targetElement.scrollIntoView({ behavior: 'smooth' });

                        // Manually update active state immediately for better UX
                        navLinks.forEach(lnk => lnk.classList.remove('active'));
                        link.classList.add('active');
                    }
                });
            });
        });
    </script>
</body>
</html>
