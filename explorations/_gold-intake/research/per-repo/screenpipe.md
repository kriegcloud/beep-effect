# screenpipe  `[T3]`

- **Purpose:** Local-first 24/7 screen + audio recorder with a queryable local REST API and MCP server over OCR/accessibility/audio capture ("AI that knows what you've seen, said, or heard").
- **Stack:** Rust (capture/core crates), TypeScript/Bun (MCP server, packages), Tauri desktop app, React UI; local REST API at localhost:3030; MCP via @modelcontextprotocol/sdk.
- **Size / shape:** ~1,458 Rust/TS/TSX files (excluding node_modules); monorepo (Cargo + Bun workspaces) with apps/, crates/, packages/ (incl. packages/screenpipe-mcp MCP server), ee/, docker/. Kind: desktop app + local server + MCP server.
- **License:** LicenseRef-Screenpipe-Commercial
- **Maturity:** Active; last commit 2026-06-28.

**Notes:** Domain (screen/audio surveillance capture) is unrelated to legal IP; no schemas, parsers, taxonomies, OWL/SHACL, or provenance-span code worth porting. Value is confined to MCP/agent ergonomics: tool-description routing conventions, context-reduction response reshaping, and a namespaced-tag linking idea. License is a proprietary Screenpipe Commercial License (LICENSE.md) — code is reference-only, not copyable; treat nuggets as pattern inspiration, not source to vendor.

## Gold nuggets (3)

### 1. MCP tool descriptions with explicit USE WHEN / DO NOT USE routing
`mcp-design` · relevance: **direct** · verified

Each MCP tool definition embeds disambiguation guidance ('USE WHEN', 'DO NOT USE for', cross-references to sibling tools, and starting-limit advice) plus structured annotations (readOnlyHint/idempotentHint/openWorldHint/title). Directly reusable pattern for beep's @beep/nlp-mcp tool surface to reduce tool-selection errors and keep the agent on candidate-vs-proof rails. Descriptions live inline in a plain @modelcontextprotocol/sdk Server (not FastMCP+Zod), so beep would adapt the prose pattern, not the framework.

- **Source:** `packages/screenpipe-mcp/src/index.ts:286-294`
- **beep-target:** @beep/nlp-mcp tool-definition conventions (annotations + USE WHEN/DO NOT USE routing)

```
description:
  "Search screen text, audio transcriptions, input events, and memories. ..." +
  "USE WHEN: you need the actual text/content of a moment ..." +
  "DO NOT USE for: broad questions like 'what was I doing?' (use activity-summary ...) " +
  "Also DO NOT USE for: targeted UI controls (use search-elements). " +
  "Start with limit=5, increase only if needed. ...",
annotations: { title: "Search Content", readOnlyHint: true, openWorldHint: false, idempotentHint: true },
```

### 2. Context-window protection: server-side response reshaping (format=csv/outline, fields, max_content_length)
`mcp-design` · relevance: **adjacent** · adjusted

The skill documents progressive-disclosure / context-reduction tactics for large local-API responses: write to file then check size, request columnar csv/tsv to emit column names once (~70% token cut), an indented deduped 'outline/tree' format (~91% cut), a fields whitelist with dotted paths, and middle-truncation via max_content_length. Directly applicable to beep MCP tools that return large source documents, provenance spans, or KG query results without blowing the context budget.

- **Source:** `.claude/skills/screenpipe-api/SKILL.md:22-24`
- **beep-target:** Context-reduction / progressive-disclosure layer for @beep/nlp-mcp tool outputs and KG query results

```
API responses can be large. Always write curl output to a file first ... and if over 5KB read only the first 50-100 lines.
For the list endpoints ... add `&format=csv` (or `tsv`) ... and `&fields=a,b,c` to return only the columns you need (dotted paths like `content.text`). ... `&format=outline` (alias `tree`) goes further still — a deduped, indented tree ... (~91% fewer tokens, measured).
```

### 3. Namespaced tag linking model across heterogeneous content types
`agent-memory` · relevance: **serendipitous** · adjusted

A single comma-separated tag string (namespaced as person:/project:/topic:) links screen, audio, and stored 'memory' records, with an include_related flag returning co-occurring tags ranked by frequency for one-call context expansion. Adjacent inspiration for beep's agent-memory and cross-slice linking: a uniform namespaced-tag join across otherwise distinct stores, plus surfacing related entities in a single retrieval call.

- **Source:** `packages/screenpipe-mcp/src/index.ts:330-340`
- **beep-target:** agents slice memory tagging / cross-slice entity linking and related-context retrieval

```
tags: {
  type: "string",
  description:
    "Comma-separated tags; returns only items carrying ALL of them (e.g. 'person:ada,project:atlas'). ... Same tag string links across all three ... Use namespaced tags (person:, project:, topic:) to link people/projects/topics.",
},
include_related: {
  type: "boolean",
  description:
    "With tags set, also return the co-occurring tags ... ranked by frequency ... One call for the surrounding context instead of several follow-ups.",
},
```
