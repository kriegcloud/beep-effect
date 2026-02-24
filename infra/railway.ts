// Railway infrastructure: project, services (FalkorDB, Graphiti MCP, Auth Proxy),
// environment variables, domains, and volumes.

import { falkordbPassword, graphitiApiKey, openaiApiKey } from "./secrets";

// URL-encode the password so special chars (+, /, =, @) don't break URI parsing
const encodedFalkordbPassword = encodeURIComponent(falkordbPassword);

// --- Railway Project ---
// Creating a project auto-creates a default environment.
// Access its ID via: project.defaultEnvironment.apply(env => env.id)
const project = new railway.Project("RailwayProject", {
  name: `beep-${$app.stage}`,
  description: `Knowledge Graph Explorer — ${$app.stage}`,
});

const defaultEnvId = project.defaultEnvironment.apply((env) => env.id);

// --- FalkorDB Service ---
// Redis-protocol graph database on port 6379.
// Private networking: falkordb.railway.internal:6379
const falkordb = new railway.Service("FalkorDb", {
  name: "falkordb",
  projectId: project.id,
  sourceImage: "falkordb/falkordb:latest",
  // Data seeded via ghcr.io/kriegcloud/falkordb-seeded:seed-v3 (2026-02-23).
  // FalkorDB data dir: /var/lib/falkordb/data (NOT /data).
  // Persistent volume "falkordb-volume" (5GB) mounted at /var/lib/falkordb/data via CLI.
  // Volume created via `railway volume add --mount-path /var/lib/falkordb/data`.
  // IaC volume creation fails with v0.4.4 provider bug — managed manually.
  // See: outputs/p1-railway-provider-gaps.md
});

new railway.VariableCollection("FalkorDbVars", {
  environmentId: defaultEnvId,
  serviceId: falkordb.id,
  variables: [{ name: "FALKORDB_PASSWORD", value: falkordbPassword }],
});

// --- Graphiti MCP Service ---
// Knowledge graph MCP server on port 8000.
// Private networking: graphiti-mcp.railway.internal:8000
const graphiti = new railway.Service("GraphitiMcp", {
  name: "graphiti-mcp",
  projectId: project.id,
  sourceImage: "zepai/knowledge-graph-mcp:standalone",
});

new railway.VariableCollection("GraphitiVars", {
  environmentId: defaultEnvId,
  serviceId: graphiti.id,
  variables: [
    {
      name: "FALKORDB_URI",
      value: $interpolate`redis://default:${encodedFalkordbPassword}@falkordb.railway.internal:6379`,
    },
    { name: "OPENAI_API_KEY", value: openaiApiKey },
    { name: "GRAPHITI_GROUP_ID", value: "effect-v4" },
    { name: "PORT", value: "8000" },
    { name: "SEMAPHORE_LIMIT", value: "5" },
  ],
});

// --- Auth Proxy Service ---
// Caddy reverse proxy enforcing X-API-Key header.
// Only public-facing service — gets a *.up.railway.app domain.
// Private networking: auth-proxy.railway.internal:80
//
// MANUAL STEP: Set the start command in Railway dashboard because the
// provider has no startCommand field:
//   sh -c 'printf "%s" "$CADDYFILE" > /etc/caddy/Caddyfile && caddy run --config /etc/caddy/Caddyfile --adapter caddyfile'
// See: outputs/p1-railway-provider-gaps.md
const proxy = new railway.Service("AuthProxy", {
  name: "auth-proxy",
  projectId: project.id,
  sourceImage: "caddy:2-alpine",
});

// Caddyfile that validates X-API-Key and reverse-proxies to Graphiti MCP.
// {$VAR} is Caddy's env-var interpolation syntax (not JS template literals).
const caddyfile = [
  ":80 {",
  "  @hasApiKey header X-API-Key {$API_KEY}",
  "",
  "  handle @hasApiKey {",
  "    reverse_proxy {$BACKEND_URL} {",
  "      header_up X-Forwarded-Proto https",
  "    }",
  "  }",
  "",
  "  respond 401 {",
  '    body "Unauthorized"',
  "    close",
  "  }",
  "}",
].join("\n");

new railway.VariableCollection("ProxyVars", {
  environmentId: defaultEnvId,
  serviceId: proxy.id,
  variables: [
    { name: "BACKEND_URL", value: "http://graphiti-mcp.railway.internal:8000" },
    { name: "API_KEY", value: graphitiApiKey },
    { name: "RATE_LIMIT", value: "100" },
    { name: "CADDYFILE", value: caddyfile },
    // Explicitly tell Railway which port to route public traffic to.
    // caddy:2-alpine EXPOSEs 80, 443, and 2019 — Railway needs disambiguation.
    { name: "PORT", value: "80" },
  ],
});

// Public domain for the auth proxy.
// NOTE: ServiceDomain creation fails with v0.4.4 provider (400 Bad Request).
// Domain was generated manually via Railway dashboard.
// If the Railway project is recreated, generate a new domain and update this constant.
// See: outputs/p1-railway-provider-gaps.md

// --- Exports ---
export const railwayProjectId = project.id;
export const proxyUrl = "https://auth-proxy-production-91fe.up.railway.app";
