# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 execution.

---

## Prompt

You are executing Phase 0 (Codebase Inventory) of the Canonical Naming Conventions spec.

### Context

This is a RESEARCH spec focused on understanding existing naming patterns before defining standards. Phase 0 audits the current state - NO normative recommendations yet.

### Your Mission

Create comprehensive documentation of existing naming patterns in `beep-effect`.

### Deliverables

1. `specs/canonical-naming-conventions/outputs/existing-patterns-audit.md`
2. `specs/canonical-naming-conventions/outputs/file-category-inventory.md`
3. `specs/canonical-naming-conventions/outputs/inconsistency-report.md`

### Research Tasks

**Task 0.1: Postfix Pattern Analysis**
Delegate to `codebase-researcher`:
```
Research all file naming postfix patterns in packages/.

Questions to answer:
1. What .*.ts patterns exist? (e.g., .model.ts, .types.ts, .service.ts)
2. For each pattern: file count, package distribution, example paths
3. What files have NO semantic postfix but could benefit from one?

Output: Summary of all postfix patterns with quantitative data.
```

**Task 0.2: Folder Casing Analysis**
Delegate to `codebase-researcher`:
```
Analyze folder naming casing conventions in packages/.

Questions to answer:
1. What casing do entity folders use? (ApiKey vs api-key)
2. What casing do feature modules use?
3. Map casing patterns to architectural layers (domain/tables/infra/client/ui)

Output: Casing pattern distribution by layer with examples.
```

**Task 0.3: Barrel Export Pattern Analysis**
Delegate to `codebase-researcher`:
```
Analyze barrel export patterns in packages/.

Questions to answer:
1. Which modules use mod.ts + index.ts namespace pattern?
2. Which modules use direct exports in index.ts?
3. What's the adoption rate of each pattern?
4. Are there hybrid patterns?

Output: Barrel pattern inventory with adoption metrics.
```

**Task 0.4: Layer-Specific File Types**
Delegate to `codebase-researcher`:
```
For each architectural layer, catalog typical file types:

Layers: domain, tables, infra/server, client, ui

Questions to answer:
1. What file types are common in each layer?
2. What postfixes are layer-specific vs cross-cutting?
3. What patterns exist but aren't formally named?

Output: Layer-to-file-type mapping with postfix associations.
```

### Output Format

Each deliverable should be markdown with:
- Quantitative data (counts, percentages)
- Representative examples
- No normative judgments (save those for Phase 2)

### Verification

After creating artifacts:
1. Verify file counts via grep commands
2. Update `REFLECTION_LOG.md` with Phase 0 learnings
3. Ensure all three deliverables exist

### Handoff Document

Full context: `specs/canonical-naming-conventions/handoffs/HANDOFF_P0.md`

### Success Criteria

- [ ] `outputs/existing-patterns-audit.md` created
- [ ] `outputs/file-category-inventory.md` created
- [ ] `outputs/inconsistency-report.md` created
- [ ] `REFLECTION_LOG.md` updated with Phase 0 learnings
- [ ] Patterns documented with verifiable counts

### Next Steps

After completing Phase 0:
1. Create `handoffs/HANDOFF_P1.md` with Phase 0 findings summary
2. Create `handoffs/P1_ORCHESTRATOR_PROMPT.md` for external research phase
