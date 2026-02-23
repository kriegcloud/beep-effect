# Unified AI Tooling Configuration System - Research

> **Date**: 2026-02-22
> **Status**: Research complete
> **Scope**: Existing solutions, community signals, standards, and gap analysis for unifying AI coding tool configurations across Claude Code, Codex, Cursor, Windsurf, JetBrains AI, and others.

---

## 1. Executive Summary

AI tool config fragmentation is a widely recognized pain point with an active ecosystem of 15+ tools attempting to solve it. **No single solution comprehensively unifies all config dimensions** (rules, MCP servers, skills, commands, hooks, ignore files, memory), but the space is rapidly converging. The [AGENTS.md standard](https://agents.md/) (17.8k stars, Linux Foundation governance) is the closest thing to a universal baseline for instructions, though Claude Code still uses its own `CLAUDE.md`. [Ruler](https://github.com/intellectronica/ruler) (2.5k stars) leads in adoption for CLI-based sync, while [ai-rulez](https://github.com/Goldziher/ai-rulez) offers the most comprehensive feature set. The entire ecosystem is less than 12 months old and consolidation is likely as the Agentic AI Foundation (AAIF) matures.

---

## 2. Existing Solutions

### 2.1 CLI Tools for Config Sync

#### Ruler (intellectronica/ruler) - Most Popular

- **URL**: https://github.com/intellectronica/ruler
- **Stars**: ~2,500 | **Language**: TypeScript | **Install**: `npm i -g @intellectronica/ruler`
- **Approach**: Centralized `.ruler/` directory with `AGENTS.md` and other `.md` files. `ruler apply` distributes to all native config locations.
- **Supported agents (11)**: GitHub Copilot, Claude Code, Cursor, Aider, OpenAI Codex CLI, Windsurf, Cline, Firebase, Gemini CLI, Junie, AugmentCode
- **Config format**: TOML (`ruler.toml`) for tool selection, Markdown files for rules
- **MCP support**: Yes, distributes MCP configs
- **Actively maintained**: Yes (v0.3.0+)
- **Assessment**: Most mature and widely adopted. Good for rules and basic MCP. Doesn't handle skills, commands, or memory. The `.ruler/` convention is Ruler-specific rather than a community standard.

#### ai-rulez (Goldziher/ai-rulez) - Most Feature-Rich

- **URL**: https://github.com/Goldziher/ai-rulez
- **Stars**: ~89 | **Language**: Go | **Install**: `pip install ai-rulez`
- **Approach**: YAML config (`ai-rulez.yml`) as single source of truth. Generates native configs for all tools.
- **Supported tools (12+)**: Claude, Cursor, Windsurf, Copilot, Gemini, Cline, Continue.dev, Amp, Junie, Codex, OpenCode, custom presets
- **Key features**: 18 preset generators, commands system, 34% context compression, remote includes (pull from git repos), profile system (team configs), built-in MCP server
- **Assessment**: Most ambitious feature set. Remote includes solve the org-wide config sharing problem. Context compression is unique. Lower adoption than Ruler despite being more capable. Go binary means no Node.js dependency.

#### block/ai-rules (Block Inc.) - Corporate Backed

- **URL**: https://github.com/block/ai-rules
- **Stars**: ~64 | **Language**: Rust | **Install**: Shell script to `~/.local/bin/ai-rules`
- **Supported agents (11)**: AMP, Claude Code, Cline, Codex, Copilot, Cursor, Firebender, Gemini, Goose, Kilocode, Roo
- **Assessment**: Corporate backing from Block (formerly Square). Handles rules, commands, and skills. Rust binary. Newer and less community-adopted but has organizational muscle behind it.

#### LNAI (KrystianJonca/lnai) - Uses `.ai/` Convention

- **URL**: https://github.com/KrystianJonca/lnai | **Website**: https://lnai.sh/
- **Stars**: ~229 | **Language**: TypeScript | **Install**: npm
- **Approach**: Defines the `.ai/` directory convention. `lnai init` creates it, `lnai validate` checks errors, `lnai sync` exports to native formats.
- **Supported (7)**: Claude Code, Codex, Cursor, Gemini CLI, OpenCode, Windsurf, GitHub Copilot
- **Assessment**: Uses the intuitive `.ai/` convention that matches the desired end state. Good validation step. Doesn't handle MCP, skills, commands, or memory. The convention itself is the most interesting part.

#### rulesync (dyoshikawa/rulesync)

- **URL**: https://github.com/dyoshikawa/rulesync | **Website**: https://rulesync.dyoshikawa.com/
- **Install**: npm
- **Approach**: Unified `.rulesync/rules/` directory, import/export commands
- **Assessment**: Functional but limited scope. Multiple competing implementations dilute adoption (a PHP version also exists at jpcaparas/rulesync).

#### ai-rules-sync (lbb00/ai-rules-sync)

- **URL**: https://github.com/lbb00/ai-rules-sync
- **Stars**: ~12 | VS Code extension available
- **Approach**: Syncs rules, skills, commands, subagents across 9+ tools using symbolic links
- **Unique feature**: Multi-repository support (company standards + team protocols + open-source collections)
- **Assessment**: Good concept with multi-repo support. Very low adoption.

#### Simpler / Symlink-Based Tools

| Tool | URL | Approach |
|------|-----|----------|
| agentlink | https://github.com/martinmose/agentlink | `.agentlink.yaml` -> symlinks |
| syncai (nxnom) | https://github.com/nxnom/syncai | Single `Rules.md` -> symlinks |
| syncai (flowmitry) | https://github.com/flowmitry/syncai | JSON config, file watching |
| agent-sync | https://github.com/ZacheryGlass/agent-sync | Unified config sync |
| AgentSync (Rust) | https://github.com/dallay/agentsync | `.agents/` dir -> symlinks + MCP |

### 2.2 MCP-Specific Config Management

#### add-mcp (Neon)

- **URL**: https://github.com/neondatabase/add-mcp
- **What**: `npx add-mcp` installs an MCP server across all coding agents with a single command. Auto-detects installed agents, writes correct config files.
- **Supports (9)**: Claude Code, Claude Desktop, Codex, Cursor, Gemini CLI, Goose, OpenCode, VS Code, Zed
- **Assessment**: Excellent for MCP-specific needs. Addresses the "add one MCP server to everything" workflow perfectly. Doesn't handle rules/skills/commands.

#### combine-mcp (nazar256/combine-mcp)

- **URL**: https://github.com/nazar256/combine-mcp
- **What**: MCP aggregator - single config file for all MCP backends. Each client points to one `combine-mcp` binary that proxies to actual MCP servers.
- **Assessment**: Elegant architectural approach. Instead of syncing MCP configs, eliminates the need by acting as a single proxy. Each client just points to `combine-mcp`. Solves the MCP dimension completely but nothing else.

#### MCP Linker (milisp/mcp-linker)

- **URL**: https://github.com/milisp/mcp-linker
- **What**: Tauri GUI app for one-click MCP server installation and cross-tool sync. Built-in marketplace of 600+ curated servers.
- **Assessment**: GUI-focused, less useful for CLI-centric workflows. Good for initial MCP setup.

### 2.3 Linters and Validators

#### agnix (avifenesh/agnix)

- **URL**: https://github.com/avifenesh/agnix
- **Stars**: ~52 | **Language**: Rust
- **What**: Linter for agent config files. 230 rules across 32 categories. Available as VS Code extension, CLI (`npx agnix .`), and plugins for JetBrains, Neovim, Zed.
- **Assessment**: Complementary to sync tools. Validates that generated configs are correct. The JetBrains plugin makes it one of the few tools touching that ecosystem.

### 2.4 GUI / Web Tools

| Tool | URL | Description |
|------|-----|-------------|
| ClaudeMDEditor | https://www.claudemdeditor.com/ | Visual editor for multi-agent rules |
| sync-conf.dev | https://sync-conf.dev/ | Directory of 100+ community configs. `npx sync-conf install owner/repo` |
| indx.sh | https://indx.sh/ | Directory of AI coding prompts, MCP servers, and skills |

### 2.5 VS Code Extensions

| Extension | Marketplace Link | Description |
|-----------|-----------------|-------------|
| Agent Rules Sync | FireFunGames.agent-rules-sync | Unified editor for AGENTS.md, CLAUDE.md, .cursor/rules/ |
| AI Rules Sync | zidonglin.ai-rules-sync | Syncs rule files between AI IDEs |
| AI Rules Syncer | HerrInformatiker.ai-rules-syncer | Syncs workspace AI rules with central git repo |
| LHI AI Agent Sync | lifehackinnovationsllc.lhi-ai-agent-sync | Cross-environment sync |

---

## 3. Standards and Specifications

### 3.1 AGENTS.md (Linux Foundation / AAIF) - THE EMERGENT STANDARD

- **URL**: https://agents.md/ | **GitHub**: https://github.com/agentsmd/agents.md (17.8k stars)
- **Governance**: Agentic AI Foundation (AAIF) under the Linux Foundation (announced Dec 9, 2025). Platinum members include AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, OpenAI.
- **Format**: Standard Markdown in project root. Hierarchical (nearest file in directory tree wins).
- **Adopted by**: OpenAI Codex, Amp, Jules (Google), Cursor, Windsurf, Kilo Code, Factory, and others.
- **Critical gap**: Claude Code still uses `CLAUDE.md`, not `AGENTS.md`. Anthropic is an AAIF member but hasn't migrated.
- **Assessment**: This is the standard that matters. Institutional backing from every major player. The CLAUDE.md/AGENTS.md split is the biggest remaining friction point.

### 3.2 AIRS (AI Editor Rules Standard)

- **URL**: https://www.useairs.dev/ | **GitHub**: https://github.com/nixoid/airs
- **What**: Company-agnostic standard for rule/instruction format. Markdown files with YAML frontmatter.
- **Assessment**: Addresses format standardization (how rules are written) rather than location/sync. Competing with AGENTS.md's momentum. Unlikely to win.

### 3.3 AI Coding Agent Rule Specification (AI-Rule-Spec)

- **URL**: https://aicodingrules.org/ | **GitHub**: https://github.com/agent-rules/agent-rules
- **What**: Unified framework combining YAML structure with Markdown. Proposes a single `.ai-rules` file with hierarchy (user/project/org).
- **Assessment**: Ambitious but competing against AGENTS.md's Linux Foundation backing. Unlikely to gain critical mass.

### 3.4 Agent Client Protocol (ACP) - JetBrains + Zed

- **URL**: https://www.jetbrains.com/help/ai-assistant/acp.html
- **What**: Protocol for AI agent interoperability in IDEs (like LSP but for AI agents). JetBrains + Zed collaboration.
- **Assessment**: Solves agent connectivity (how agents talk to IDEs), not config sync. But relevant because JetBrains is the hardest tool to integrate into any unified config system.

---

## 4. Community Signals

### 4.1 Hacker News Threads

| Thread | URL | Signal |
|--------|-----|--------|
| LNAI launch | https://news.ycombinator.com/item?id=46868318 | Active discussion on `.ai/` convention |
| Ruler launch | https://news.ycombinator.com/item?id=44062058 | Strong reception, many sharing similar pain |
| Ruler follow-up | https://news.ycombinator.com/item?id=44098457 | Continued interest |
| MCP sync tool | https://news.ycombinator.com/item?id=46926648 | MCP-specific config pain |
| LynxPrompt | https://news.ycombinator.com/item?id=46397931 | Repo-first AI config generation |
| Unify AI tools | https://news.ycombinator.com/item?id=44463286 | General unification discussion |

### 4.2 Blog Posts

| Title | URL | Key Insight |
|-------|-----|-------------|
| Keep your AGENTS.md in sync | https://kau.sh/blog/agents-md/ | Practical symlink approach |
| Keeping Claude Code, Codex, and Cursor memory in sync | https://coding-with-ai.dev/posts/sync-claude-code-codex-cursor-memory/ | Three approaches: symlinks, copy scripts, shared file |
| One Rulebook for All Your AI Coding Tools | Medium (Abhinav Gupta) | Unified rulebooks concept |
| Aligning Team using Cursor, Claude, etc. | https://www.concret.io/blog/sync-coding-standards-across-cursor-agentforce-vibes-claude-code | Hardlink approach for teams |
| Stop Treating Agent Intelligence Like a Local Config File | Medium (leeon14) | Argues for portable, shareable agent configs |
| Agent Rules is the Missing Link | https://lirantal.com/blog/agent-rules-missing-link-ai-powered-development | Liran Tal on agent-rules standard |
| Keeping MCP Configs in Sync | https://www.mikekawasaki.com/blog/keeping-mcp-configs-in-sync/ | MCP-specific bidirectional sync |

### 4.3 Enterprise Signals

- **Zapier survey**: 76% of enterprises report negative outcomes from disconnected AI tools; 34% say tool sprawl makes training a major challenge; 30% waste money on redundant AI software.
- **Portkey blog** (https://portkey.ai/blog/ai-tool-sprawl-causes-risks-and-how-teams-can-regain-control/): Documents AI tool sprawl risks at org level.

### 4.4 Vendor Awareness

- **Anthropic**: AAIF member but hasn't migrated Claude Code from `CLAUDE.md` to `AGENTS.md`. No public config interop roadmap.
- **Cursor**: Added "Include CLAUDE.md" setting, acknowledging the dual-standard problem.
- **JetBrains + Zed**: Agent Client Protocol (ACP) addresses agent runtime interop but not config.
- **OpenAI**: Codex explicitly supports AGENTS.md.
- **Google (Gemini)**: Jules supports AGENTS.md.

---

## 5. Resource Index

### Standards

| Resource | URL | Notes |
|----------|-----|-------|
| AGENTS.md spec | https://agents.md/ | Linux Foundation standard, 17.8k stars |
| AGENTS.md GitHub | https://github.com/agentsmd/agents.md | Source repo |
| AAIF announcement | https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation | Founding members |
| AIRS standard | https://www.useairs.dev/ | Rule format standard |
| AI-Rule-Spec | https://aicodingrules.org/ | Alternative rule spec |
| ACP docs | https://www.jetbrains.com/help/ai-assistant/acp.html | JetBrains agent protocol |

### CLI Tools

| Resource | URL | Notes |
|----------|-----|-------|
| Ruler | https://github.com/intellectronica/ruler | 2.5k stars, most adopted |
| ai-rulez | https://github.com/Goldziher/ai-rulez | Most features, Go binary |
| block/ai-rules | https://github.com/block/ai-rules | Corporate-backed, Rust |
| LNAI | https://github.com/KrystianJonca/lnai | `.ai/` convention |
| add-mcp | https://github.com/neondatabase/add-mcp | MCP server installer |
| combine-mcp | https://github.com/nazar256/combine-mcp | MCP proxy/aggregator |
| agnix | https://github.com/avifenesh/agnix | Config linter, 230 rules |
| rulesync | https://github.com/dyoshikawa/rulesync | Rule sync with import/export |
| ai-rules-sync | https://github.com/lbb00/ai-rules-sync | Multi-repo support |
| agentlink | https://github.com/martinmose/agentlink | YAML-based symlinks |
| agent-sync | https://github.com/ZacheryGlass/agent-sync | Unified sync |
| AgentSync (Rust) | https://github.com/dallay/agentsync | Rust CLI, `.agents/` dir |

### Blog Posts & Guides

| Resource | URL | Notes |
|----------|-----|-------|
| Symlink approach | https://kau.sh/blog/agents-md/ | Practical AGENTS.md sync |
| Three sync approaches | https://coding-with-ai.dev/posts/sync-claude-code-codex-cursor-memory/ | Symlinks, copy, shared |
| MCP config sync | https://www.mikekawasaki.com/blog/keeping-mcp-configs-in-sync/ | Bidirectional MCP sync |
| Agent rules guide | https://lirantal.com/blog/agent-rules-missing-link-ai-powered-development | Agent-rules advocacy |

### Directories & Marketplaces

| Resource | URL | Notes |
|----------|-----|-------|
| sync-conf.dev | https://sync-conf.dev/ | 100+ community configs |
| indx.sh | https://indx.sh/ | AI coding rules directory |
| ClaudeMDEditor | https://www.claudemdeditor.com/ | Visual rule editor |
| MCP Linker | https://github.com/milisp/mcp-linker | GUI MCP manager, 600+ servers |

---

## 6. Recommendation

A satisfactory unified solution does not exist today. The gap is real and the existing tools each solve a slice of the problem. Here is a concrete, opinionated recommendation for our environment.

### 6.1 Recommended Approach: Composition over Invention

Rather than building a new tool from scratch, compose existing best-in-class tools into an integrated workflow:

```
AGENTS.md          -> Standard for instructions/rules (adopt the standard)
Ruler or ai-rulez  -> CLI for syncing rules to tool-native locations
combine-mcp        -> MCP proxy eliminates MCP config sync entirely
add-mcp            -> One-time MCP server registration across tools
agnix              -> Validation layer for generated configs
```

### 6.2 Canonical Source Directory

Adopt the `.ai/` convention (as LNAI proposes) or `.ruler/` (as Ruler uses). The structure:

```
.ai/
  AGENTS.md              # Primary instructions (THE source of truth)
  rules/
    coding-style.md      # Modular rule files
    testing.md
    error-handling.md
  mcp/
    servers.json         # MCP server definitions (or use combine-mcp)
  skills/
    skill-name.md        # Portable skill definitions
  commands/
    command-name.md      # Portable command definitions
  hooks/
    pre-commit.sh        # Shared hook scripts
  ignore                 # Shared ignore patterns
  config.toml            # Sync tool configuration
```

### 6.3 Sync Strategy: Generated Files (Not Symlinks)

**Symlinks** are tempting but problematic:
- Some tools don't follow symlinks correctly
- Git treats symlinks as files containing the target path (confuses contributors)
- Windows compatibility issues
- Can't transform content (e.g., Cursor `.mdc` format differs from plain Markdown)

**Generated files** (Ruler/ai-rulez approach) are better:
- Each tool gets exactly its native format
- Content transformation happens at sync time (e.g., AGENTS.md -> CLAUDE.md with tool-specific sections)
- Generated files can be `.gitignore`d to avoid repo pollution
- Clear separation: `.ai/` is source of truth, everything else is derived

**Recommended**: Use generated files with a `.gitignore` entry for all tool-specific dirs:

```gitignore
# AI tool configs (generated from .ai/)
.claude/
.cursor/
.cursorrules
.windsurfrules
.github/copilot-instructions.md
!.ai/
```

### 6.4 Trigger Mechanism

Run sync in these scenarios:

1. **Manual**: `ai-sync` CLI command (wraps Ruler or ai-rulez)
2. **Git hook** (lefthook `post-checkout`, `post-merge`): Auto-sync after branch switches and pulls
3. **Claude Code hook** (`PreToolUse`): Could validate configs before agent operations
4. **CI check**: `ai-sync --check` in PR validation (ensures `.ai/` and generated files are consistent)

### 6.5 MCP Strategy: combine-mcp as Proxy

Instead of syncing MCP configs across tools, use `combine-mcp` as a single proxy:

```
All tools -> combine-mcp (single config) -> Individual MCP servers
```

Each AI tool's MCP config just points to `combine-mcp`. Adding a new MCP server means updating one file. This is architecturally superior to config sync for MCP specifically.

For one-time setup of new MCP servers, use `npx add-mcp` to register `combine-mcp` with each tool.

### 6.6 Handling Tool-Specific Fields

Some config dimensions have no cross-tool equivalent:

| Dimension | Strategy |
|-----------|----------|
| Claude Code hooks | Keep in `.claude/` (no equivalent elsewhere) |
| Claude Code memory | Keep in `.claude/memory/` (tool-specific) |
| Cursor `.mdc` metadata | Generate from `.ai/rules/*.md` with frontmatter transform |
| JetBrains ACP | Keep in `.idea/` (no cross-tool equivalent yet) |
| Windsurf-specific settings | Tool-specific section in `.ai/config.toml` |

**Principle**: The unified `.ai/` directory captures everything that CAN be shared. Tool-specific configs that have no portable equivalent stay in their native locations. The goal is to eliminate duplication, not to force everything into one format.

### 6.7 Adoption Path

**Phase 1 - Evaluate (1 day)**:
- Install Ruler (`npm i -g @intellectronica/ruler`) and ai-rulez (`pip install ai-rulez`)
- Test both against the current repo's configs
- Pick the one that handles our specific tool mix best

**Phase 2 - Centralize Rules (1 day)**:
- Create `.ai/` (or `.ruler/`) directory
- Move existing `CLAUDE.md` content into `AGENTS.md` + modular rule files
- Run sync, verify all tools still work
- Add `.gitignore` entries for generated files

**Phase 3 - MCP Consolidation (1 day)**:
- Set up `combine-mcp` as proxy
- Point all tools' MCP configs to it
- Use `add-mcp` for initial registration

**Phase 4 - Automation (1 day)**:
- Add lefthook `post-checkout` / `post-merge` hooks
- Add CI check for config consistency
- Optionally add `agnix` linting

**Phase 5 - Team/Org Expansion (ongoing)**:
- If org-wide standards needed: use ai-rulez's remote includes to pull from a shared company repo
- Document the `.ai/` convention in team onboarding

---

## 7. Open Questions

1. **AGENTS.md timeline for Claude Code**: Will Anthropic migrate Claude Code from `CLAUDE.md` to `AGENTS.md`? As an AAIF member, this seems likely but no timeline has been announced. This is the single biggest friction point.

2. **Ruler vs. ai-rulez**: Ruler has more community adoption (2.5k vs 89 stars). ai-rulez has more features (remote includes, profiles, compression, MCP server). Which wins long-term? The Go vs. TypeScript runtime difference matters for CI.

3. **JetBrains integration**: ACP is a runtime protocol, not a config format. None of the sync tools meaningfully address JetBrains AI configuration. This may remain a gap until JetBrains adopts AGENTS.md or similar.

4. **Memory/context portability**: No tool addresses syncing agent memory (`.claude/memory/`, Graphiti, etc.) across tools. This may not be solvable generically since memory systems are fundamentally different.

5. **Skills/commands semantic portability**: Claude Code skills (`.claude/skills/*.md`) and Cursor rules (`.cursor/rules/*.mdc`) have different semantics even though both are Markdown-ish. Is mechanical sync sufficient or do we need semantic translation?

6. **AAIF convergence timeline**: With AWS, Anthropic, Google, Microsoft, and OpenAI all in the foundation, will AGENTS.md become the One True Standard within 12 months? If so, building custom tooling may be premature.

7. **combine-mcp maturity**: Is combine-mcp production-ready for a multi-tool workflow? What's the latency overhead of proxying all MCP calls through it?

---

## Appendix: Comparison Matrix

| Tool | Rules | MCP | Skills | Commands | Ignore | Memory | JetBrains | Stars |
|------|:-----:|:---:|:------:|:--------:|:------:|:------:|:---------:|------:|
| **Ruler** | 11 agents | Yes | Partial | Partial | No | No | No | 2,500 |
| **ai-rulez** | 18 presets | Partial | Yes | Yes | No | No | No | 89 |
| **block/ai-rules** | 11 agents | Yes | Yes | Yes | No | No | No | 64 |
| **LNAI** | 7 agents | No | No | No | No | No | No | 229 |
| **add-mcp** | No | 9 agents | No | No | No | No | No | -- |
| **combine-mcp** | No | Proxy | No | No | No | No | No | -- |
| **agnix** (lint) | Validates | Validates | Validates | No | No | No | Plugin | 52 |
| **Ideal** | All | All | All | All | All | All | All | -- |
