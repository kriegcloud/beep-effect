import * as R from "effect/Record";
import * as Str from "effect/String";

// Quick test to see what the Railway Graphiti MCP returns
const apiUrl = process.env.GRAPHITI_API_URL ?? "https://auth-proxy-production-91fe.up.railway.app/mcp";
const apiKey = process.env.GRAPHITI_API_KEY ?? "";

async function postMcp(sessionId: string | null, payload: unknown) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    "x-api-key": apiKey,
  };
  if (sessionId) headers["mcp-session-id"] = sessionId;

  const resp = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const body = await resp.text();
  console.log(`--- ${resp.status} ${resp.statusText} ---`);
  console.log("Headers:", Object.fromEntries(resp.headers.entries()));
  console.log("Body:", Str.slice(0, 2000)(body));
  return { response: resp, body };
}

async function main() {
  // 1. Initialize
  console.log("\n=== INITIALIZE ===");
  const init = await postMcp(null, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "test-script", version: "0.0.1" },
    },
  });

  const sessionId = init.response.headers.get("mcp-session-id");
  console.log("Session ID:", sessionId);

  if (!sessionId) {
    console.error("No session ID!");
    return;
  }

  // 2. Initialized notification
  console.log("\n=== INITIALIZED ===");
  await postMcp(sessionId, {
    jsonrpc: "2.0",
    method: "notifications/initialized",
  });

  // 3. Search nodes
  console.log("\n=== SEARCH NODES ===");
  const searchResult = await postMcp(sessionId, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "search_nodes",
      arguments: {
        query: "effect v4",
        max_nodes: 5,
        group_ids: ["effect-v4"],
        entity_types: null,
      },
    },
  });

  // Try to parse the response
  try {
    const lines = Str.split("\n")(searchResult.body);
    const dataLine = lines.find((l: string) => l.startsWith("data: "));
    const jsonStr = dataLine ? Str.slice(6)(dataLine) : searchResult.body;
    const parsed = JSON.parse(jsonStr);
    console.log("\nParsed result keys:", R.keys(parsed));
    if (parsed.result) {
      console.log("Result keys:", R.keys(parsed.result));
      if (parsed.result.content) {
        console.log("Content length:", parsed.result.content.length);
        for (const c of parsed.result.content) {
          console.log("Content item type:", c.type, "text length:", c.text?.length);
          if (c.text) {
            try {
              const inner = JSON.parse(c.text);
              console.log("Inner keys:", R.keys(inner));
              console.log("Nodes count:", inner.nodes?.length);
              if (inner.nodes?.[0]) console.log("First node:", Str.slice(0, 200)(JSON.stringify(inner.nodes[0])));
            } catch {
              console.log("Text (not JSON):", Str.slice(0, 200)(c.text));
            }
          }
        }
      }
      if (parsed.result.structuredContent) {
        console.log("Structured content:", Str.slice(0, 500)(JSON.stringify(parsed.result.structuredContent)));
      }
    }
  } catch (e) {
    console.log("Parse error:", e);
  }
}

main().catch(console.error);
