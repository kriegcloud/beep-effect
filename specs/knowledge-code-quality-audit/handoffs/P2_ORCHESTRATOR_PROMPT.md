# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 synthesis.

---

## Prompt

You are orchestrating Phase 2 of the `knowledge-code-quality-audit` spec.

### Context

Phase 1 completed successfully with 18 violation reports containing ~240 total violations. Your mission is to synthesize these into a prioritized remediation plan.

**Source Reports**: `specs/knowledge-code-quality-audit/outputs/violations/V*.md`

### Your Mission

1. Read all 18 violation reports
2. Create a master violations document
3. Establish fix dependencies and priorities
4. Output a remediation roadmap

### Step 1: Read All Reports

```bash
ls specs/knowledge-code-quality-audit/outputs/violations/
```

Read each report to extract:
- Total violation count
- Files affected
- Severity level
- Any noted dependencies

### Step 2: Create Master Document

Write to: `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`

Structure:
```markdown
# Master Violations Report

## Executive Summary
- Total violations: ~240
- Critical: 3
- High: ~60
- Medium: ~150
- Low/Info: ~30

## Hotspot Files
[Table of files with most violations]

## Violation Index
[Quick-reference table with counts and severity]

## By-File View
[All violations grouped by file path]

## Dependency Graph
[Which fixes must come before others]

## Remediation Phases
[Proposed fix order with rationale]
```

### Step 3: Establish Dependencies

Known dependencies from Phase 1:
- V02 → V03, V15 (fix duplicates before string methods)
- V12 → V11 (fix Map before non-null assertions on Map.get())
- V09 → V11 (fix Set before Set-related assertions)

### Step 4: Create Remediation Roadmap

Proposed phases:
1. **Foundation** (V02, V06): Extract duplicates, fix critical errors
2. **Type Safety** (V01, V04, V14): EntityId typing and creation
3. **Data Structures** (V09, V12): Native Set/Map migrations
4. **Method Patterns** (V03, V05, V10, V11, V13, V15): Array/String methods
5. **Modernization** (V07, V08, V16, V18): Match, Record, DateTime
6. **Optimization** (V17): Chunk candidates (optional)

### Success Criteria

- [ ] `MASTER_VIOLATIONS.md` created with all sections
- [ ] All ~240 violations accounted for
- [ ] Dependencies documented
- [ ] Clear remediation phase assignments
- [ ] Effort estimates included

### Handoff Document

Read full context in: `specs/knowledge-code-quality-audit/handoffs/HANDOFF_P2.md`

### Next Phase

After completing Phase 2:
1. Update `REFLECTION_LOG.md` with synthesis learnings
2. Create `handoffs/HANDOFF_P3.md` (remediation phase context)
3. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md` (remediation phase prompt)
