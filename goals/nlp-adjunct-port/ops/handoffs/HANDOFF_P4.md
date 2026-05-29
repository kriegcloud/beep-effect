# P4 Handoff — MCP Driver (`packages/drivers/nlp-mcp`)

## Objective

Expose `@beep/nlp` operations (and the streaming/file-IO tools) as an MCP server in a new
driver-tier package, over stdio.

## Inputs

- Landed `@beep/nlp` (P2) + the generic IR (P3)
- P1 staging port of adjunct's `Mcp/` + `Mcp/Streaming/`
- v4 MCP source: `.repos/effect-v4/packages/effect/src/unstable/ai/{McpServer,McpSchema,Toolkit,Tool}.ts`
- `standards/architecture/03-driver-boundaries.md`, `.ai/mcp/mcp.json`
- Existing driver package for layout reference (e.g. `packages/drivers/*`)

## Required Work

1. Scaffold `packages/drivers/nlp-mcp` (driver family) depending on `@beep/nlp`.
2. Build the toolkit on `effect/unstable/ai/{McpServer,McpSchema,Toolkit,Tool}` — **no new
   dependency** (MCP is in core v4). Replace adjunct's `zod` tool schemas with `McpSchema`/
   effect `Schema`.
3. Port the NLP tools (`nlp_*`) and streaming/file-IO tools (`stream_*`,
   `DatasetLoader`/`Jsonl`/`TextStream`/`Cache`/`Pipeline`) using `effect/FileSystem`,
   `effect/Path`, `effect/unstable/encoding/Ndjson`.
4. Add a stdio `bin/` entrypoint; document a sample `.ai/mcp/mcp.json` entry.

## Exit Criteria

- [ ] `packages/drivers/nlp-mcp` builds + type-checks
- [ ] stdio server starts; an agent can call `nlp_*`/`stream_*` tools and get schema-valid output
- [ ] All MCP-surface inputs/outputs use effect `Schema`/`McpSchema` (no `zod`)
- [ ] Sample `.ai/mcp/mcp.json` entry documented
- [ ] `history/outputs/p4-mcp-driver.md` records the tool list + wiring
