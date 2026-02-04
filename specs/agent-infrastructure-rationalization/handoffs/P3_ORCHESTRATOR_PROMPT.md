# P3 Orchestrator Prompt: Discoverability Enhancement

You are executing Phase 3 of the `agent-infrastructure-rationalization` spec.

---

## Context

P0-P2 established baseline, analyzed redundancies, and designed target architecture:
- **31 agents** → **28 agents** (1 merge, 2 removals, 10 additions)
- **53 skills** across 6 directories → single authoritative source
- **Cursor rules** have 38-53% content loss (needs re-sync)
- **~10% token savings** from CLAUDE.md consolidation

P3 creates navigation tools for agents to find relevant context efficiently.

---

## Your Mission

Create discoverability enhancements with these deliverables:

1. **AGENT_CAPABILITIES.md**: Matrix mapping tasks to agents
2. **discovery-kit skill**: Glob/Grep patterns for efficient search
3. **validate-handoff.sh**: Token budget enforcement script
4. **P3_DISCOVERABILITY.md**: Implementation summary
5. **P4 handoff documents**: HANDOFF_P4.md + P4_ORCHESTRATOR_PROMPT.md (REQUIRED)

---

## Agent Usage

| Agent | Task |
|-------|------|
| codebase-researcher | Audit current agent usage in specs |
| doc-writer | Create capability matrix |
| doc-writer | Create discovery-kit skill |

---

## Deliverable Specifications

### 1. Agent Capability Matrix

**Location**: `specs/_guide/AGENT_CAPABILITIES.md`

```markdown
# Agent Capability Matrix

> Quick reference for selecting the right agent for each task type.

## By Task Type

| Task | Primary Agent | Fallback | Prerequisites | Tier |
|------|---------------|----------|---------------|------|
| Code exploration | Explore | codebase-researcher | None | 1 |
| Effect docs lookup | mcp-researcher | effect-researcher | MCP config | 2 |
| Web research | web-researcher | None | None | 2 |
| Code review | code-reviewer | None | Guidelines | 3 |
| Architecture audit | architecture-pattern-enforcer | None | None | 3 |
| Test generation | test-writer | None | @beep/testkit | 4 |
| Documentation | doc-writer | None | Effect patterns | 4 |
| Error fixing | package-error-fixer | None | Package context | 4 |
| Reflection | reflector | None | REFLECTION_LOG | 1 |

## By Capability

| Capability | Agents | Output Type |
|------------|--------|-------------|
| read-only | codebase-researcher, mcp-researcher, web-researcher, effect-researcher | none |
| write-reports | reflector, code-reviewer, architecture-pattern-enforcer, spec-reviewer | outputs/*.md |
| write-files | doc-writer, test-writer, package-error-fixer, jsdoc-fixer | source files |

## Selection Rules

1. **Need to explore code?** → Explore (quick) or codebase-researcher (systematic)
2. **Need Effect API docs?** → mcp-researcher (MCP) or effect-researcher (fallback)
3. **Need to write tests?** → test-writer (always use @beep/testkit)
4. **Need to fix errors?** → package-error-fixer (systematic per-package)
5. **Need documentation?** → doc-writer (README, AGENTS.md, JSDoc)
```

### 2. Discovery Kit Skill

**Location**: `.claude/skills/discovery-kit/SKILL.md`

```markdown
# Discovery Kit

> Efficient patterns for finding files and content in the codebase.

## File Discovery (Glob)

### Find by Pattern
\`\`\`bash
# Find all TypeScript files in a package
**/*.ts

# Find test files
**/test/**/*.test.ts

# Find configuration files
**/tsconfig*.json
\`\`\`

### Common Patterns
| Pattern | Purpose |
|---------|---------|
| `packages/*/src/**/*.ts` | All source files |
| `packages/*/{AGENTS,README}.md` | Package documentation |
| `.claude/agents/*.md` | Agent definitions |
| `.claude/skills/*/SKILL.md` | Skill definitions |

## Content Search (Grep)

### Find by Content
\`\`\`typescript
// Find all Effect.gen usage
pattern: "Effect\\.gen"
type: "ts"

// Find all Schema definitions
pattern: "S\\.Struct|S\\.Class"
type: "ts"

// Find all Layer.provide
pattern: "Layer\\.provide"
type: "ts"
\`\`\`

## Anti-Patterns (AVOID)

❌ **Never use Bash for discovery**
\`\`\`bash
# BAD - 10x slower, less accurate
find . -name "*.ts" | xargs grep "Effect"
\`\`\`

✅ **Always use Glob + Grep tools**
\`\`\`
Glob: **/*.ts
Grep: Effect\\.gen
\`\`\`

## Verification Sequences

### Package Exists
1. Glob: `packages/{name}/package.json`
2. Read: Verify name matches

### Export Exists
1. Glob: `packages/{package}/src/**/*.ts`
2. Grep: `export.*{name}`
3. Read: Verify signature
```

### 3. Token Budget Validator

**Location**: `specs/_guide/scripts/validate-handoff.sh`

```bash
#!/bin/bash
# validate-handoff.sh - Enforce ≤4K token limit on handoff documents
#
# Usage: ./validate-handoff.sh path/to/handoff.md

set -e

FILE="$1"

if [ -z "$FILE" ]; then
    echo "Usage: $0 <handoff-file>"
    exit 1
fi

if [ ! -f "$FILE" ]; then
    echo "ERROR: File not found: $FILE"
    exit 1
fi

WORD_COUNT=$(wc -w < "$FILE")
# Approximate: ~1.33 tokens per word for markdown
TOKEN_ESTIMATE=$((WORD_COUNT * 4 / 3))

if [ "$TOKEN_ESTIMATE" -gt 4000 ]; then
    echo "❌ FAILED: Handoff exceeds 4K token budget"
    echo "   Estimated tokens: $TOKEN_ESTIMATE"
    echo "   Budget: 4000"
    echo ""
    echo "Suggestions:"
    echo "   - Move detailed content to outputs/"
    echo "   - Use links instead of inline content"
    echo "   - Split into multiple documents"
    exit 1
fi

echo "✅ PASSED: $TOKEN_ESTIMATE tokens (budget: 4000)"
```

### 4. P3 Implementation Summary

**Location**: `outputs/P3_DISCOVERABILITY.md`

Document what was created, decisions made, and lessons learned.

### 5. P4 Handoff Documents (REQUIRED)

**CRITICAL**: Phase is NOT complete without these:

- `handoffs/HANDOFF_P4.md` - Context for P4 orchestrator
- `handoffs/P4_ORCHESTRATOR_PROMPT.md` - Instructions for P4

---

## Verification

```bash
# Capability matrix exists
ls specs/_guide/AGENT_CAPABILITIES.md

# Discovery kit skill exists
ls .claude/skills/discovery-kit/SKILL.md

# Token validator exists and works
chmod +x specs/_guide/scripts/validate-handoff.sh
./specs/_guide/scripts/validate-handoff.sh handoffs/HANDOFF_P3.md

# P4 handoff documents exist
ls handoffs/HANDOFF_P4.md handoffs/P4_ORCHESTRATOR_PROMPT.md
```

---

## Success Criteria

- [ ] Agent capability matrix created and accurate
- [ ] Discovery kit skill with Glob/Grep patterns
- [ ] Token validator script working
- [ ] P3 implementation summary documented
- [ ] **P4 handoff documents created** (REQUIRED for phase completion)
- [ ] REFLECTION_LOG.md updated with P3 entry

---

## Phase Completion Protocol

**A phase is NOT complete until:**

1. All exit criteria deliverables exist
2. `handoffs/HANDOFF_P[N+1].md` created
3. `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` created
4. REFLECTION_LOG.md updated with phase entry

This protocol ensures subsequent orchestrators have full context.

---

## Handoff Reference

Full context: `specs/agent-infrastructure-rationalization/handoffs/HANDOFF_P3.md`
