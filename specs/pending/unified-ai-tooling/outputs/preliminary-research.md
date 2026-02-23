# Preliminary Research: Unified AI Tooling (.beep)

Date: 2026-02-23
Scope: close decision gaps before execution

## 1. Research Questions

1. What is the best AGENTS strategy for root + monorepo package scopes?
2. Can 1Password SDK support required secret resolution in v1 (with fail-hard behavior)?
3. What JetBrains artifacts are realistically in scope for parity?
4. Should managed targets use merge-in-place or full-file rewrite?
5. How should managed ownership be tracked for strict JSON outputs?
6. Where should runtime code live in this monorepo?

## 2. Method

- Prioritized primary vendor docs and official standards pages.
- Pulled open-source sync-tool prior art for ownership and overwrite behavior.
- Cross-checked conclusions against current repo structure and constraints.

## 3. Findings

### 3.1 AGENTS best practices support nested monorepo usage

- `AGENTS.md` spec explicitly supports nested files and states nearest-file precedence.
- Codex docs confirm AGENTS is discovered from the current working directory upward.

Implication:
- Root `AGENTS.md` should be generated always.
- Package-level `AGENTS.md` should be generated where absent (or where managed), and staleness must be checked via `beep-sync check`.
- A deterministic freshness workflow is viable without symlinks.

### 3.2 MCP secret references are supported across key tools

- Codex MCP supports env-based fields (`env`, `env_vars`, `bearer_token_env_var`, `env_http_headers`).
- Claude MCP docs include environment-variable expansion for `.mcp.json`.
- Windsurf MCP supports `env` and env-var interpolation in config.

Implication:
- Commit generated configs with references/placeholders, never plaintext resolved values.
- Runtime secret resolution can inject env values during command execution.

### 3.3 1Password SDK is feasible; CLI remains operationally relevant

- 1Password SDK docs describe service-account usage and app/account setup.
- 1Password CLI supports `op read`, `op run`, and secret reference syntax (`op://...`).
- Repo already contains `@1password/sdk` dependency (`package.json`).

Implication:
- SDK-first design is feasible in v1.
- Keep CLI path documented for developer setup/debug parity.
- Use hybrid auth policy: desktop auth for local interactive runs, service-account auth for automation/non-interactive runs.
- Required secret resolution should fail hard when auth/session is unavailable.

### 3.4 JetBrains parity can extend beyond project rules

Primary docs confirm:
- project rules: `.aiassistant/rules/*.md`
- MCP settings with project/global scopes and JSON import/export flows
- prompt library support (custom reusable prompts)
- project indexing/restriction controls via `.aiignore` and `.noai`

Implication:
- JetBrains v1 should include project rules + project-level MCP outputs as hard requirements.
- Prompt-library and indexing artifacts should be modeled as scoped extensions (`tool_overrides.jetbrains.*`) because portability is low.

### 3.5 Ownership model prior art favors explicit overwrite controls

Open-source tool evidence:
- Rulesync: default overwrite protection + explicit `--overwrite/--force`.
- Ruler: explicit merge vs overwrite knobs, backups, and managed sections.

Implication:
- For deterministic generated targets, full-file rewrite should be default.
- Merge-in-place should be avoided for managed targets due ambiguity and drift risk.
- One-time import/migration should precede ownership takeover.

### 3.6 JSON managed markers should be sidecar-based

- RFC 8259 grammar defines JSON text/whitespace without comments.
- Comment markers are therefore not portable across strict JSON parsers.

Implication:
- Track managed ownership via sidecar metadata file (for example `.beep/managed-files.json`) containing generator version, target path, checksum, and source hash.
- `beep-sync check` should compare sidecar + regenerated content.

### 3.7 Packaging recommendation for this repo

Local repo evidence:
- Workspace globs currently include `tooling/*`, `packages/*`, and `apps/*` only.
- Hidden `.beep/` is not currently a workspace path.

Implication:
- Runtime code should live in `tooling/beep-sync`.
- `.beep/` should remain data/config only.

## 4. Decision Updates Applied

1. `.codex/` and `.mcp.json` are in committed managed-target scope.
2. AGENTS freshness workflow is mandatory (design-level), and managed generation covers every workspace package; hook wiring is deferred in this branch.
3. JetBrains scope expands to project rules + MCP + prompt-library in v1; indexing artifacts remain tool-specific extensions.
4. Ownership model defaults to full-file rewrite.
5. JSON managed markers use sidecar metadata.
6. Packaging is `tooling/beep-sync` runtime + `.beep/` canonical data.
7. Required secrets fail hard when unresolved.
8. 1Password auth policy is hybrid: desktop local + service-account automation.

## 5. Confidence Notes

- High confidence: AGENTS layering guidance, MCP env-support patterns, JSON marker constraints.
- High confidence: packaging recommendation from current monorepo layout.
- Medium confidence: exact Cursor MCP field set from static extraction (dynamic docs).
- Medium confidence: JetBrains prompt-library file format portability.

## 6. Sources

### Standards and vendor docs
- AGENTS spec: https://agents.md/
- OpenAI Codex AGENTS guide: https://developers.openai.com/codex/guides/agents-md/
- OpenAI Codex MCP: https://developers.openai.com/codex/mcp/
- Anthropic Claude MCP: https://docs.anthropic.com/en/docs/claude-code/mcp
- Windsurf MCP docs: https://docs.windsurf.com/plugins/cascade/mcp
- JetBrains project rules: https://www.jetbrains.com/help/ai-assistant/configure-project-rules.html
- JetBrains MCP: https://www.jetbrains.com/help/ai-assistant/mcp.html
- JetBrains MCP settings reference: https://www.jetbrains.com/help/ai-assistant/settings-reference-mcp.html
- JetBrains prompt library: https://www.jetbrains.com/help/ai-assistant/prompt-library.html
- JetBrains AI restrictions (`.aiignore`, `.noai`): https://www.jetbrains.com/help/ai-assistant/disable-ai-assistant.html
- JSON specification (RFC 8259): https://www.rfc-editor.org/rfc/rfc8259

### Secret management
- 1Password CLI reference: https://developer.1password.com/docs/cli/reference/
- 1Password CLI secret reference syntax: https://developer.1password.com/docs/cli/secret-reference-syntax/
- 1Password CLI `op run`: https://developer.1password.com/docs/cli/reference/commands/run/
- 1Password CLI `op inject`: https://developer.1password.com/docs/cli/reference/commands/inject/
- 1Password SDK docs: https://developer.1password.com/docs/sdks/

### Prior-art tooling
- Rulesync README (overwrite protection): https://github.com/jpcaparas/rulesync
- Ruler README (merge/overwrite/backups/managed blocks): https://github.com/intellectronica/ruler

### Local repo references
- Workspace globs: `package.json`
- Existing `@1password/sdk` dependency: `package.json`
