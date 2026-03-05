# P5 E2E Results

Date: 2026-02-20
Workspace: `/home/elpresidank/YeeBois/projects/beep-effect2`

## Scope

Required P5 checks executed:
- Retrieval E2E prompts (`create Account schema`, `add error handling`)
- Hook behavior (`SessionStart`, `UserPromptSubmit`, skip heuristics)

## Retrieval E2E Checks

### Scenario 1 — `create Account schema`
- Expected: existing schema patterns are returned.
- Actual: **FAIL**.
- Evidence: `search_codebase` failed before retrieval with:
  - `Failed to load embedding model: Could not locate file: "https://huggingface.co/nomic-ai/CodeRankEmbed/resolve/main/onnx/model.onnx".`
- Measured attempt latency to failure: `57.47ms`.

### Scenario 2 — `add error handling`
- Expected: existing tagged error patterns are returned.
- Actual: **FAIL**.
- Evidence: `search_codebase` failed with the same embedding initialization error.
- Measured attempt latency to failure: `59.54ms`.

## Hook Behavior Checks

Hook checks were run from built entrypoints:
- `tooling/codebase-search/dist/hooks/session-start-entry.js`
- `tooling/codebase-search/dist/hooks/prompt-submit-entry.js`

Because live reindex is blocked (embedding model load failure), a minimal local `.code-index` fixture was seeded to validate hook formatting/skip logic.

### SessionStart includes package/symbol overview when index exists
- Result: **PASS**.
- Output contains:
  - `## Codebase Index Overview`
  - `**3 symbols** indexed across **3 files**`
  - MCP tool list (`search_codebase`, `find_related`, `browse_symbols`, `reindex`)
- Runtime: `236.09ms`.

### UserPromptSubmit injects relevant context for coding prompts
- Prompt: `create Account schema with validation and examples`
- Result: **PASS**.
- Output contains `<system-reminder>` with relevant symbol context.
- Runtime: `470.98ms`.

### Skip heuristics suppress injection for short/meta prompts
- Prompt `ok`: **PASS** (empty output)
- Prompt `how does claude code work`: **PASS** (empty output)
- Runtimes: `462.35ms`, `458.83ms`

## E2E Verdict

**FAIL** — mandatory retrieval E2E checks could not pass due embedding model initialization failure in live search/index paths.
