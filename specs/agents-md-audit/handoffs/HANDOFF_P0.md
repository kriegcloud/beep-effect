# Phase 0 Handoff: Comprehensive Documentation Audit

> **Phase Status**: ✅ Complete
> **Completed**: 2026-01-22
> **Next Phase**: P1 (Fix Documentation Inconsistencies)

---

## What Was Done

### Audit Scope
Performed exhaustive audit of all documentation and agent configuration across:

1. **Agent Definitions** (21 files in `.claude/agents/`)
2. **Package AGENTS.md** (40+ files across all packages)
3. **Specs Structure** (10 specs in `specs/`)
4. **Documentation Patterns** (6 files in `documentation/patterns/`)
5. **Rules & CLAUDE.md** (5 files cross-referenced)
6. **MCP Tool Shortcuts** (9 files with improper declarations)

### Methodology
- Launched 5 parallel exploration agents for comprehensive coverage
- Used grep pattern matching for known problematic strings
- Cross-referenced package.json names against documentation
- Verified file existence for all path references
- Checked handoff file pairing compliance

---

## Key Findings

### Critical Issues (4)
1. `specs/README.md` references non-existent `iam-client-method-wrappers` spec
2. 4 missing orchestrator prompts block phase execution across 2 specs
3. `service-patterns.md` referenced but doesn't exist
4. `specs/agents/` missing required REFLECTION_LOG.md

### High Priority Issues (50+)
- 6 agent files with MCP tool shortcuts in `tools:` declarations
- 20+ files with stale `@beep/core-*` package references
- 18 files with old spec guide paths (pre-consolidation)
- 24 references to deleted specs (ai-friendliness-audit, jetbrains-mcp-skill)
- Missing slices in architecture auditor (calendar, knowledge)

### Medium Priority Issues (20+)
- Testing rules duplicated in 3 locations
- Code quality rules incomplete in CLAUDE.md
- Commands table duplicated
- Non-standard Effect Schema APIs in examples

---

## Outputs Produced

| File | Description |
|------|-------------|
| `outputs/comprehensive-documentation-audit-2026-01-22.md` | Full audit report with 130+ issues |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | Copy-paste prompt for Phase 1 |
| `handoffs/HANDOFF_P0.md` | This file |

---

## Context for Phase 1

### Priority Order
1. **TIER 1 (Critical)**: 5 issues that block workflows or break links
2. **TIER 2 (High)**: 5 categories of stale/incorrect references
3. **TIER 3 (Medium)**: Cleanup and standardization

### Key Patterns to Fix

| Pattern | Replacement | Count |
|---------|-------------|-------|
| `specs/SPEC_CREATION_GUIDE.md` | `specs/_guide/README.md` | 33+ |
| `specs/HANDOFF_STANDARDS.md` | `specs/_guide/HANDOFF_STANDARDS.md` | 15+ |
| `ai-friendliness-audit` | `canonical-naming-conventions` or remove | 18 |
| `mcp__effect_docs__*` in tools: | Remove lines | 6 files |

### Verification Strategy
```bash
# After each tier, run these checks:
grep -r "specs/SPEC_CREATION_GUIDE" --include="*.md" .
grep -r "ai-friendliness-audit" --include="*.md" . | grep -v outputs/
grep -r "mcp__" .claude/agents/
bun run check
```

---

## Risks & Considerations

1. **Historical Handoffs**: Some old references are in historical handoff documents (completed specs). Consider adding deprecation notices rather than updating all content.

2. **Parallel Fixes**: Multiple files reference the same patterns. Use `Edit` tool with `replace_all: true` where appropriate.

3. **Breaking Changes**: Verify `bun run check` passes after major edits.

---

## Success Metrics for Phase 1

- [ ] All TIER 1 critical issues resolved (5)
- [ ] All TIER 2 high priority issues resolved (5 categories)
- [ ] Verification grep commands return no unexpected matches
- [ ] `bun run check` passes
- [ ] `bun run lint:fix` completes

---

## Handoff Complete

Phase 1 orchestrator prompt ready at:
```
specs/agents-md-audit/handoffs/P1_ORCHESTRATOR_PROMPT.md
```
