# Hook System Analysis

> P0 Inventory - Hook behavior, token injection, and optimization opportunities
> Generated: 2026-02-03

---

## Overview

The agent infrastructure uses 4 hook systems configured in `.claude/settings.json`:

| Hook | Trigger | Entry Point |
|------|---------|-------------|
| SessionStart | Session begins | `.claude/hooks/agent-init/run.sh` |
| UserPromptSubmit | Every prompt | `.claude/hooks/skill-suggester/run.sh` |
| PreToolUse (Task) | Agent spawn | `.claude/hooks/subagent-init/run.sh` |
| PreToolUse (Bash) + PostToolUse (Edit\|Write) | Commands/edits | `.claude/hooks/pattern-detector/run.sh` |

---

## Hook: SessionStart (agent-init)

**Trigger**: Once per session start

**Token Cost**: 8,700-11,700 tokens

### Files Loaded

| File | Purpose | Est. Tokens |
|------|---------|-------------|
| `agent-init/index.ts` | Main initialization | ~1,710 |
| `.claude/settings.json` | Configuration | ~100 |

### External Commands Executed

All run in parallel via `Effect.all`:

| Command | Purpose | Est. Tokens |
|---------|---------|-------------|
| `tree -L 2` | Project structure | 500-800 |
| `git status --short` | Working tree status | 100-300 |
| `git show HEAD --stat` | Latest commit | 300-500 |
| `git log --oneline -4 --skip=1` | Previous commits | 150-250 |
| `git branch -vv --sort=-committerdate` | Branch context | 200-400 |
| `gh issue list --limit 5` | Open issues | 500-1,000 |
| `gh pr list --limit 5` | Open PRs | 500-1,000 |
| `bun .claude/scripts/context-crawler.ts --summary` | Module summary | 500-2,000 |
| `bun -e console.log(require('./package.json').version)` | Version | ~50 |
| Package scripts query | Available scripts | 200-400 |
| `mise tasks --json` | Mise tasks | 200-400 |
| `gh repo view` | Repository info | ~50 |
| `git log --since=7 days ago` | Recent authors | 100-200 |
| `gh api repos/{owner}/{repo}/collaborators` | Team members | 300-500 |

### Content Injected

Wrapped in `<session-context>` tags:
- Agent instructions with delegation thresholds (~2,500 tokens)
- Full project directory tree
- Git status and history
- Branch information
- GitHub issues and PRs
- Module summaries
- Available scripts and tasks
- Team collaborator information

### Optimization Opportunities

1. **Disable GitHub queries** when not needed (save ~2,000-3,000 tokens)
2. **Reduce tree depth** from 2 to 1 (save ~300-500 tokens)
3. **Lazy load module summary** only when needed (save ~500-2,000 tokens)
4. **Cache static instructions** across sessions

---

## Hook: UserPromptSubmit (skill-suggester)

**Trigger**: Every user prompt submission

**Token Cost**: 5,000-6,500 tokens per prompt

### Files Loaded

| File | Purpose | Est. Tokens |
|------|---------|-------------|
| `skill-suggester/index.ts` | Main suggester | ~1,310 |
| `schemas/index.ts` | Input/output schemas | ~720 |
| `.claude/.hook-state.json` | Timing state | ~50-100 |
| `.claude/skills/*/SKILL.md` | Skill metadata (5-15 files) | 1,000-4,500 |

### Conditional Commands

| Command | Condition | Est. Tokens |
|---------|-----------|-------------|
| `bun .claude/scripts/context-crawler.ts --search {pattern}` | 4+ char words in prompt | 500-2,000 |
| `mise tasks --json` | Script keywords detected | 200-400 |
| Version lookup | Always | ~50 |

### Content Injected

Wrapped in `<system-hints>` tags:
- Hook state timing information (~100 tokens)
- Matched skill names (~50-200 tokens)
- Module search results (conditional, ~500-1,500 tokens)
- Mise task suggestions (conditional, ~200-400 tokens)

### Optimization Opportunities

1. **Cache skill metadata** across prompts (save ~1,000-4,500 tokens per prompt)
2. **Reduce skill file count** or compress skill definitions
3. **Increase match threshold** to reduce false positives
4. **Add prompt-based opt-out** for power users

---

## Hook: PreToolUse (subagent-init)

**Trigger**: Before Task (subagent spawn) execution

**Token Cost**: 4,400-7,090 tokens per spawn

### Files Loaded

| File | Purpose | Est. Tokens |
|------|---------|-------------|
| `subagent-init/index.ts` | Initialization | ~1,390 |
| Inherited AgentConfig | Layer setup | Included |

### External Commands Executed

| Command | Purpose | Est. Tokens |
|---------|---------|-------------|
| `bun .claude/scripts/context-crawler.ts --summary` | Module summary | 500-2,000 |
| Version lookup | Package version | ~50 |
| `git show HEAD --stat` | Latest commit | 300-500 |
| `git log --oneline -4 --skip=1` | Previous commits | 150-250 |
| Package scripts query | Available scripts | 200-400 |
| `mise tasks --json` | Mise tasks | 200-400 |

### Content Injected

Wrapped in `<subagent-context>` tags:
- Subagent-specific instructions (~1,800-2,200 tokens):
  - Core implementer identity
  - Responsibility boundaries
  - Execution model
  - Output format
  - Parallel environment handling
- Git context
- Module summary
- Available scripts

### Optimization Opportunities

1. **Share context with parent session** instead of regenerating
2. **Reduce git commands** (parent already has context)
3. **Lightweight mode** for simple subagents
4. **Cache module summary** across spawns in same session

---

## Hook: PreToolUse + PostToolUse (pattern-detector)

**Trigger**:
- PreToolUse: Before Bash commands
- PostToolUse: After Edit/Write operations

**Token Cost**: 1,500-3,000 tokens per invocation

### Files Loaded

| File | Purpose | Est. Tokens |
|------|---------|-------------|
| `pattern-detector/index.ts` | Main handler | ~225 |
| `pattern-detector/core.ts` | Pattern matching | ~1,030 |
| `.claude/.hook-state.json` | Pattern cache | ~100 |
| `.claude/patterns/**/*.md` | Pattern definitions | Variable, cached |

### Caching Strategy

- **Cache TTL**: 30 minutes
- **Invalidation**: File modification time check
- **First run**: Loads all `.md` files from `.claude/patterns/`
- **Subsequent runs**: Uses cache if valid

### Pattern Matching Flow

1. Parse hook input (tool name, content, file path)
2. Match against loaded patterns using:
   - Regex on tool name
   - Glob on file path
   - Regex on content
3. Filter by action type (context or permission)

### Content Injected

**For PostToolUse (Edit/Write)**:
- Matching context patterns (~100-1,000 tokens per match)
- Sorted by severity level

**For PreToolUse (Bash)**:
- Highest priority permission pattern only (~100-500 tokens)
- Returns "ask", "deny", or silent

### Optimization Opportunities

1. **Extend cache TTL** beyond 30 minutes for stable patterns
2. **Pattern pruning** - remove unused patterns
3. **Lazy pattern loading** - load only relevant pattern categories
4. **Cross-agent cache sharing** for multi-agent sessions

---

## Token Budget Summary

### Per-Session Breakdown

| Component | Frequency | Cost Each | Total |
|-----------|-----------|-----------|-------|
| SessionStart | 1x | 10,000 | 10,000 |
| Prompts | 5x (avg) | 5,500 | 27,500 |
| Task spawns | 2x (avg) | 5,500 | 11,000 |
| Bash commands | 10x (avg) | 1,750 | 17,500 |
| Edit/Write ops | 8x (avg) | 2,000 | 16,000 |
| **Session Total** | — | — | **82,000** |

### Overhead as Percentage

| Component | % of Session Budget |
|-----------|---------------------|
| SessionStart | 12% |
| Prompt overhead | 34% |
| Task overhead | 13% |
| Pattern detection | 41% |

---

## Critical Findings

### High Impact Issues

1. **Per-prompt overhead dominates**: 5,500 tokens × N prompts adds up quickly
2. **Skill reloading inefficiency**: Skills reload every prompt instead of caching
3. **Pattern detector runs frequently**: Every Bash/Edit/Write invocation
4. **Subagent duplication**: Regenerates context parent already has

### Recommended Optimizations (Priority Order)

| Priority | Optimization | Estimated Savings |
|----------|--------------|-------------------|
| P0 | Cache skill metadata across prompts | 1,500-4,000 tokens/prompt |
| P1 | Share session context with subagents | 2,000-4,000 tokens/spawn |
| P1 | Disable GitHub queries by default | 2,000-3,000 tokens/session |
| P2 | Lightweight mode for pattern detector | 500-1,000 tokens/invocation |
| P2 | Extend pattern cache TTL | Marginal (already 30min) |
| P3 | Reduce tree depth | 300-500 tokens/session |

### Target State

| Metric | Current | Target | Reduction |
|--------|---------|--------|-----------|
| Per-prompt | 5,500 | 2,000 | 64% |
| Per-spawn | 5,500 | 2,000 | 64% |
| Per-session | 82,000 | 40,000 | 51% |

---

## Hook Flow Diagram

```
Session Start
    │
    ▼
┌─────────────────────────────────┐
│  SessionStart (agent-init)      │  ~10,000 tokens
│  - Tree structure               │
│  - Git context                  │
│  - GitHub issues/PRs            │
│  - Module summary               │
│  - Scripts/tasks                │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  User Prompt                    │
│         │                       │
│         ▼                       │
│  UserPromptSubmit               │  ~5,500 tokens/prompt
│  (skill-suggester)              │
│  - Load skills                  │
│  - Match suggestions            │
│  - Module search                │
└─────────────────────────────────┘
    │
    ├──────────────────────────────┐
    │                              │
    ▼                              ▼
┌────────────────────┐    ┌────────────────────┐
│  Task Tool         │    │  Bash Tool         │
│       │            │    │       │            │
│       ▼            │    │       ▼            │
│  PreToolUse:Task   │    │  PreToolUse:Bash   │
│  (subagent-init)   │    │  (pattern-detector)│
│  ~5,500 tokens     │    │  ~1,750 tokens     │
└────────────────────┘    └────────────────────┘
                                   │
                                   ▼
                          ┌────────────────────┐
                          │  Edit/Write Tool   │
                          │       │            │
                          │       ▼            │
                          │  PostToolUse       │
                          │  (pattern-detector)│
                          │  ~2,000 tokens     │
                          └────────────────────┘
```
