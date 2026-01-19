# Agent Capability Matrix

> Comprehensive mapping of agents, capabilities, and delegation recommendations for orchestrator context optimization.

**Generated**: 2026-01-18
**Source**: `.claude/agents/*.md`

---

## Summary

| Category | Count |
|----------|-------|
| Total agents | 17 |
| Read-only agents | 6 |
| Report-producing agents | 5 |
| File-writing agents | 6 |

---

## Full Agent Matrix

| Agent | Primary Capability | Tools | Writes Files | Output Type | Typical Use Case |
|-------|-------------------|-------|--------------|-------------|------------------|
| `codebase-researcher` | Systematic code exploration | Glob, Grep, Read | NO | Informs orchestrator | Find patterns, map dependencies |
| `mcp-researcher` | Effect documentation lookup | effect_docs_search, get_effect_doc | NO | Informs orchestrator | Effect API questions |
| `effect-researcher` | Effect pattern research | All tools | NO | Informs orchestrator | Deep Effect pattern analysis |
| `effect-schema-expert` | Schema pattern guidance | Glob, Grep, Read, effect_docs | NO | Informs orchestrator | Schema design decisions |
| `effect-predicate-master` | Predicate utilities | Glob, Grep, Read, effect_docs | NO | Informs orchestrator | Match/predicate patterns |
| `ai-trends-researcher` | External research | WebSearch, WebFetch | NO | Informs orchestrator | Industry trends, best practices |
| `reflector` | Meta-reflection, pattern extraction | All tools | YES | `outputs/meta-reflection-*.md` | Analyze REFLECTION_LOG |
| `code-reviewer` | Code guideline violations | Read, Grep, Glob | YES | `outputs/guideline-review.md` | Review code against standards |
| `architecture-pattern-enforcer` | Architecture audit | Read, Glob, Grep | YES | `outputs/architecture-review.md` | Validate layer boundaries |
| `spec-reviewer` | Spec quality assessment | Read, Glob, Grep | YES | `outputs/spec-review.md` | Validate spec structure |
| `tsconfig-auditor` | TypeScript config audit | All tools | YES | `outputs/tsconfig-audit.md` | Audit tsconfig files |
| `doc-writer` | Documentation creation | All tools | YES | `.md` files | README, AGENTS.md, JSDoc |
| `test-writer` | Effect-first test creation | All tools | YES | `*.test.ts` files | Unit/integration tests |
| `effect-code-writer` | Effect code implementation | All tools | YES | `*.ts` files | Service, Layer code |
| `jsdoc-fixer` | JSDoc compliance | All tools | YES | Source modifications | Add/fix JSDoc comments |
| `package-error-fixer` | Error resolution | All tools | YES | Source modifications | Fix type/build/lint errors |
| `agents-md-updater` | AGENTS.md maintenance | All tools | YES | `AGENTS.md` files | Update agent documentation |

---

## Agent Categories

### Research Agents (Read-Only)

These agents analyze and inform the orchestrator but produce NO persistent artifacts.

| Agent | Best For | Tool Access |
|-------|----------|-------------|
| `codebase-researcher` | Exploring codebase patterns, finding files, mapping dependencies | Glob, Grep, Read |
| `mcp-researcher` | Effect documentation, API reference | effect_docs MCP tools |
| `effect-researcher` | Deep Effect pattern analysis | All tools |
| `effect-schema-expert` | Schema design, validation patterns | Glob, Grep, Read, effect_docs |
| `effect-predicate-master` | Match expressions, type predicates | Glob, Grep, Read, effect_docs |
| `ai-trends-researcher` | External research, industry trends | WebSearch, WebFetch |

**Delegation Rule**: Use for any research task requiring >3 file reads or broad search.

---

### Report-Producing Agents

These agents create markdown reports in `outputs/` directories.

| Agent | Output | Best For |
|-------|--------|----------|
| `reflector` | `outputs/meta-reflection-*.md` | Analyzing REFLECTION_LOG, extracting patterns |
| `code-reviewer` | `outputs/guideline-review.md` | Reviewing code against project standards |
| `architecture-pattern-enforcer` | `outputs/architecture-review.md` | Validating layer boundaries, slice structure |
| `spec-reviewer` | `outputs/spec-review.md` | Validating spec structure, scoring quality |
| `tsconfig-auditor` | `outputs/tsconfig-audit.md` | Auditing TypeScript configuration |

**Delegation Rule**: Use when you need documented findings, not just information.

---

### Execution Agents (Write Files)

These agents create or modify source files.

| Agent | Output Type | Best For |
|-------|-------------|----------|
| `doc-writer` | `.md` files | README, AGENTS.md, MASTER_ORCHESTRATION |
| `test-writer` | `*.test.ts` | Effect tests with @beep/testkit |
| `effect-code-writer` | `*.ts` | Effect services, layers, handlers |
| `jsdoc-fixer` | Source modifications | JSDoc comments with @category, @example |
| `package-error-fixer` | Source modifications | Fix type/build/lint errors iteratively |
| `agents-md-updater` | `AGENTS.md` | Update agent documentation files |

**Delegation Rule**: Use for ANY code or documentation generation.

---

## Task-to-Agent Delegation Guide

### Mandatory Delegation Matrix

| Task Type | Delegate To | Never Do Directly |
|-----------|-------------|-------------------|
| Code exploration (>3 files) | `codebase-researcher` | Sequential Glob/Read by orchestrator |
| Effect documentation lookup | `mcp-researcher` | Manual effect_docs calls |
| Effect pattern research | `effect-researcher` | Broad Effect pattern analysis |
| Schema design questions | `effect-schema-expert` | Schema pattern decisions |
| Source code implementation | `effect-code-writer` | Writing `.ts` files |
| Test implementation | `test-writer` | Writing `.test.ts` files |
| Documentation creation | `doc-writer` | Writing `.md` files |
| Architecture validation | `architecture-pattern-enforcer` | Layer boundary checks |
| Code review | `code-reviewer` | Guideline compliance checks |
| Error fixing | `package-error-fixer` | Manual type/lint fixes |

---

## Decision Tree

```
START: What type of task is this?
│
├─ RESEARCH (information gathering)
│   ├─ Codebase files? → codebase-researcher
│   ├─ Effect documentation? → mcp-researcher
│   ├─ Effect patterns (deep)? → effect-researcher
│   ├─ Schema design? → effect-schema-expert
│   └─ External sources? → ai-trends-researcher
│
├─ CREATION (generating artifacts)
│   ├─ Source code (.ts)? → effect-code-writer
│   ├─ Test code (.test.ts)? → test-writer
│   ├─ Documentation (.md)? → doc-writer
│   └─ AGENTS.md specifically? → agents-md-updater
│
├─ VALIDATION (reviewing/auditing)
│   ├─ Architecture boundaries? → architecture-pattern-enforcer
│   ├─ Code guidelines? → code-reviewer
│   ├─ Spec quality? → spec-reviewer
│   └─ TypeScript config? → tsconfig-auditor
│
├─ FIXING (resolving errors)
│   ├─ Type/build/lint errors? → package-error-fixer
│   └─ JSDoc issues? → jsdoc-fixer
│
└─ SYNTHESIS (meta-analysis)
    └─ REFLECTION_LOG patterns? → reflector
```

---

## Delegation Trigger Rules

An orchestrator MUST delegate when ANY of these conditions are met:

| Trigger | Threshold | Agent Category |
|---------|-----------|----------------|
| File reads required | > 3 files | Research agent |
| Tool calls required | > 5 calls | Any appropriate agent |
| Code generation | Any | Execution agent |
| Test generation | Any | test-writer |
| Documentation creation | Any | doc-writer |
| Broad codebase search | Any | codebase-researcher |
| Effect API lookup | Any | mcp-researcher |
| Error fixing | Any | package-error-fixer |

---

## Context Impact Analysis

| Agent Type | Context Consumed by Orchestrator | Notes |
|------------|----------------------------------|-------|
| Research agents | ~500-1000 tokens (summary) | Agent does work, returns summary |
| Report agents | ~200-500 tokens (file path) | Agent writes file, returns path |
| Execution agents | ~200-500 tokens (completion) | Agent writes files, returns status |

**Key Insight**: Delegating to sub-agents reduces orchestrator context consumption by 10-50x compared to doing work directly.

---

## Anti-Pattern Examples

### Wrong: Orchestrator Doing Research

```
Orchestrator:
Let me find the service patterns...
[Glob: packages/iam/**/*.ts] → 50 files
[Read: file1.ts] → 200 lines
[Read: file2.ts] → 150 lines
[Grep: "Effect.Service"] → 20 matches
[Read: file3.ts] → 300 lines
...
Context consumed: ~10,000 tokens
```

### Right: Delegated Research

```
Orchestrator:
I need to understand service patterns.
[Task: codebase-researcher]
"Find all Effect.Service definitions in packages/iam/
 and summarize the patterns used."

Agent returns: 500-token summary
Context consumed: ~1,000 tokens
```

**Savings**: 10x reduction in context consumption.
