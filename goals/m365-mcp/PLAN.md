# M365 MCP Server Plan

## Status

Status: `completed`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | completed | Confirm the `@beep/nlp-mcp` `Server.ts`/`bin.ts`/toolkit pattern and the `@beep/m365` verb surface to expose; scaffold `@beep/m365-mcp`. | Pattern confirmed; driver verbs to wrap listed; package scaffolded. |
| P1 Implement | completed | Build the M365 read toolkit (`Tool.make` + `Tool.HandlersFor` delegating to `@beep/m365`), `makeServerLayer` over `McpServer.layerStdio`, and a `bin`. | Acceptance criteria are met. |
| P2 Verify | completed | Run the toolkit smoke (enumerate + one call vs a mock driver layer); capture evidence. | Verification green or blockers documented. |
| P3 Close | completed | Prepare PR, review response, write the closeout reflection, final readiness if requested. | Packet status/evidence updated; a closeout reflection exists. |

## P3 Closeout Checklist

Before marking the packet closed (and `status` → `completed-retained` / `complete`):

1. Write a closeout reflection via the `/reflect` skill (or copy
   `goals/_template/history/reflections/_TEMPLATE.md`) to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Critique the repo **tooling**,
   the **implementation**, and the **goal/prompt**. Capture TODOs. Its YAML
   frontmatter must validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts` (this packet has
   `reflectionRequired: true`).
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.

## Execution Notes

- Depends on `m365-driver` (`@beep/m365`); do not start P1 until the driver's read
  verbs exist (or stub against its service interface + a mock layer).
- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Mirror `@beep/nlp-mcp`; do not reinvent the MCP assembly.

## Verification Commands

```sh
TURBO_FORCE=1 bunx turbo run build check lint test --filter=@beep/m365-mcp
test "$(wc -m < goals/m365-mcp/GOAL.md)" -le 4000
jq . goals/m365-mcp/ops/manifest.json
rg -n "m365-mcp|GOAL.md|agentLaunchers|packetAnchorDocument" goals/m365-mcp
git diff --check -- goals/m365-mcp
bun run beep lint reflection-artifacts
```
