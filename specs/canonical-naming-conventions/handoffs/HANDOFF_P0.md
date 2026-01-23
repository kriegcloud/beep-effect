# Phase 0 Handoff: Codebase Inventory

> Complete context for Phase 0 execution.

---

## Mission

Perform a comprehensive audit of existing file naming patterns, folder structures, and export conventions in the `beep-effect` monorepo.

## Context

This is a research spec, NOT implementation. The goal is to understand the current state before defining standards.

### Key Observation Points

1. **File Postfixes**: What `.category.ts` patterns exist?
2. **Folder Casing**: PascalCase vs lowercase vs kebab-case
3. **Barrel Exports**: `mod.ts` vs `index.ts` patterns
4. **Architectural Layers**: domain → tables → server → client → ui

### Known Patterns (from README)

| Pattern | Example | Prevalence |
|---------|---------|------------|
| `.model.ts` | `ApiKey.model.ts` | High (domain entities) |
| `.types.ts` | `or.types.ts` | Medium (common/types) |
| `.provider.tsx` | `break-points.provider.tsx` | Medium (ui providers) |
| `mod.ts` | `sign-in/mod.ts` | Growing (newer modules) |

## Deliverables

### 1. `outputs/existing-patterns-audit.md`

Document ALL naming patterns with:
- Pattern description
- File count using pattern
- Package distribution
- Example paths

### 2. `outputs/file-category-inventory.md`

Exhaustive list of file categories:
- By architectural layer
- By semantic purpose
- By module type

### 3. `outputs/inconsistency-report.md`

Identify:
- Casing inconsistencies
- Postfix variations for same purpose
- Missing/redundant patterns

## Research Tasks

### Task 0.1: Postfix Pattern Analysis

```bash
# Find all unique postfix patterns
# Delegate to codebase-researcher
```

Questions:
- What `.*.ts` patterns exist?
- How consistently are they used?
- What purposes lack postfixes?

### Task 0.2: Folder Casing Analysis

```bash
# Analyze folder name casing
# Delegate to codebase-researcher
```

Questions:
- What casing do entity folders use?
- What casing do feature modules use?
- Are there cross-layer inconsistencies?

### Task 0.3: Barrel Export Pattern Analysis

```bash
# Find mod.ts and index.ts usage
# Delegate to codebase-researcher
```

Questions:
- Which modules use `mod.ts` + `index.ts` namespace pattern?
- Which modules use direct exports in `index.ts`?
- What's the adoption rate of the namespace pattern?

### Task 0.4: Layer-Specific Patterns

For each layer (domain, tables, infra, client, ui):
- What file types are typical?
- What naming conventions dominate?
- What postfixes are layer-specific?

## Agent Delegation

| Task | Agent | Capability |
|------|-------|------------|
| 0.1-0.4 | codebase-researcher | read-only |
| Artifact creation | orchestrator | write-files |

## Verification

After completing artifacts:
- [ ] All deliverables exist in `outputs/`
- [ ] Pattern counts are verifiable via grep
- [ ] No subjective recommendations (research only)
- [ ] REFLECTION_LOG.md updated

## Success Criteria

- Comprehensive inventory (>90% of unique patterns documented)
- Quantitative data (file counts, percentages)
- No normative judgments (save for Phase 2)

## Next Phase

After Phase 0 completes, proceed to Phase 1 (External Research) using `P1_ORCHESTRATOR_PROMPT.md`.
