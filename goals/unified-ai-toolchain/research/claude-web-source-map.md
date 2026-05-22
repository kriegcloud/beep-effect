# AI coding agent config schemas: a drift-detection source map

The five target agents fall into **two architectural camps** with very different drift-detection strategies. **Codex is the only one with a Tier-1 JSON Schema** (`codex-rs/core/config.schema.json`, regenerated from Rust on every release). **Claude Code, Grok Build, JetBrains AI Assistant, and Junie are all closed-source**, requiring a mix of community SchemaStore mirrors, Mintlify CDN hashes, npm-package introspection, and OSS-adapter mining (ruler, rulesync, vercel-labs/skills). The cross-vendor primitives — **MCP (2025-11-25)** and **ACP (v0.13.1)** — are the only universally Tier-1 contracts, and both follow the `@beep/acp` codegen pattern you already use.

The single most important finding for your adapter: **AGENTS.md is the cross-vendor lingua franca**. Codex, Junie, and Grok Build all read it natively; Grok Build additionally reads Claude Code's `.claude/` tree zero-config; JetBrains AI Assistant is the lone exception with its proprietary `.aiassistant/rules/*.md`. This means your unified adapter can treat AGENTS.md + Anthropic Skills + MCP as the canonical core and only emit agent-specific writes for the divergent surfaces (Claude's `.claude-plugin/`, Codex's `[mcp_servers.*]` TOML tables, Junie's `.junie/mcp/mcp.json`, JetBrains AI's IDE-settings-only MCP).

---

## Part 1: Per-domain matrix

Columns: **CC** = Claude Code · **CX** = Codex · **GB** = Grok Build · **JBA** = JetBrains AI Assistant · **JN** = Junie · **+Spec** = cross-vendor primitive

### Domain 1 — Skills

| Agent | File / location | Format | Required fields | Notes vs siblings |
|---|---|---|---|---|
| **CC** | `~/.claude/skills/<n>/SKILL.md`, `.claude/skills/<n>/SKILL.md`, plugin `skills/<n>/SKILL.md` | YAML frontmatter + MD | none strictly; `description` strongly recommended | **Superset** of agentskills.io: adds `disable-model-invocation`, `context: fork`, `user-invocable`, `paths`, `allowed-tools`, `model`, `effort`, `agent`, `hooks` |
| **CX** | `.agents/skills/<n>/`, `~/.agents/skills/`, `/etc/codex/skills/`, system-bundled | YAML frontmatter + MD + optional `agents/openai.yaml` | `name`, `description` | Plus optional `agents/openai.yaml` with `interface.*`, `policy.allow_implicit_invocation`, `dependencies.tools[]`. Override via `[[skills.config]] path=…, enabled=…` in `config.toml` |
| **GB** | `.grok/skills/`, `~/.grok/skills/`, `~/.claude/skills/`, `~/.agents/skills/`, plugin-bundled | YAML frontmatter + MD (Claude-compatible by design) | inherits Anthropic Skills | Six discovery roots (most of any agent). User-invocable skills auto-register as `/<skill-name>` slash commands |
| **JBA** | **N/A — Skills not a concept** | — | — | Confirmed absent from AI Assistant docs TOC |
| **JN** | `.junie/skills/<n>/SKILL.md` (project), `~/.junie/skills/<n>/SKILL.md` (user) | YAML frontmatter + MD | `name`, `description` | Discoverable via `skill-locations` in `~/.junie/config.json`. Added March 2026 (IDE plugin 2xx.620.xx+) |
| **+Spec** | agentskills.io (open standard) + Anthropic's `anthropics/skills` reference impl | YAML frontmatter + MD | `name` ≤64 chars `[a-z0-9-]`, `description` 1–1024 chars | Optional: `license`, `compatibility`, `metadata`, `allowed-tools` (experimental). No JSON Schema published — only `skills-ref validate` CLI |

### Domain 2 — Rules / Instructions / Memory

| Agent | File / location | Format | Required fields | Notes vs siblings |
|---|---|---|---|---|
| **CC** | `CLAUDE.md`, `CLAUDE.local.md`, `.claude/CLAUDE.md`, `~/.claude/CLAUDE.md`, `.claude/rules/*.md` | Markdown + optional YAML frontmatter (`paths:` for path-scoped) | none | **Does NOT read AGENTS.md** natively. Imports via `@path/to/file` (5-hop max). HTML comments stripped. Managed paths per OS |
| **CX** | `~/.codex/AGENTS.md` (+ `.override.md`), then root-to-CWD chain | Plain Markdown (no frontmatter) | none | Knobs in `config.toml`: `project_doc_fallback_filenames`, `project_doc_max_bytes` (32 KiB default), `project_root_markers`. Concatenates root→CWD with blank lines |
| **GB** | `AGENTS.md`/`Agents.md`/`AGENT.md` + `CLAUDE.md`/`Claude.md`/`CLAUDE.local.md` + `.claude/rules/` (all walked, all read) | Markdown | none | **No `GROK.md` convention** in official Grok Build (community grok-cli forks use `.grok/GROK.md`) |
| **JBA** | `.aiassistant/rules/<n>.md` | Markdown (rule-type metadata stored in IDE settings, NOT in file) | none | Rule types: `Always`, `Manually`, `By model decision`, `By file patterns`, `Off`. **Does not use `.ai/guidelines.md`** (common misconception) |
| **JN** | `.junie/AGENTS.md` (preferred) → root `AGENTS.md` → legacy `.junie/guidelines.md` / `.junie/guidelines/` | Markdown (open AGENTS.md spec) | none | Lookup configurable via Settings → Tools → Junie → Project Settings |
| **+Spec** | agents.md (Linux Foundation / AAIF) | Markdown, free-form | none | Convention-only; no JSON Schema. 60k+ adopting repos via GitHub code search |

### Domain 3 — Commands (custom slash commands)

| Agent | File / location | Format | Required fields | Notes vs siblings |
|---|---|---|---|---|
| **CC** | `.claude/commands/*.md`, `~/.claude/commands/*.md`, plugin `commands/*.md` | Markdown + YAML frontmatter | none | **Being merged into Skills**: skill named `foo` + command file `foo.md` produce same `/foo`; skill wins. Optional fields: `description`, `allowed-tools`, `argument-hint`, `model`, `disable-model-invocation`, `context: fork`. `$ARGUMENTS`/`$N` substitution, `` !`cmd` `` bash injection, `@file` mentions |
| **CX** | **N/A — built-ins only** | — | — | 30+ built-in slash commands (`/model`, `/permissions`, `/plan`, `/compact`, `/mcp`, `/hooks`, `/plugins`, `/skills`, etc.). User extensibility = Skills (invoked via `$name`) or Plugins, NOT markdown command files |
| **GB** | Auto-registered from user-invocable Skills + `~/.agents/commands/` | Markdown (Skills convention) | none documented | Built-in set documented at docs.x.ai/build/modes-and-commands (`/quit /home /new /load /share /context /model /always-approve /multiline /compact /theme /plan /hooks /plugins /mcps /imagine /imagine-video /skills /hooks-trust`). Provided by `xai-grok-shell` component |
| **JBA** | **IDE-local Prompt Library** (no committed file) | Stored in IDE settings | none | `$SELECTION` variable. Prompts do NOT travel with the repo |
| **JN** | `.junie/commands/*.md` (CLI; `command-locations` configurable) | Markdown + YAML frontmatter | `name` (filename) | YAML defines name/description/arg template. CLI invocation via `/<name>` |
| **+Spec** | None | — | — | — |

### Domain 4 — Hooks (lifecycle)

| Agent | Locations | Format | Event count | Notes vs siblings |
|---|---|---|---|---|
| **CC** | `settings.json` `hooks` key (managed/user/project/local), plugin `hooks/hooks.json`, skill/agent frontmatter `hooks:` | JSON | **29 events** (most granular of any agent) | Events include `SessionStart`, `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`, `SubagentStart/Stop`, `TaskCreated/Completed`, `PreCompact/PostCompact`, `WorktreeCreate/Remove`, `FileChanged`, `Elicitation*`, `InstructionsLoaded`, `ConfigChange`, `CwdChanged`, etc. **5 handler types**: `command`, `http`, `mcp_tool`, `prompt`, `agent`. Exit codes: `0`=ok, `2`=block, **any other** including 1=non-blocking |
| **CX** | `~/.codex/hooks.json`, `<repo>/.codex/hooks.json` (multiple files merged); feature-gated `[features].codex_hooks` | JSON | **5 events** (`SessionStart`, `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`) | **Experimental**; Linux/macOS only. `PreToolUse`/`PostToolUse` emit only for `Bash` tool today. Exit code 2 = block. Schemas at `codex-rs/hooks/schema/generated/*.json` ⭐ |
| **GB** | `~/.grok/hooks/`, `<repo>/.grok/hooks/` (requires `/hooks-trust` for project), plugin-bundled | Format **NOT publicly documented** | unknown | Three discovery roots confirmed; event names + payload schema undocumented as of May 2026. Likely Codex-compatible by analogy. Flag as `unknown_schema` |
| **JBA** | **N/A — no hooks** | — | — | Confirmed absent from docs |
| **JN** | **N/A — no hooks** | — | — | Confirmed absent from docs |
| **+Spec** | None (rulesync's `hooks.json` is its own normalization, not a spec) | — | — | — |

### Domain 5 — Plugins

| Agent | Manifest file | Format | Required fields | Notes vs siblings |
|---|---|---|---|---|
| **CC** | `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json` | JSON | `name` only | Components at plugin ROOT (not inside `.claude-plugin/`). `userConfig` sub-schema. Marketplace plugin sources: `github`, `git`, `directory`, `hostPattern`, `pathPattern`, `settings`, `url`, `npm`, `file`. **Tier-1 SchemaStore**: `json.schemastore.org/claude-code-plugin-manifest.json` + `…-marketplace.json` |
| **CX** | `.codex-plugin/plugin.json` + `marketplace.json` | JSON | `name` (kebab-case), `version` | Manifest fields: `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `skills`, `mcpServers`, `apps`, `interface.{displayName,shortDescription,category,capabilities,brandColor,composerIcon,logo,screenshots,defaultPrompt}`. Marketplace files at `<repo>/.agents/plugins/marketplace.json` or `~/.agents/plugins/marketplace.json`. Cache: `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/` |
| **GB** | Manifest **format NOT publicly documented** | unknown | unknown | Discovery roots confirmed: `./.grok/plugins/`, `~/.grok/plugins/`, `~/.grok/plugins/marketplaces/`, `[plugins].paths` in config.toml, `--plugin-dir` flag. Plugins bundle skills/agents/hooks/MCP/LSP. Marketing screenshots show `name vX.Y.Z (community) [preview]` |
| **JBA** | **N/A — closed extension model** | — | — | One optional companion plugin "AI Assistant Experimental Features" gates EAP features |
| **JN** | **N/A — closed plugin** | — | — | Junie IDE plugin is closed-source |
| **+Spec** | None | — | — | — |

### Domain 6 — MCP servers

| Agent | Config location | Format | Server schema | Notes vs siblings |
|---|---|---|---|---|
| **CC** | Project `.mcp.json` (committed); user `~/.claude.json` `projects[*].mcpServers`; plugin `.mcp.json`; managed `managed-mcp.json` | JSON | stdio: `{type, command, args, env, cwd}`; http: `{type:"http"\|"streamable-http", url, headers, headersHelper, oauth{clientId, callbackPort, authServerMetadataUrl, scopes}, alwaysLoad}`; sse (deprecated); ws | `${VAR}`/`${VAR:-default}` expansion. Scope precedence: local > project > user > plugin > connectors. Managed allowlist/denylist. `MAX_MCP_OUTPUT_TOKENS` (default 25k) |
| **CX** | `~/.codex/config.toml` `[mcp_servers.<id>]`; `<repo>/.codex/config.toml` (trusted only) | TOML tables | stdio: `command`, `args`, `env`, `env_vars`, `cwd`; http: `url`, `bearer_token_env_var`, `http_headers`, `env_http_headers`, `oauth_resource`, `scopes`. Common: `enabled`, `required`, `enabled_tools`, `disabled_tools`, `startup_timeout_sec`, `tool_timeout_sec` | Top-level: `mcp_oauth_callback_port`, `mcp_oauth_callback_url`, `mcp_oauth_credentials_store`. Admin allowlist in `requirements.toml` `[mcp_servers.<id>.identity]` |
| **GB** | **Reads Claude Code's `.mcp.json` natively zero-config**; Grok-native shape undocumented (likely `[mcp_servers.*]` TOML in `~/.grok/config.toml` by Codex analogy) | JSON (Claude-compat) + presumed TOML | inherits Claude/Codex | `/mcps` TUI status modal, `grok mcp` subcommand. ACP `session/new` JSON-RPC params include `mcpServers: []` array |
| **JBA** | **IDE settings only** (Settings → Tools → AI Assistant → MCP); no committed file path documented | JSON pasted into dialog | `{mcpServers:{<name>:{command, args, env, workingDirectory}}}` (Claude Desktop-compatible) | Supports SSE + import from Claude config. **Unique asymmetry**: no `.aiassistant/mcp.json` exists |
| **JN** | `.junie/mcp/mcp.json` (project, committable!); `~/.junie/mcp/mcp.json` (user) | JSON | `{mcpServers:{<name>:{command, args, env}}}` for stdio; `{url, headers}` for remote | **Advantage over JBA**: project-committable file. CLI has OAuth Installation Assistant. Tool cap: 100 across all servers. IDE plugin doesn't yet support secrets — use `--env-file ~/.env.mcp` |
| **+Spec** | modelcontextprotocol.io spec | JSON-RPC 2.0 wire format | per-spec-version schema.json + schema.ts | Latest: **2025-11-25** (Nov 25 2025). Prior: 2025-06-18, 2025-03-26, 2024-11-05. npm SDK: `@modelcontextprotocol/sdk@1.29.0` |

---

## Part 2: Per-tool appendix

### 2.1 Claude Code (Anthropic) — closed-source CLI; v2.1.143

| Domain | Canonical URL | Tier | Drift mechanism | Public |
|---|---|---|---|---|
| Index (llms.txt) | `https://code.claude.com/docs/llms.txt` | 2 | content-hash + line-set diff | ✅ |
| Settings JSON Schema | `https://json.schemastore.org/claude-code-settings.json` | **1** | content-hash + version-pin | ✅ |
| Plugin manifest JSON Schema | `https://json.schemastore.org/claude-code-plugin-manifest.json` | **1** | content-hash | ✅ |
| Marketplace JSON Schema | `https://json.schemastore.org/claude-code-marketplace.json` | **1** | content-hash | ✅ |
| Hooks reference | `https://code.claude.com/docs/en/hooks` (+ `.md`) | 2 | semantic-field-diff on event table | ✅ |
| Skills reference | `https://code.claude.com/docs/en/skills` (+ `.md`) | 2 | semantic-field-diff | ✅ |
| Plugins reference | `https://code.claude.com/docs/en/plugins-reference` (+ `.md`) | 2 | semantic-field-diff | ✅ |
| MCP reference | `https://code.claude.com/docs/en/mcp` (+ `.md`) | 2 | semantic-field-diff | ✅ |
| Memory/Rules | `https://code.claude.com/docs/en/memory` (+ `.md`) | 2 | content-hash | ✅ |
| Sub-agents | `https://code.claude.com/docs/en/sub-agents` (+ `.md`) | 2 | semantic-field-diff | ✅ |
| Slash command frontmatter (canonical) | `https://raw.githubusercontent.com/anthropics/claude-code/main/plugins/plugin-dev/skills/command-development/references/frontmatter-reference.md` | **3** | git SHA + content-hash | ✅ |
| Changelog | `https://code.claude.com/docs/en/changelog` (+ `.md`) | 2 | append-only diff | ✅ |
| npm package | `https://registry.npmjs.org/@anthropic-ai/claude-code/latest` | 4 | npm version-pin | ✅ |
| GitHub repo (issues + examples) | `https://github.com/anthropics/claude-code` | 3 | releases.atom (note: project does NOT use GitHub Releases for CLI binaries) | ✅ |
| Mintlify CDN deploy hash | embedded in any doc page (`mintcdn.com/claude-code/<HASH>/...`) | 2 | regex-extract hash from HTML | ✅ |

**Last-known version (May 17, 2026):** `@anthropic-ai/claude-code@2.1.143` (published ~May 16, 2026; weekly downloads ~8.4M).

**Fallback sources:** `github.com/hesreallyhim/claude-code-json-schema` (community schemas now contributed to SchemaStore); `github.com/Exhen/claude-code-2.1.88` (cli.js.map-extracted source, legally murky); `gist.github.com/xdannyrobertsx/0a395c59b1ef09508e52522289bd5bf6` (early settings gist). Binary release manifests + GPG signatures at `https://downloads.claude.ai/claude-code-releases/<VERSION>/manifest.json[.sig]`.

### 2.2 Codex (OpenAI) — open-source Rust workspace; rust-v0.131.0-alpha.22 / rust-v0.130.0 stable

| Domain | Canonical URL | Tier | Drift mechanism | Public |
|---|---|---|---|---|
| **config.toml JSON Schema (in-repo, pinned)** | `https://raw.githubusercontent.com/openai/codex/<TAG>/codex-rs/core/config.schema.json` | **1** | version-pin (GitHub release tag) | ✅ |
| config.toml JSON Schema (hosted) | `https://developers.openai.com/codex/config-schema.json` | **1** | content-hash (always-latest) | ✅ |
| Hooks generated schemas | `https://github.com/openai/codex/tree/main/codex-rs/hooks/schema/generated` | **1** | version-pin + per-file hash | ✅ |
| App-server protocol TS | `codex-rs/app-server-protocol/schema/typescript/` | **1** | version-pin | ✅ |
| Config reference | `https://developers.openai.com/codex/config-reference` | 2 | semantic-field-diff | ✅ |
| AGENTS.md guide | `https://developers.openai.com/codex/guides/agents-md` | 2 | content-hash | ✅ |
| MCP docs | `https://developers.openai.com/codex/mcp` | 2 | semantic-field-diff | ✅ |
| Hooks docs | `https://developers.openai.com/codex/hooks` | 2 | semantic-field-diff | ✅ |
| Skills docs | `https://developers.openai.com/codex/skills` | 2 | semantic-field-diff | ✅ |
| Plugins docs | `https://developers.openai.com/codex/plugins` (+ `/build`) | 2 | semantic-field-diff | ✅ |
| Rules (Starlark `.rules`) | `https://developers.openai.com/codex/rules` + `codex-rs/execpolicy/` | 2+3 | code SHA of execpolicy crate | ✅ |
| Enterprise `requirements.toml` | `https://developers.openai.com/codex/enterprise/managed-configuration` | 2 | content-hash | ✅ |
| Releases (stable) | `https://api.github.com/repos/openai/codex/releases/latest` | **1** | API poll | ✅ |
| Releases atom | `https://github.com/openai/codex/releases.atom` | **1** | RSS poll | ✅ |
| npm CLI wrapper | `https://www.npmjs.com/package/@openai/codex` | 2 | version mirror | ✅ |
| npm TS SDK | `https://www.npmjs.com/package/@openai/codex-sdk` (v0.130.0) | 2 | version-pin | ✅ |
| Codex's own AGENTS.md (meta example) | `https://github.com/openai/codex/blob/main/AGENTS.md` | 3 | git SHA | ✅ |

**Last-known version (May 17, 2026):** `rust-v0.131.0-alpha.22` (prerelease, May 15 2026) / `rust-v0.130.0` (stable). Tags published multiple times daily. **No crates.io publication by OpenAI** — pin via GitHub release tags only.

**Fallback sources:** DeepWiki (`deepwiki.com/openai/codex`) for navigation; community blogs (`codex.danielvaughan.com`); rulesync's `src/features/*/codexcli-*.ts` adapters; ruler's `src/agents/CodexCliAgent.ts`.

### 2.3 Grok Build (xAI) — closed-source CLI; v0.1.x beta (May 14, 2026)

| Domain | Canonical URL | Tier | Drift mechanism | Public |
|---|---|---|---|---|
| Overview docs | `https://docs.x.ai/build/overview.md` | 2 | content-hash on `.md` mirror | ✅ |
| Skills/plugins/marketplaces docs | `https://docs.x.ai/build/features/skills-plugins-marketplaces.md` | 2 | semantic-field-diff | ✅ |
| Modes & commands docs | `https://docs.x.ai/build/modes-and-commands.md` | 2 | semantic-field-diff | ✅ |
| Headless scripting docs | `https://docs.x.ai/build/cli/headless-scripting.md` | 2 | content-hash | ✅ |
| Installer script | `https://x.ai/cli/install.sh` | 2 | content-hash + keyword watchlist | ✅ |
| Version pointer (stable) | `https://x.ai/cli/stable` | 2 | plaintext diff | ✅ |
| Version pointer (alpha) | `https://x.ai/cli/alpha` | 2 | plaintext diff | ✅ |
| Marketing | `https://x.ai/cli`, `https://x.ai/news/grok-build-cli` | 3 | content-hash | ✅ |
| GCS artifacts fallback | `https://storage.googleapis.com/grok-build-public-artifacts/cli/stable` | 2 | plaintext diff | ✅ |

**Last-known version (May 17, 2026):** Beta launched May 14, 2026. Docs last updated May 14, 2026. SuperGrok Heavy subscribers only ($300/mo). No public changelog page exists; no GitHub repo; no npm package (anything matching "grok cli" on npm is community-built and uses different config — see disambiguation note below).

**⚠️ Critical disambiguation:** The task brief's hint `~/.grok/user-settings.json` is the **community** `superagent-ai/grok-cli` or `@vibe-kit/grok-cli` schema, NOT official Grok Build. Official Grok Build uses **`~/.grok/config.toml`** (TOML). They share `~/.grok/` directory — a real footgun. Detect via file presence + format sniff.

**Fallback sources:** **None of the major OSS adapters (ruler v0.3.32, rulesync v8.2.0) yet have a Grok Build target.** Rely on AGENTS.md + Claude-compatibility instead — Grok Build reads `~/.claude/`, `~/.agents/`, `AGENTS.md`, `.claude/rules/` natively zero-config. Use `grok inspect` for runtime introspection. Mark hook event schemas, plugin manifest schema, and Grok-native MCP shape as `unknown_schema` in your adapter.

### 2.4 JetBrains AI Assistant — closed-source plugin; marketplace ID 22282

| Domain | Canonical URL | Tier | Drift mechanism | Public |
|---|---|---|---|---|
| Marketplace listing | `https://plugins.jetbrains.com/plugin/22282-jetbrains-ai-assistant` | 2 | HTML hash | ✅ |
| Version API | `https://plugins.jetbrains.com/api/plugins/22282/updates` | 2 | version-pin (poll daily) | ✅ |
| Stable versions HTML | `https://plugins.jetbrains.com/plugin/22282-jetbrains-ai-assistant/versions/stable` | 2 | pagination diff | ✅ |
| Configure project rules | `https://www.jetbrains.com/help/ai-assistant/configure-project-rules.html` | 2 | content-hash | ✅ |
| Settings reference (rules) | `https://www.jetbrains.com/help/ai-assistant/settings-reference-rules.html` | 2 | semantic-field-diff | ✅ |
| Prompt Library | `https://www.jetbrains.com/help/ai-assistant/prompt-library.html` | 2 | content-hash | ✅ |
| MCP config | `https://www.jetbrains.com/help/ai-assistant/mcp.html` + `configure-an-mcp-server.html` | 2 | semantic-field-diff | ✅ |
| ACP custom agents | `https://www.jetbrains.com/help/ai-assistant/acp.html` | 2 | content-hash | ✅ |
| Disable / ignore | `https://www.jetbrains.com/help/ai-assistant/disable-ai-assistant.html` | 2 | content-hash | ✅ |
| Issues tracker | `https://youtrack.jetbrains.com/` (project key not public on listing) | 2 | RSS via YouTrack query | ✅ |
| Plugin JAR download | `https://plugins.jetbrains.com/plugin/download?pluginId=<xmlId>&version=<v>` | 4 | introspect META-INF/plugin.xml | ✅ |

**Last-known version (May 17, 2026):** Not directly retrievable via the marketplace HTML (no version meta tag); resolvable only at runtime via `/api/plugins/22282/updates`. Compatible with IntelliJ 2026.1 (build 836+).

**Fallback sources:** `intellectronica/ruler` v0.3.32 has a `jetbrains-ai` agent (see `src/agents/JetbrainsAiAgent.ts`); **rulesync does NOT yet** (open issue #744). Third-party integration guides on bito.com and shadcn.io document the in-IDE MCP JSON dialog format. Plugin JAR introspection via marketplace download is the deepest fallback. **Key debunking: `.ai/guidelines.md` is NOT used by AI Assistant — the actual path is `.aiassistant/rules/<n>.md`.**

### 2.5 Junie (JetBrains) — closed-source plugin + CLI; marketplace ID 26104

| Domain | Canonical URL | Tier | Drift mechanism | Public |
|---|---|---|---|---|
| Docs root | `https://junie.jetbrains.com/docs/` | 2 | TOC diff | ✅ |
| IDE plugin docs | `https://junie.jetbrains.com/docs/junie-ide-plugin.html` | 2 | content-hash (page footer has last-modified) | ✅ |
| Customize guidelines | `https://www.jetbrains.com/help/junie/customize-guidelines.html` | 2 | content-hash | ✅ |
| Agent Skills | `https://junie.jetbrains.com/docs/agent-skills.html` | 2 | semantic-field-diff | ✅ |
| Custom slash commands | `https://junie.jetbrains.com/docs/custom-slash-commands.html` | 2 | content-hash | ✅ |
| Subagents (CLI) | `https://junie.jetbrains.com/docs/junie-cli-subagents.html` | 2 | semantic-field-diff | ✅ |
| MCP config (CLI) | `https://junie.jetbrains.com/docs/junie-cli-mcp-configuration.html` | 2 | semantic-field-diff | ✅ |
| CLI configuration | `https://junie.jetbrains.com/docs/junie-cli-configuration.html` | 2 | semantic-field-diff on `config.json` keys | ✅ |
| Marketplace listing | `https://plugins.jetbrains.com/plugin/26104-jetbrains-junie` | 2 | HTML hash | ✅ |
| Version API | `https://plugins.jetbrains.com/api/plugins/26104/updates` | 2 | version-pin (poll daily) | ✅ |
| Junie CLI landing repo | `https://github.com/JetBrains/junie` | 3 | git SHA | ✅ |
| Junie guidelines catalog | `https://github.com/JetBrains/junie-guidelines` | 3 | git SHA (high-value reference) | ✅ |
| Issues tracker | `https://youtrack.jetbrains.com/issues/JUNIE` (project key `JUNIE`) | 2 | YouTrack RSS query | ✅ |

**Last-known version (May 17, 2026):** IDE plugin family `2xx.620.xx` (March 2026 Agent Skills release). Docs last updated May 3, 2026 (IDE) / March 19, 2026 (CLI). Fleet plugin separate at marketplace ID 30252.

**Fallback sources:** `intellectronica/ruler` (`src/agents/JunieAgent.ts`), `dyoshikawa/rulesync` (Junie target writes `.junie/AGENTS.md` preferred, legacy `.junie/guidelines.md`), `jpcaparas/rulesync` (PHP), `JetBrains/junie-guidelines` catalog of technology-specific examples, real-world examples: `github.com/DragonBe/symbian-harmony/blob/master/.junie/guidelines.md`, `github.com/sivaprasadreddy/agent-skills-demo` for Skills examples.

### 2.6 Cross-vendor primitives

| Spec | Canonical URL | Schema URL | Tier | Latest (May 17, 2026) | Drift mechanism |
|---|---|---|---|---|---|
| **MCP** | `https://modelcontextprotocol.io/specification/2025-11-25` | `https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2025-11-25/schema.json` + `.ts` | **1** | spec **2025-11-25**; SDK `@modelcontextprotocol/sdk@1.29.0` | version-pin on dated revision; releases.atom |
| **ACP** | `https://agentclientprotocol.com/` | `https://raw.githubusercontent.com/agentclientprotocol/agent-client-protocol/v0.13.1/schema/schema.json` | **1** | spec **v0.13.1** (May 16 2026); SDK `@agentclientprotocol/sdk@0.21.1` | version-pin on git tag (release-plz cadence) |
| **AGENTS.md** | `https://agents.md/` | none (Markdown convention) | 2+3 | no semver; track `agentsmd/agents.md@main` SHA | content-hash + heading allow-list |
| **Agent Skills** | `https://agentskills.io/specification` | no JSON Schema; `skills-ref` validator at `github.com/agentskills/agentskills` | 2 | no tagged release; track `agentskills/agentskills@main` SHA | semantic-field-diff on frontmatter table |
| **Anthropic Skills** | `https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview` | `github.com/anthropics/skills` reference impl + `/spec` directory | 2+3 | docs not semver'd; track `anthropics/skills@main` SHA | template hash + field diff |

**Key relationships:**
- **Anthropic Skills ≡ Agent Skills**: Anthropic authored the format and donated to `agentskills/agentskills` (Dec 18, 2025). Build one Effect Schema, validate both surfaces.
- **MCP + Skills convergence**: `modelcontextprotocol/experimental-ext-skills` is exploring skill discovery as an MCP primitive — could collapse two primitives in late 2026.
- **ACP org migration**: `github.com/zed-industries/agent-client-protocol` redirects to `agentclientprotocol/agent-client-protocol`. The npm package `@zed-industries/agent-client-protocol` is renamed to `@agentclientprotocol/sdk`. Migrate `@beep/acp` if still on old name.

### 2.7 OSS unified-config tools (reference implementations)

| Tool | Repo | npm | Latest | License | Has adapter for… |
|---|---|---|---|---|---|
| **ruler** | `intellectronica/ruler` | `@intellectronica/ruler` | v0.3.32 (~May 15 2026) | MIT | 32 agents incl. claude, codex, junie, **jetbrains-ai**; ❌ no grok-build |
| **rulesync** | `dyoshikawa/rulesync` | `rulesync` | v8.2.0 | MIT | 20+ agents incl. claudecode, codexcli, junie; ❌ no jetbrains-ai (issue #744), ❌ no grok |
| **skills.sh** | `vercel-labs/skills` | `npx skills` | (rolling) | MIT | 51+ agent destinations for Skills only |
| **agent-skills** | `intellectronica/agent-skills` | — | parallel to anthropics/skills | — | reference skill examples |
| **anthropics/skills** | `anthropics/skills` | — | 17 OSS skills + spec | Apache-2.0 (mostly) | Anthropic's reference SKILL.md impl |

**Most valuable code paths for reverse-engineering closed-source agents:**

```
rulesync:
  src/features/rules/<tool>-rule.ts             ← per-tool rules schema
  src/features/skills/<tool>-skill.ts           ← per-tool SKILL.md extensions
  src/features/mcp/<tool>-mcp.ts                ← per-tool MCP shape (e.g., copilotcli mcp-config.json)
  src/features/subagents/<tool>-subagent.ts     ← subagent frontmatter
  src/features/commands/<tool>-command.ts       ← per-tool command format
  src/features/hooks/<tool>-hooks.ts            ← per-tool hooks normalization
  src/features/permissions/<tool>-permissions.ts ← per-tool permission emission

ruler:
  src/agents/<Name>Agent.ts                     ← per-agent file path + format
  src/agents/registry.ts                        ← central agent dispatcher
  src/agents/AgentsMdAgent.ts                   ← base class (Codex/OpenCode/Jules/Amp/Aider/Qwen inherit)
  src/config/loader.ts                          ← unified config loader (ruler.toml + rules + MCP + agents)

vercel-labs/skills:
  src/skills.ts                                 ← SKILL.md frontmatter parsing (discoverSkills 172-383)
  src/agents.ts                                 ← AGENT registry + detectInstalledAgents (235-279)
  src/installer.ts                              ← installSkillForAgent (248-401), getCanonicalPath (159-178)
  src/types.ts                                  ← Skill, RemoteSkill, ParsedSource, SkillLockEntry types
```

---

## Part 3: Machine-readable index

```yaml
# Pin format: version_pin uses semver tag (preferred), SHA (next), date (fallback)
# Drift mechanism: "version" | "hash" | "semantic_field_diff"

sources:
  # ===== Claude Code =====
  - agent: claude-code
    domain: settings
    url: https://json.schemastore.org/claude-code-settings.json
    tier: 1
    drift_mechanism: hash
    version_pin: null  # tracks SchemaStore HEAD
    public: true
    fallback_for_tier: null
  - agent: claude-code
    domain: plugins
    url: https://json.schemastore.org/claude-code-plugin-manifest.json
    tier: 1
    drift_mechanism: hash
    version_pin: null
    public: true
    fallback_for_tier: null
  - agent: claude-code
    domain: plugins
    url: https://json.schemastore.org/claude-code-marketplace.json
    tier: 1
    drift_mechanism: hash
    version_pin: null
    public: true
    fallback_for_tier: null
  - agent: claude-code
    domain: hooks
    url: https://code.claude.com/docs/en/hooks.md
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "@anthropic-ai/claude-code@2.1.143"
    public: true
    fallback_for_tier: null
  - agent: claude-code
    domain: skills
    url: https://code.claude.com/docs/en/skills.md
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "@anthropic-ai/claude-code@2.1.143"
    public: true
    fallback_for_tier: null
  - agent: claude-code
    domain: plugins
    url: https://code.claude.com/docs/en/plugins-reference.md
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "@anthropic-ai/claude-code@2.1.143"
    public: true
    fallback_for_tier: 1
  - agent: claude-code
    domain: mcp
    url: https://code.claude.com/docs/en/mcp.md
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "@anthropic-ai/claude-code@2.1.143"
    public: true
    fallback_for_tier: null
  - agent: claude-code
    domain: rules
    url: https://code.claude.com/docs/en/memory.md
    tier: 2
    drift_mechanism: hash
    version_pin: "@anthropic-ai/claude-code@2.1.143"
    public: true
    fallback_for_tier: null
  - agent: claude-code
    domain: commands
    url: https://raw.githubusercontent.com/anthropics/claude-code/main/plugins/plugin-dev/skills/command-development/references/frontmatter-reference.md
    tier: 3
    drift_mechanism: hash
    version_pin: "git-sha:main"
    public: true
    fallback_for_tier: null
  - agent: claude-code
    domain: index
    url: https://code.claude.com/docs/llms.txt
    tier: 2
    drift_mechanism: hash
    version_pin: null
    public: true
    fallback_for_tier: null
  - agent: claude-code
    domain: version
    url: https://registry.npmjs.org/@anthropic-ai/claude-code/latest
    tier: 4
    drift_mechanism: version
    version_pin: "2.1.143"
    public: true
    fallback_for_tier: null

  # ===== Codex =====
  - agent: codex
    domain: config
    url: https://raw.githubusercontent.com/openai/codex/rust-v0.130.0/codex-rs/core/config.schema.json
    tier: 1
    drift_mechanism: version
    version_pin: "rust-v0.130.0"
    public: true
    fallback_for_tier: null
  - agent: codex
    domain: config
    url: https://developers.openai.com/codex/config-schema.json
    tier: 1
    drift_mechanism: hash
    version_pin: null  # always-latest
    public: true
    fallback_for_tier: 1
  - agent: codex
    domain: hooks
    url: https://github.com/openai/codex/tree/main/codex-rs/hooks/schema/generated
    tier: 1
    drift_mechanism: version
    version_pin: "rust-v0.130.0"
    public: true
    fallback_for_tier: null
  - agent: codex
    domain: rules
    url: https://github.com/openai/codex/tree/main/codex-rs/execpolicy
    tier: 3
    drift_mechanism: version
    version_pin: "rust-v0.130.0"
    public: true
    fallback_for_tier: null
  - agent: codex
    domain: rules
    url: https://developers.openai.com/codex/guides/agents-md
    tier: 2
    drift_mechanism: hash
    version_pin: null
    public: true
    fallback_for_tier: null
  - agent: codex
    domain: mcp
    url: https://developers.openai.com/codex/mcp
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: null
    public: true
    fallback_for_tier: 1
  - agent: codex
    domain: skills
    url: https://developers.openai.com/codex/skills
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: null
    public: true
    fallback_for_tier: null
  - agent: codex
    domain: plugins
    url: https://developers.openai.com/codex/plugins
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: null
    public: true
    fallback_for_tier: null
  - agent: codex
    domain: version
    url: https://api.github.com/repos/openai/codex/releases/latest
    tier: 1
    drift_mechanism: version
    version_pin: "rust-v0.130.0"
    public: true
    fallback_for_tier: null
  - agent: codex
    domain: commands
    url: https://developers.openai.com/codex/cli/slash-commands
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: null
    public: true
    fallback_for_tier: null
    note: "Codex does not support user-defined commands; treat as closed enum"

  # ===== Grok Build =====
  - agent: grok-build
    domain: overview
    url: https://docs.x.ai/build/overview.md
    tier: 2
    drift_mechanism: hash
    version_pin: "2026-05-14"
    public: true
    fallback_for_tier: null
  - agent: grok-build
    domain: skills
    url: https://docs.x.ai/build/features/skills-plugins-marketplaces.md
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026-05-14"
    public: true
    fallback_for_tier: null
  - agent: grok-build
    domain: commands
    url: https://docs.x.ai/build/modes-and-commands.md
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026-05-14"
    public: true
    fallback_for_tier: null
  - agent: grok-build
    domain: headless
    url: https://docs.x.ai/build/cli/headless-scripting.md
    tier: 2
    drift_mechanism: hash
    version_pin: "2026-04-12"
    public: true
    fallback_for_tier: null
  - agent: grok-build
    domain: installer
    url: https://x.ai/cli/install.sh
    tier: 2
    drift_mechanism: hash
    version_pin: null
    public: true
    fallback_for_tier: null
    note: "Richest single artifact; reveals env vars, paths, channels, OIDC scope"
  - agent: grok-build
    domain: version
    url: https://x.ai/cli/stable
    tier: 2
    drift_mechanism: version
    version_pin: null
    public: true
    fallback_for_tier: null
  - agent: grok-build
    domain: hooks
    url: null
    tier: null
    drift_mechanism: null
    version_pin: null
    public: false
    fallback_for_tier: null
    note: "Event schemas UNDOCUMENTED as of May 2026; reverse-engineer via `grok inspect` or wait"
  - agent: grok-build
    domain: plugins
    url: null
    tier: null
    drift_mechanism: null
    version_pin: null
    public: false
    fallback_for_tier: null
    note: "Manifest schema UNDOCUMENTED"
  - agent: grok-build
    domain: mcp
    url: null
    tier: null
    drift_mechanism: null
    version_pin: null
    public: false
    fallback_for_tier: null
    note: "Reads Claude .mcp.json natively; Grok-native shape inferred TOML by Codex analogy"

  # ===== JetBrains AI Assistant =====
  - agent: jetbrains-ai-assistant
    domain: rules
    url: https://www.jetbrains.com/help/ai-assistant/configure-project-rules.html
    tier: 2
    drift_mechanism: hash
    version_pin: "2026.1"
    public: true
    fallback_for_tier: null
  - agent: jetbrains-ai-assistant
    domain: rules
    url: https://www.jetbrains.com/help/ai-assistant/settings-reference-rules.html
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026.1"
    public: true
    fallback_for_tier: null
  - agent: jetbrains-ai-assistant
    domain: commands
    url: https://www.jetbrains.com/help/ai-assistant/prompt-library.html
    tier: 2
    drift_mechanism: hash
    version_pin: "2026.1"
    public: true
    fallback_for_tier: null
  - agent: jetbrains-ai-assistant
    domain: mcp
    url: https://www.jetbrains.com/help/ai-assistant/mcp.html
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026.1"
    public: true
    fallback_for_tier: null
  - agent: jetbrains-ai-assistant
    domain: mcp
    url: https://www.jetbrains.com/help/ai-assistant/configure-an-mcp-server.html
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026.1"
    public: true
    fallback_for_tier: null
  - agent: jetbrains-ai-assistant
    domain: acp
    url: https://www.jetbrains.com/help/ai-assistant/acp.html
    tier: 2
    drift_mechanism: hash
    version_pin: "2026.1"
    public: true
    fallback_for_tier: null
  - agent: jetbrains-ai-assistant
    domain: version
    url: https://plugins.jetbrains.com/api/plugins/22282/updates
    tier: 2
    drift_mechanism: version
    version_pin: null  # resolve at runtime
    public: true
    fallback_for_tier: null
  - agent: jetbrains-ai-assistant
    domain: skills
    url: null
    tier: null
    drift_mechanism: null
    version_pin: null
    public: false
    fallback_for_tier: null
    note: "N/A - Skills not a concept for AI Assistant"
  - agent: jetbrains-ai-assistant
    domain: hooks
    url: null
    tier: null
    drift_mechanism: null
    version_pin: null
    public: false
    fallback_for_tier: null
    note: "N/A - no hooks system"

  # ===== Junie =====
  - agent: junie
    domain: rules
    url: https://junie.jetbrains.com/docs/junie-ide-plugin.html
    tier: 2
    drift_mechanism: hash
    version_pin: "2xx.620.xx"
    public: true
    fallback_for_tier: null
  - agent: junie
    domain: rules
    url: https://www.jetbrains.com/help/junie/customize-guidelines.html
    tier: 2
    drift_mechanism: hash
    version_pin: "2xx.620.xx"
    public: true
    fallback_for_tier: null
  - agent: junie
    domain: skills
    url: https://junie.jetbrains.com/docs/agent-skills.html
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2xx.620.xx"
    public: true
    fallback_for_tier: null
  - agent: junie
    domain: commands
    url: https://junie.jetbrains.com/docs/custom-slash-commands.html
    tier: 2
    drift_mechanism: hash
    version_pin: "2xx.620.xx"
    public: true
    fallback_for_tier: null
  - agent: junie
    domain: subagents
    url: https://junie.jetbrains.com/docs/junie-cli-subagents.html
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2xx.620.xx"
    public: true
    fallback_for_tier: null
  - agent: junie
    domain: mcp
    url: https://junie.jetbrains.com/docs/junie-cli-mcp-configuration.html
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2xx.620.xx"
    public: true
    fallback_for_tier: null
  - agent: junie
    domain: config
    url: https://junie.jetbrains.com/docs/junie-cli-configuration.html
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2xx.620.xx"
    public: true
    fallback_for_tier: null
  - agent: junie
    domain: examples
    url: https://github.com/JetBrains/junie-guidelines
    tier: 3
    drift_mechanism: hash
    version_pin: "git-sha:main"
    public: true
    fallback_for_tier: null
  - agent: junie
    domain: version
    url: https://plugins.jetbrains.com/api/plugins/26104/updates
    tier: 2
    drift_mechanism: version
    version_pin: null  # resolve at runtime
    public: true
    fallback_for_tier: null
  - agent: junie
    domain: hooks
    url: null
    tier: null
    drift_mechanism: null
    version_pin: null
    public: false
    fallback_for_tier: null
    note: "N/A - no hooks system"

  # ===== Cross-vendor primitives =====
  - agent: mcp
    domain: spec
    url: https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2025-11-25/schema.json
    tier: 1
    drift_mechanism: version
    version_pin: "2025-11-25"
    public: true
    fallback_for_tier: null
  - agent: mcp
    domain: spec
    url: https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2025-11-25/schema.ts
    tier: 1
    drift_mechanism: version
    version_pin: "2025-11-25"
    public: true
    fallback_for_tier: null
  - agent: mcp
    domain: sdk
    url: https://registry.npmjs.org/@modelcontextprotocol/sdk/latest
    tier: 1
    drift_mechanism: version
    version_pin: "1.29.0"
    public: true
    fallback_for_tier: null
  - agent: acp
    domain: spec
    url: https://raw.githubusercontent.com/agentclientprotocol/agent-client-protocol/v0.13.1/schema/schema.json
    tier: 1
    drift_mechanism: version
    version_pin: "v0.13.1"
    public: true
    fallback_for_tier: null
  - agent: acp
    domain: sdk
    url: https://registry.npmjs.org/@agentclientprotocol/sdk/latest
    tier: 1
    drift_mechanism: version
    version_pin: "0.21.1"
    public: true
    fallback_for_tier: null
  - agent: agents-md
    domain: spec
    url: https://agents.md/
    tier: 2
    drift_mechanism: hash
    version_pin: "git-sha:agentsmd/agents.md@main"
    public: true
    fallback_for_tier: null
  - agent: agents-md
    domain: spec
    url: https://github.com/agentsmd/agents.md
    tier: 3
    drift_mechanism: hash
    version_pin: "git-sha:main"
    public: true
    fallback_for_tier: null
  - agent: agent-skills
    domain: spec
    url: https://agentskills.io/specification
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "git-sha:agentskills/agentskills@main"
    public: true
    fallback_for_tier: null
  - agent: agent-skills
    domain: validator
    url: https://github.com/agentskills/agentskills/tree/main/skills-ref
    tier: 3
    drift_mechanism: hash
    version_pin: "git-sha:main"
    public: true
    fallback_for_tier: 1
  - agent: anthropic-skills
    domain: spec
    url: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: null
    public: true
    fallback_for_tier: null
  - agent: anthropic-skills
    domain: reference-impl
    url: https://github.com/anthropics/skills
    tier: 3
    drift_mechanism: hash
    version_pin: "git-sha:main"
    public: true
    fallback_for_tier: null

  # ===== OSS adapter sources (fallback for closed agents) =====
  - agent: ruler
    domain: adapter
    url: https://github.com/intellectronica/ruler
    tier: 3
    drift_mechanism: version
    version_pin: "v0.3.32"
    public: true
    fallback_for_tier: 4
    covers: [claude-code, codex, junie, jetbrains-ai-assistant]
  - agent: rulesync
    domain: adapter
    url: https://github.com/dyoshikawa/rulesync
    tier: 3
    drift_mechanism: version
    version_pin: "v8.2.0"
    public: true
    fallback_for_tier: 4
    covers: [claude-code, codex, junie]
  - agent: rulesync
    domain: config-schema
    url: https://github.com/dyoshikawa/rulesync/releases/latest/download/config-schema.json
    tier: 1
    drift_mechanism: version
    version_pin: "v8.2.0"
    public: true
    fallback_for_tier: null
  - agent: skills-sh
    domain: adapter
    url: https://github.com/vercel-labs/skills
    tier: 3
    drift_mechanism: version
    version_pin: null
    public: true
    fallback_for_tier: 4
    covers: [claude-code, codex, junie, "+51 agents"]
```

---

## Part 4: Drift detection architecture notes

### Layered tier strategy

**Tier 1 (machine-readable schemas) — version-pin + codegen.** Five sources qualify and these become your "release-tracked" core:
1. `openai/codex` config + hooks schemas (pin to `rust-vX.Y.Z` tag; cadence: daily alphas, weekly stable)
2. MCP spec schema.json (pin to dated revision `2025-11-25`; cadence: ~6 months between dated revisions)
3. ACP spec schema.json (pin to git tag `v0.13.1`; cadence: weekly-to-monthly via release-plz)
4. SchemaStore mirrors for Claude Code (3 schemas; cadence: lags ~1 release behind official)
5. rulesync's `config-schema.json` + `permissions-schema.json` + `mcp-schema.json` release assets (community canonical; covers the unified-config conceptual model)

Drive these through your existing `@beep/acp` pipeline: fetch raw schema → JSON Schema → Effect Schema AST → emit `src/agents/<agent>/Generated.ts` with `// @generated` banner. Use `fortanix/openapi-to-effect` as a reference implementation (it's the closest existing JSON-Schema → Effect Schema converter; expect to fork it). Note Effect Schema gotchas: `Schema.optional(s, { default })` mis-marks fields as required in emitted JSON Schema (issue #2068) — use `{ exact: true }`; there is no automatic JSON-Schema → Schema deserializer (issue #1825, marked out-of-scope).

**Tier 2 (HTML/Markdown docs) — content-hash + semantic-field-diff.** This is the dominant tier and applies to Claude Code's six domain pages, all of Junie's docs, all of Grok Build's docs, and JetBrains AI Assistant's help. The Claude Code docs site exposes `.md` variants of every page (`https://code.claude.com/docs/en/<page>.md`) — use these, not the rendered HTML. Likewise `docs.x.ai/build/*.md`. Build a small parser that extracts fenced code blocks + table-of-fields markers from each `.md` page and diffs only those AST nodes; cosmetic prose changes won't trigger drift alerts. Two top-level anchors for Claude Code specifically: poll `https://code.claude.com/docs/llms.txt` (lists every page) and watch the Mintlify CDN hash embedded in every doc page (`mintcdn.com/claude-code/<HASH>/...`) — when that hash changes, docs were redeployed.

**Tier 3 (OSS repo code) — version-pin + git-SHA hash.** Use for source-of-truth fallback when Tier 1/2 is sparse: `openai/codex` Rust source (when schema.json isn't sufficient), `anthropics/claude-code` examples + plugin-dev SKILL.md, `JetBrains/junie-guidelines`, and the unified-config tools themselves. Track via `releases.atom` feeds. For unstable repos (agents.md, agentskills, anthropics/skills — none have tagged releases), pin to git commit SHA on `main`.

**Tier 4 (reverse-engineered) — npm version + JAR introspection.** Used for last-resort fallback: `@anthropic-ai/claude-code` npm tarball (`cli.js.map` source maps yield ~1,906 TypeScript files); JetBrains plugin JARs downloadable from marketplace via `pluginManager?action=download&id=<xmlId>&build=<productCode>-<buildNumber>` (extract `META-INF/plugin.xml` for canonical `<id>` + extension points). Mark all Tier 4 sources `is_official=false` in metadata.

### Pre-commit hook design

Structure a two-mode CLI command `beep-agent-configs check`:

**`--check` (default, runs in pre-commit):** Fast path. Compares the user's local config files against pinned Effect Schemas only — does not contact the network. Exits 0 with warning text on mismatch; exits 0 cleanly on full match. Print actionable diffs using `ParseResult.TreeFormatter` (already part of Effect Schema). Runtime budget: <500ms for a typical repo.

**`--strict` (for CI):** Adds a network step that fetches each Tier-1 source's current `version_pin` via the upstream API (npm registry, GitHub Releases API, marketplace API) and compares against the YAML index above. If any upstream pin has moved, exits non-zero with a structured report listing affected schemas. Runtime budget: <10s with concurrency = 10 parallel requests.

**`--refresh` (out-of-band, triggered manually or by scheduled CI):** Runs the full codegen pipeline. Fetches every Tier-1 source, regenerates `src/agents/<agent>/Generated.ts`, opens an auto-PR with the diff. This is the cadence at which you incorporate upstream drift into your committed schemas. Recommend weekly schedule plus on-demand triggers from GitHub releases.atom webhooks on the five Tier-1 sources.

For each agent, your adapter package exposes three Effect Schemas: `Canonical*` (your internal unified shape), `Native*` (the per-agent on-disk shape), and `Native*FromCanonical` (the transformer). The pre-commit hook validates user files against `Native*`; the codegen pipeline keeps `Native*` schemas in sync with upstream. This is the same tri-interface pattern rulesync uses (`ToolRule`, `ToolSkill`, `ToolSubagent`) — but powered by Effect Schema's bidirectional transformations rather than rulesync's hand-written encoders.

### Recommended source-priority order per domain

For each domain in your Effect Schema, prefer sources in this order: (1) Tier-1 JSON Schema from official upstream, (2) Tier-1 SchemaStore community mirror, (3) Tier-2 official docs `.md` variant, (4) Tier-3 OSS unified-config tool's adapter source code, (5) Tier-4 npm package introspection. For closed agents lacking Tier 1–3 (Grok Build hooks/plugins/MCP; JetBrains AI Assistant skills/hooks), mark schemas as `unknown_schema` and accept arbitrary JSON until upstream documents them — do not invent placeholder schemas that will diverge from reality. Track these gaps as `TODO(drift)` markers in your codegen output so they surface in PR reviews.

### Final caveats

The single biggest risk to your adapter's stability is Grok Build's beta status — its TOML schema, hook event names, plugin manifest format, and Grok-native MCP shape are all undocumented as of May 17, 2026 and will likely shift before GA. The second-biggest risk is the **Claude Code Skills/Commands convergence**: Anthropic is actively merging `.claude/commands/*.md` into the Skills system, so any code that treats them as independent will break around v2.2. The MCP/Skills convergence in `modelcontextprotocol/experimental-ext-skills` could similarly collapse two of your primitives in late 2026. Design your domain abstraction to allow Skills, Commands, and even MCP-as-skill-discovery to share a common base type, with each agent's adapter mapping the abstraction onto its current native model.