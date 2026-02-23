# Unified AI Tooling Configuration System - Research

_Date: 2026-02-23_

## 1. Executive Summary
Configuration fragmentation across Claude Code, Codex, Cursor, Windsurf, and JetBrains AI is a real and active problem, and there is now a small but fast-moving ecosystem trying to solve it. The strongest existing tools are useful but partial: some unify instruction files, some unify MCP servers, and some validate configs, but none is a complete, vendor-neutral control plane for rules, commands, hooks, MCP, agents, and skills together. A de facto interoperability baseline is emerging around `AGENTS.md`, now stewarded under the Agentic AI Foundation, but this standard currently covers agent instructions rather than full structured tool configuration. Based on current evidence and your constraints, the recommended path is a project-local `.beep/` source-of-truth with deterministic generation into native tool files, generated files committed to git, no symlink dependence, and a Linux-first implementation.

## 2. Existing Solutions

### 2.1 Multi-tool config sync projects
GitHub star/activity snapshots below are from GitHub API on 2026-02-23.

| Project | What it does | Evidence | Honest assessment |
|---|---|---|---|
| [Ruler](https://github.com/intellectronica/ruler) | Uses `.ruler/` as a central rules source; distributes to multiple tools; includes MCP propagation. | README states "single source of truth" and `.ruler/` workflow; support table includes Claude, Codex, Cursor, Windsurf. | Strong adoption and momentum (2,478 stars). Good for rules + MCP propagation. Still a tool-specific source format (`.ruler/`), not a neutral `.beep/` standard. |
| [ai-rulez](https://github.com/Goldziher/ai-rulez) | Uses `.ai-rulez/` + generator model for many tools; includes MCP server functionality and profile/include features. | README describes generating native configs for Claude/Cursor/Windsurf/Codex and MCP support. | Broadest feature surface among reviewed tools (rules + more). Adoption is lower (89 stars), so ecosystem maturity/risk is higher than Ruler. |
| [LNAI](https://github.com/KrystianJonca/lnai) | Explicit `.ai/` convention with `init`, `validate`, and `sync`. | README: "Define once in `.ai/`, sync everywhere" and tool support list including Claude/Codex/Cursor/Windsurf. | Closest conceptual match to the desired end state, but `.ai/` naming collides with your chosen `.beep/` namespace and scope appears narrower than ai-rulez/agentsync in deeper parity areas. |
| [rulesync](https://github.com/jpcaparas/rulesync) | Single `rulesync.md` -> generates per-tool instruction files. | README lists generated targets including `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `AGENTS.md`. | Good if the immediate goal is rule-file deduplication only. Not a full config unification system. |
| [AgentSync](https://github.com/dallay/agentsync) | `.agents/` source + symlink-driven sync; also maps MCP into agent-specific formats. | README documents single source-of-truth and MCP mapping to `.codex/config.toml`, `.cursor/mcp.json`, etc. | Practical and close to requirements for generated parity. Low adoption (6 stars) and symlink-heavy defaults are a mismatch for your no-symlink constraint. |

### 2.2 MCP-focused unification tools

| Project | What it does | Evidence | Honest assessment |
|---|---|---|---|
| [add-mcp](https://github.com/neondatabase/add-mcp) | One command installs MCP servers into multiple agent configs. | README explicitly says "single command" and lists target config paths for Claude/Codex/Cursor/etc. | Excellent for the specific "add one MCP server everywhere" pain point. Does not unify rules/hooks/skills/commands. |
| [combine-mcp](https://github.com/nazar256/combine-mcp) | Runs as an MCP aggregator/proxy so clients point to one server. | README describes one interface over multiple backend MCP servers and a single shared MCP config file. | Smart architectural workaround for MCP duplication. Solves MCP distribution but not broader multi-tool config drift. |

### 2.3 Validation/linting companion

| Project | What it does | Evidence | Honest assessment |
|---|---|---|---|
| [agnix](https://github.com/agent-sh/agnix) | Lints/auto-fixes agent config files across tools. | README: linter with rules for Claude/Codex/Cursor/Copilot/OpenCode + editor integrations. | Not a sync engine, but very useful as a guardrail to catch silent breakage from generated files. |

### 2.4 Dotfile managers and analogous tooling

| Tool | Relevance | Evidence | Honest assessment |
|---|---|---|---|
| [Mackup](https://github.com/lra/mackup) | Backs up/restores config locations for many apps, including AI tools. | README includes Claude Code/Codex/Cursor/Windsurf; app configs include `claude-code.cfg` and `codex.cfg` with concrete file paths. | Useful for portability and backup; not a semantic translator between incompatible formats. |
| [chezmoi](https://www.chezmoi.io/) | General dotfile manager with templating and apply workflows. | Official docs position it as a generic dotfiles manager. | Good substrate for your own templates and generation workflows, but no reviewed first-party "AI config unification" schema/plugin. |

### 2.5 Emerging standards/specs

| Standard | Scope | Evidence | Honest assessment |
|---|---|---|---|
| [AGENTS.md](https://agents.md/) | Standard Markdown location/format for agent instructions. | Site describes open format; OpenAI announcement says AGENTS.md was contributed to AAIF under Linux Foundation. | Real momentum and likely long-term baseline for instruction text. Does not cover full structured config (hooks, commands, MCP auth, skills metadata). |
| [MCP](https://modelcontextprotocol.io/) | Protocol for tool/model context interoperability. | Widely referenced by vendors and tools, including AAIF announcement context. | Critical protocol layer, but not a unified local config schema across coding agents. |

## 3. Community Signals

### 3.1 Developers are explicitly reporting multi-tool config pain
- [openai/codex#3120 "Per-project config"](https://github.com/openai/codex/issues/3120) (2025-09-03): request highlights friction from global-only `~/.codex/config.toml` workflows.
- [getsentry/sentry-cli#2739 "Migrate Cursor and Claude rules to AGENTS.md"](https://github.com/getsentry/sentry-cli/issues/2739) (2025-09-11): maintainers discuss moving from mixed rule files to AGENTS.md plus compatibility shims.
- Cursor forum threads continue to request cross-tool or global rule consistency:
  - [Support AGENTS.MD](https://forum.cursor.com/t/support-agents-md/133414) (2025-09-14)
  - [Support global AGENTS.md](https://forum.cursor.com/t/support-global-agents-md/150406) (2026-01-30)
  - [AGENTS.md and SSH](https://forum.cursor.com/t/agents-md-and-ssh/148475) (2026-01-10), describing multi-machine sync friction.

### 3.2 Reddit/community discussion shows repeated format-fragmentation complaints
- [r/cursor: "Do cursor rules apply when using Codex or Claude"](https://www.reddit.com/r/cursor/comments/1nc641r/) (2025-09-09)
- [r/ClaudeAI: "Petition: Claude Code should support AGENTS.md"](https://www.reddit.com/r/ClaudeAI/comments/1q3q9bz/petition_claude_code_should_support_agentsmd/) (2026-01-04)
- [r/cursor: "Are Agents.md files supported in Cursor?"](https://www.reddit.com/r/cursor/comments/1p036zs/) (2025-11-18)

Note: direct Reddit API retrieval was blocked in this environment; links above were validated via indexed web results.

### 3.3 Ecosystem awareness is broadening (HN + launches)
- [HN: Ruler launch](https://news.ycombinator.com/item?id=44957623) (2025-08-20)
- [HN: LNAI launch](https://news.ycombinator.com/item?id=46868318) (2026-02-03)
- [HN: add-mcp launch](https://news.ycombinator.com/item?id=46966839) (2026-02-10)

This is a strong signal that people are actively building and evaluating interoperability tooling rather than treating this as a niche problem.

### 3.4 Vendor interoperability signals: positive but incomplete
- OpenAI’s AAIF announcement explicitly frames interoperability as a goal and states AGENTS.md contribution into neutral governance: [OpenAI AAIF announcement](https://openai.com/index/agentic-ai-foundation/).
- Cursor docs indicate AGENTS.md support and migration away from legacy `.cursorrules`: [Cursor rules docs](https://docs.cursor.com/context/rules).
- Anthropic’s Claude Code docs still center `CLAUDE.md`/`.claude/rules` memory paths and hierarchy: [Claude Code memory docs](https://docs.anthropic.com/en/docs/claude-code/memory).
- JetBrains AI Assistant has its own project rule system (`.aiassistant/rules`): [JetBrains project rules docs](https://www.jetbrains.com/help/ai-assistant/configure-project-rules.html).

Interpretation: vendors are converging on instruction portability faster than they are converging on full config portability.

## 4. Resource Index

### 4.1 Official vendor docs (primary)
- [OpenAI Codex config basics](https://developers.openai.com/codex/config-basic/) - user/project/system config locations and precedence.
- [OpenAI Codex MCP docs](https://developers.openai.com/codex/mcp/) - MCP config in `config.toml` including project/user scopes.
- [OpenAI Codex AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md/) - how Codex discovers layered AGENTS files.
- [OpenAI Codex skills](https://developers.openai.com/codex/skills/) - skills directory locations.
- [Anthropic Claude Code memory](https://docs.anthropic.com/en/docs/claude-code/memory) - CLAUDE.md + `.claude/rules` + user/project memory locations.
- [Cursor rules docs](https://docs.cursor.com/context/rules) - project/user rule model and AGENTS interplay.
- [Windsurf memories/rules docs](https://docs.windsurf.com/windsurf/cascade/memories) - global and workspace rule locations.
- [JetBrains AI Assistant project rules](https://www.jetbrains.com/help/ai-assistant/configure-project-rules.html) - `.aiassistant/rules` convention.

### 4.2 Unification and sync tools
- [Ruler](https://github.com/intellectronica/ruler) - high-adoption multi-agent rule/MCP sync.
- [ai-rulez](https://github.com/Goldziher/ai-rulez) - generator-based multi-tool config system.
- [LNAI](https://github.com/KrystianJonca/lnai) - `.ai/`-centric validate/sync workflow.
- [rulesync](https://github.com/jpcaparas/rulesync) - markdown-to-many rule file generator.
- [AgentSync](https://github.com/dallay/agentsync) - `.agents/` + symlink model, includes MCP mapping.
- [add-mcp](https://github.com/neondatabase/add-mcp) - MCP installation across multiple agents.
- [combine-mcp](https://github.com/nazar256/combine-mcp) - MCP aggregator pattern.
- [agnix](https://github.com/agent-sh/agnix) - config linter/validator.

### 4.3 Standards and governance
- [AGENTS.md](https://agents.md/) - open instruction file format and compatibility registry.
- [OpenAI: co-founding AAIF under Linux Foundation](https://openai.com/index/agentic-ai-foundation/) - governance/interoperability context and standard contributions.

### 4.4 Community signal sources
- [Codex issue: per-project config pain](https://github.com/openai/codex/issues/3120)
- [Sentry issue: migrate to AGENTS.md](https://github.com/getsentry/sentry-cli/issues/2739)
- [Cursor forum: Support AGENTS.MD](https://forum.cursor.com/t/support-agents-md/133414)
- [Cursor forum: Support global AGENTS.md](https://forum.cursor.com/t/support-global-agents-md/150406)
- [HN: Ruler launch](https://news.ycombinator.com/item?id=44957623)
- [HN: LNAI launch](https://news.ycombinator.com/item?id=46868318)
- [HN: add-mcp launch](https://news.ycombinator.com/item?id=46966839)

## 5. Recommendation
A gap still exists, so a custom but pragmatic implementation is justified.

### 5.1 Locked-in architecture (based on stakeholder decisions)
- Canonical source: repository-local `.beep/` only (no user-level `~/.ai/` layering).
- Implementation vehicle: `.beep/` as its own repo workspace/package, with Effect v4 as the core runtime.
- Compiler model: a local CLI (`beep-sync`) reads canonical config and generates tool-native outputs.
- Output model: generated files are committed to git and never hand-edited.
- Compatibility model: generate both `AGENTS.md` and `CLAUDE.md` from the same canonical instructions content.

### 5.2 Canonical schema design (`.beep/config.yaml` + Markdown assets)
Use YAML for the structured graph and Markdown for long instructions/prompts.

```yaml
# .beep/config.yaml
version: 1
project:
  linux_only: true
  commit_generated: true

instructions:
  base:
    - .beep/instructions/core.md
    - .beep/instructions/security.md

commands:
  - id: test
    run: bun test
    cwd: .
  - id: lint
    run: bun run lint
    cwd: .

hooks:
  pre_sync:
    - run: bun .beep/bin/beep-sync validate
  post_sync:
    - run: bun .beep/bin/beep-sync doctor

mcp_servers:
  context7:
    transport: http
    url: https://mcp.context7.com
    headers:
      Authorization:
        from: onepassword
        ref: op://engineering/context7/token

outputs:
  instructions:
    - target: AGENTS.md
      source: .beep/instructions/_compiled.md
    - target: CLAUDE.md
      source: .beep/instructions/_compiled.md

tool_overrides:
  codex:
    config_toml:
      model: o4-mini
  cursor:
    project_rules_dir: .cursor/rules
    legacy_cursorrules: false
```

Why YAML here: it is easier for deeply nested cross-tool mappings than TOML and simpler for team review in PRs.

### 5.3 Sync strategy (decision)

| Strategy | Decision | Reason |
|---|---|---|
| Symlinks | Rejected | Reported Claude caching issues and unnecessary complexity for your workflow. |
| Generated files | Adopted | Deterministic, debuggable, and supports schema-to-native transforms safely. |
| Watcher daemon | Optional later | Nice DX, but not required for initial rollout. |

### 5.4 Trigger mechanism
- Primary: explicit `beep-sync apply` command.
- Local guardrail: git hook runs `beep-sync validate` and `beep-sync check`.
- CI guardrail: same checks in pipeline to prevent drift from landing.
- Generated outputs are committed, so CI can enforce zero-diff generation.

### 5.5 Conflict resolution model
- Keep a strict common core (`instructions`, `commands`, `hooks`, `mcp_servers`, `agents`, `skills`).
- Allow `tool_overrides.<tool>` for non-portable knobs.
- Emit warning levels:
  - Error: invalid canonical schema or unsafe overwrite.
  - Warning: non-portable field dropped for target tool.
  - Info: fallback behavior used (for example, adapter shim file generated).
- Preserve unknown vendor-specific fields in passthrough blocks so migration does not lose information.

### 5.6 Incremental adoption path (low-risk)
1. Inventory current config files and classify into portable vs tool-specific.
2. Start with instructions only, generating `AGENTS.md` and `CLAUDE.md` from one source.
3. Add MCP sync next (highest pain/ROI), then commands/hooks, then skills/agents.
4. Run in shadow mode first: generate into `.beep/generated/` and diff against current live files.
5. Flip to managed mode once diffs are stable; add headers like `# GENERATED - edit .beep/config.yaml`.
6. Enforce with CI check to prevent manual drift.

### 5.7 Practical compatibility reality
You cannot fully eliminate root-level compatibility files today because several tools still require specific filenames/locations. The realistic goal is not zero tool files, but zero hand-maintained tool files.

## 6. Open Questions

### 6.1 Resolved Decisions (from stakeholder answers, 2026-02-23)
1. Generated compatibility files should be committed to git.
2. One canonical instruction set should drive all tools; `AGENTS.md` and `CLAUDE.md` are generated duplicates.
3. No user-level global config; project-level config only.
4. Canonical directory name is `.beep/` (not `.ai/`).
5. No symlinks in the implementation.
6. Linux-only support is acceptable for v1.
7. Initial scope is internal stack first, not day-one OSS generalization.
8. `.beep/` should be a workspace with dependencies; Effect v4 is the preferred core.

### 6.2 Remaining Open Questions
1. 1Password integration mode: use `op` CLI shell-out in v1, or implement 1Password SDK integration from day one?
2. Full JetBrains parity definition: which JetBrains AI features beyond `.aiassistant/rules` are mandatory for v1 parity?
3. Internal packaging layout: should the implementation live under `.beep/` directly or as a standard monorepo package (for example `packages/beep-sync`) with `.beep/` as runtime data only?

