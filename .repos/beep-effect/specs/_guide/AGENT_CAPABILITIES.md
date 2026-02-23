# Agent Capability Matrix

> Quick reference for selecting the right agent for each task type.
> For machine-readable version, see `.claude/agents-manifest.yaml`

---

## By Task Type

| Task | Primary Agent | Fallback | Prerequisites | Tier |
|------|---------------|----------|---------------|------|
| Code exploration | `Explore` | `codebase-researcher` | None | 1 |
| Systematic codebase analysis | `codebase-researcher` | None | None | 1 |
| Effect docs lookup | `mcp-researcher` | `effect-researcher` | MCP config | 2 |
| Web research | `web-researcher` | None | None | 2 |
| Code review | `code-reviewer` | None | Guidelines | 3 |
| Architecture audit | `architecture-pattern-enforcer` | None | None | 3 |
| Spec review | `spec-reviewer` | None | Spec structure | 3 |
| TSConfig audit | `tsconfig-auditor` | None | None | 3 |
| Test generation | `test-writer` | None | `@beep/testkit` | 4 |
| Documentation | `doc-writer` | None | Effect patterns | 4 |
| Error fixing | `package-error-fixer` | None | Package context | 4 |
| JSDoc fixing | `jsdoc-fixer` | None | None | 4 |
| Reflection/learning | `reflector` | None | REFLECTION_LOG | 1 |
| Prompt improvement | `prompt-refiner` | `ai-trends-researcher` | Reflection output | 1 |

---

## By Capability

| Capability | Agents | Output Type |
|------------|--------|-------------|
| **read-only** | `codebase-researcher`, `mcp-researcher`, `web-researcher`, `effect-researcher`, `effect-predicate-master` | none |
| **write-reports** | `reflector`, `code-reviewer`, `architecture-pattern-enforcer`, `spec-reviewer`, `tsconfig-auditor` | `outputs/*.md` |
| **write-files** | `doc-writer`, `test-writer`, `package-error-fixer`, `jsdoc-fixer`, `prompt-refiner` | source files |

---

## Selection Rules

### 1. Need to explore code?

```
quick search      → Explore (parallel decomposition)
systematic map    → codebase-researcher (dependency mapping)
```

### 2. Need Effect API docs?

```
MCP available     → mcp-researcher (authoritative)
MCP unavailable   → effect-researcher (fallback)
```

### 3. Need to write tests?

```
always            → test-writer (always use @beep/testkit)
```

### 4. Need to fix errors?

```
per-package       → package-error-fixer (systematic)
single file       → orchestrator may handle directly
```

### 5. Need documentation?

```
README/AGENTS.md  → doc-writer
JSDoc only        → jsdoc-fixer
```

### 6. Need validation?

```
code patterns     → code-reviewer
architecture      → architecture-pattern-enforcer
spec quality      → spec-reviewer
tsconfig          → tsconfig-auditor
```

---

## Phase-Based Selection

| Phase | Appropriate Agents | Purpose |
|-------|-------------------|---------|
| **P0 (Scaffold)** | `doc-writer`, `architecture-pattern-enforcer` | Initial structure |
| **P1 (Discovery)** | `codebase-researcher`, `mcp-researcher`, `web-researcher` | Research |
| **P2 (Evaluation)** | `code-reviewer`, `architecture-pattern-enforcer`, `spec-reviewer` | Quality |
| **P3 (Synthesis)** | `reflector`, `doc-writer` | Learning capture |
| **P4+ (Iteration)** | `test-writer`, `doc-writer`, `package-error-fixer` | Implementation |

---

## Anti-Patterns

❌ **Don't use read-only agents when you need output**
```
# WRONG - codebase-researcher produces no artifact
"Use codebase-researcher to create a report"

# RIGHT - code-reviewer produces reports
"Use code-reviewer to produce guideline-review.md"
```

❌ **Don't use wrong agent for output type**
```
# WRONG - test-writer doesn't create README
"Use test-writer to document the API"

# RIGHT - doc-writer creates documentation
"Use doc-writer to document the API"
```

❌ **Don't skip MCP prerequisites**
```
# WRONG - mcp-researcher requires MCP server
"Look up Effect docs" (without checking MCP status)

# RIGHT - check prerequisites first
"Verify MCP config, then use mcp-researcher"
```

---

## Quick Decision Tree

```
Need output file?
├─ No → Read-only agent (codebase-researcher, mcp-researcher, etc.)
└─ Yes → What type?
    ├─ Report → code-reviewer, architecture-pattern-enforcer, reflector
    ├─ Documentation → doc-writer, jsdoc-fixer
    ├─ Tests → test-writer
    └─ Code fixes → package-error-fixer
```

---

## See Also

- `.claude/agents-manifest.yaml` - Machine-readable manifest
- `.claude/agents/*.md` - Individual agent definitions
- `specs/_guide/README.md` - Spec creation guide
