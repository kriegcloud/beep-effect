# Summary
- The CLI entrypoint (`src/index.ts:171`) wires `commander`, `@clack/prompts`, and spinner-based helpers into a single `npx add-mcp` flow that parses the target source, runs smart agent detection or prompts for selection, enforces transport/scope validation, and ultimately calls `installServer` with a confirmation summary (`src/index.ts:274`).
- `agents` (`src/agents.ts:202`) enumerates every supported client with global/project paths, detection heuristics, supported transports, and optional `transformConfig` hooks, making the per-client metadata-driven and easy to extend.
- Installer helpers (`src/installer.ts:50`) build remote/local MCP configs per the parsed source, update `.gitignore` entries when requested (`src/installer.ts:84`), and describe agent-by-agent outcomes so callers can see which files changed.

# Key Patterns to Reuse
- **MCP config modeling & transforms:** the `agents` registry (`src/agents.ts:202`) keeps `configKey`, `format`, detection paths, and `transformConfig` logic together, so adding a new agent only requires metadata and a transform helper (e.g., `transformGooseConfig`/`transformZedConfig` around `src/agents.ts:50`).
- **Source parsing & naming:** `parseSource` classifies URLs, commands, and package names to set transport headers, inferred server names, and shell/stdio defaults, which keeps user input handling centralized (`src/source-parser.ts:3`).
- **Target file mapping & routing:** `installServerForAgent` consults `agentRouting` to choose between global/local paths (`src/installer.ts:147`), and `installServer` iterates agents sequentially so each config file gets written with `buildConfigWithKey`, keeping each target file responsibility isolated.
- **Merge/overwrite semantics:** every format writer deep-merges new servers into existing content (JSON uses `deepMerge` + `jsonc.modify` to reuse indentation `src/formats/json.ts:45`, while YAML/TOML writers rewrite the merged object `src/formats/yaml.ts:18`, `src/formats/toml.ts:18`) with the shared helper `deepMerge`/`getNestedValue` (`src/formats/utils.ts:3`).
- **Validation & CLI UX:** argument parsing guards against invalid agent aliases (`src/index.ts:375`), header tokens (`src/index.ts:321`), and unsupported transports (`src/index.ts:516`), while smart detection/prompting, summary notes, and confirmation moves keep the user in control of scope (`src/index.ts:400`, `src/index.ts:665`).
- **Safety & visibility:** `installServerForAgent` wraps writes in a `try/catch` and reports per-agent success/failure, so partial failures are surfaced immediately (`src/installer.ts:169`), and the `list-agents` command documents supported targets (`src/index.ts:214`).
- **Experience helpers:** storing last-selected agents in the lock file (`src/mcp-lock.ts:1`) and automatically appending new project configs to `.gitignore` (`src/installer.ts:84`) reduce friction for repeat runs.

# Risks/Anti-patterns
- The installer writes each agent’s config sequentially without a transactional rollback, so partial failures leave some files changed while others remain untouched (`src/installer.ts:169`).
- YAML/TOML writers always rewrite the merged object, discarding comments or custom formatting, which could surprise users who manage those config files by hand (`src/formats/yaml.ts:18`, `src/formats/toml.ts:18`).
- `deepMerge` only recurses plain objects, so array-valued sections (or repeated server names) get overwritten outright; the current flow simply replaces the server entry at the `configKey`, which may not preserve adjacent user data (`src/formats/utils.ts:3`).
- Custom headers (including secrets) are injected verbatim into every agent’s config when `--header` is used, and those values live in plaintext in project/global files thereafter (`src/index.ts:321`).

# Concrete Recommendations for beep-sync
- Mirror the `agents` metadata table (`src/agents.ts:202`) inside beep-sync to centralize file paths, detection heuristics, transport support, and optional transform hooks so new clients can be added by updating a single registry.
- Reuse the source-parsing + inferred-name helpers (`src/source-parser.ts:3`) to normalize MCP server definitions coming from URLs, commands, or packages before translating them into internal config objects.
- Adopt the deep-merge + format-specific writer pattern (`src/formats/json.ts:45`, `src/formats/utils.ts:3`) so beep-sync can graft new entries into JSON/TOML/YAML configs without clobbering existing structures or indentation preferences.
- Keep a routing map like `agentRouting` (`src/installer.ts:147`) and the transport validation/confirmation flow (`src/index.ts:516`, `src/index.ts:665`) so beep-sync can decide between project/global targets, enforce supported transports, and keep the user informed before touching files.
- Persist “last selected targets” (à la `src/mcp-lock.ts:1`) and offer automated `.gitignore` updates (`src/installer.ts:84`) to smooth repeated runs once beep-sync has created local artifacts.
