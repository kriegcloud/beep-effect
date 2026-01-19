# Phase 0 Orchestrator Prompt: Legacy Spec Alignment

**Spec**: `specs/legacy-spec-alignment/`
**Phase**: 0 (Analysis)
**Objective**: Inventory all specs and catalog specific violations against canonical patterns

---

## Context

The `orchestrator-context-optimization` spec (now COMPLETE) established canonical patterns for spec creation:

| Pattern | Source | Key Constraint |
|---------|--------|----------------|
| Phase sizing | SPEC_CREATION_GUIDE.md line 619 | Max 7 work items per phase |
| Delegation rules | SPEC_CREATION_GUIDE.md line 59 | Mandatory delegation matrix |
| Context budget | HANDOFF_STANDARDS.md line 40 | Green/Yellow/Red zones |
| Handoff chain | HANDOFF_STANDARDS.md line 528 | Every phase produces handoff |

Existing specs were written before these patterns and need alignment.

---

## Work Items (5)

### 1. Spec Inventory
**DELEGATE TO**: `codebase-researcher`
```
Prompt: "List all spec directories in specs/ that contain a README.md.
For each, extract: spec name, status, number of phases defined in MASTER_ORCHESTRATION.md"
```

### 2. Phase Count Analysis
**DELEGATE TO**: `codebase-researcher`
```
Prompt: "For each spec with a MASTER_ORCHESTRATION.md, count work items
per phase. Work items are typically numbered lists (1., 2., etc.) or
bullet points under 'Work Items' headers. Report: spec, phase, count"
```

### 3. Violation Catalog
**DIRECT (orchestrator)**: Synthesize agent results into violation table:
```markdown
| Spec | Phase | Items | Violation Type |
|------|-------|-------|----------------|
| knowledge-graph-integration | P0 | 15 | Exceeds limit by 8 |
```

### 4. Handoff Chain Audit
**DELEGATE TO**: `codebase-researcher`
```
Prompt: "For each spec, list files in handoffs/ directory. Compare
against phases in MASTER_ORCHESTRATION.md. Report missing HANDOFF_P[N].md files"
```

### 5. Alignment Plan
**DIRECT (orchestrator)**: Prioritize specs by severity:
- High: >10 items in any phase
- Medium: 8-10 items
- Low: Exactly 8 items (only 1 over)

---

## Delegation Matrix

| Task | Delegate To | Never Do Directly |
|------|-------------|-------------------|
| Multi-spec file listing | `codebase-researcher` | Sequential Glob/Read |
| Work item counting | `codebase-researcher` | Manual file reads |
| Violation synthesis | Direct | N/A (orchestrator task) |
| Priority assignment | Direct | N/A (orchestrator task) |

---

## Context Budget Protocol

| Metric | Green | Yellow | Red (STOP!) |
|--------|-------|--------|-------------|
| Direct tool calls | 0-10 | 11-15 | 16+ |
| Large file reads | 0-2 | 3-4 | 5+ |
| Sub-agent delegations | 0-5 | 6-8 | 9+ |

**If Yellow**: Consider creating interim checkpoint
**If Red**: STOP immediately, create handoff before continuing

---

## Exit Criteria

- [ ] All specs in `specs/` catalogued
- [ ] Work item counts documented per phase
- [ ] Violations identified with specific counts
- [ ] Missing handoffs listed
- [ ] Priority ranking established

---

## Expected Outputs

### 1. `outputs/spec-inventory.md`
Complete inventory of all specs with metadata.

### 2. `outputs/violation-catalog.md`
Table of all phase sizing violations.

### 3. `handoffs/HANDOFF_P1.md`
Handoff for Phase 1 (knowledge-graph-integration alignment) containing:
- Specific violations to fix
- Files to modify
- Target phase structure

### 4. `handoffs/HANDOFF_P2.md`
Handoff for Phase 2 (rls-implementation alignment) containing:
- Specific violations to fix
- Files to modify
- Target phase structure

---

## Quick Start Commands

```bash
# View all specs
ls -la specs/*/README.md

# Check for MASTER_ORCHESTRATION files
ls specs/*/MASTER_ORCHESTRATION.md 2>/dev/null

# Count handoff files per spec
for d in specs/*/; do echo "$d: $(ls $d/handoffs/*.md 2>/dev/null | wc -l)"; done
```

---

## Anti-Patterns to Avoid

1. **Don't read specs directly** - Delegate to codebase-researcher
2. **Don't count manually** - Agent can pattern-match work items
3. **Don't create P1/P2 handoffs late** - Plan them from start
4. **Don't fix violations in this phase** - Analysis only

---

## Success Verification

At phase completion, verify:
```bash
# Outputs exist
ls specs/legacy-spec-alignment/outputs/

# Handoffs exist
ls specs/legacy-spec-alignment/handoffs/HANDOFF_P1.md
ls specs/legacy-spec-alignment/handoffs/HANDOFF_P2.md
```

---

## Notes for Orchestrator

1. **Parallel potential**: After P0, P1 and P2 can run in parallel
2. **Self-referential**: orchestrator-context-optimization is optional to fix (it defined the rules)
3. **Preservation**: Don't change spec outcomes, only structure
4. **Conservative splits**: When splitting phases, keep related items together
