# Phase 1 Handoff: Violation Inventory

**Date**: 2026-01-22
**From**: Phase 0 (Spec Creation)
**To**: Phase 1 (Parallel Violation Inventory)
**Status**: Ready for execution

---

## Context for Phase 1

### Working Context (Critical)

**Mission**: Deploy 18 parallel sub-agents to inventory ALL Effect pattern violations in `packages/knowledge/*`.

**Success Criteria**:
- [ ] All 18 violation reports created in `outputs/violations/`
- [ ] Each report has exact file:line references
- [ ] Total violation count documented per category
- [ ] Zero false positives

**Blocking Issues**: None - this is the first execution phase.

### Episodic Context

**Origin**: Violations discovered during `specs/knowledge-completion` Phase 7-8 implementation.

**Key Decision**: Use parallel sub-agent deployment (18 agents simultaneously) to maximize throughput and isolate failures.

### Semantic Context

**Tech Stack**: Effect 3, TypeScript, Bun
**Architecture**: Vertical slice in `packages/knowledge/{domain,tables,server,client,ui}`
**Source of Truth**: `.claude/rules/effect-patterns.md`

### Procedural Context (Links)

- Effect patterns: `.claude/rules/effect-patterns.md`
- Agent prompts: `specs/knowledge-code-quality-audit/AGENT_PROMPTS.md`
- Report template: `specs/knowledge-code-quality-audit/templates/violation-report.template.md`
- Rubrics: `specs/knowledge-code-quality-audit/RUBRICS.md`

---

## Violation Categories to Inventory

| ID | Category | Grep Pattern | Severity |
|----|----------|--------------|----------|
| V01 | EntityId Table Typing | `pg\.text.*_id.*notNull` without `.$type<` | High |
| V02 | Duplicate Code | `extractLocalName` definitions | Medium |
| V03 | Native String Methods | `\.lastIndexOf\(`, `\.slice\(` | High |
| V04 | Error Construction | `_tag:.*Error.*as.*Error` | High |
| V05 | Array Emptiness | `\.length\s*===?\s*0` | Medium |
| V06 | Native Error | `new Error\(`, `Effect\.die\(new Error` | Critical |
| V07 | Switch Statements | `switch\s*\(` | Medium |
| V08 | Object.entries | `Object\.entries\(` | Medium |
| V09 | Native Set | `new Set\(`, `new Set<` | Medium |
| V10 | Native Array.map | `\.map\(` (array context) | High |
| V11 | Non-null Assertions | `\w\+!\\.`, `\]\!` | High |
| V12 | Native Map | `new Map\(`, `new Map<` | Medium |
| V13 | Native Array.sort | `\.sort\(` | Medium |
| V14 | EntityId Creation | `crypto\.randomUUID\(\)` | High |
| V15 | String.toLowerCase | `\.toLowerCase\(\)` | Low |
| V16 | Native Date | `Date\.now\(\)`, `new Date\(` | Medium |
| V17 | Array vs Chunk | Candidates (manual assessment) | Info |
| V18 | Empty Array Init | `=\s*\[\];`, `: Array<.*>\s*=\s*\[\]` | Low |

---

## Agent Deployment Instructions

### Step 1: Prepare Outputs Directory

```bash
mkdir -p specs/knowledge-code-quality-audit/outputs/violations
```

### Step 2: Launch All 18 Agents in Parallel

**CRITICAL**: Use a SINGLE message with 18 Task tool calls.

For each agent:
- `subagent_type: "general-purpose"`
- `prompt`: Full prompt from `AGENT_PROMPTS.md` for that category
- `run_in_background: true` (optional, for parallel execution)

### Step 3: Collect Results

Wait for all agents to complete. Use `TaskOutput` to retrieve results.

### Step 4: Verify Reports

Check that all 18 files exist:
```bash
ls specs/knowledge-code-quality-audit/outputs/violations/
# Should show: V01-*.md, V02-*.md, ... V18-*.md
```

---

## Known Files of Interest

Based on `knowledge-completion` findings, these files likely contain violations:

| File | Expected Violations |
|------|---------------------|
| `packages/knowledge/tables/src/tables/*.table.ts` | V01 |
| `packages/knowledge/server/src/Embedding/EmbeddingService.ts` | V04 |
| `packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts` | V06, V07, V08, V09, V10, V11 |
| `packages/knowledge/server/src/EntityResolution/EntityClusterer.ts` | V13 |
| `packages/knowledge/server/src/EntityResolution/SameAsLinker.ts` | V14 |
| `packages/knowledge/server/src/Extraction/EntityExtractor.ts` | V15 |
| `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts` | V16 |

---

## Quality Gates

After all agents complete:

1. **Completeness Check**: All 18 reports exist
2. **Format Check**: Each report follows template
3. **Accuracy Spot-Check**: Manually verify 2-3 violations per report
4. **Scoring**: Apply rubric from `RUBRICS.md`

Minimum quality: 70/100 per report

---

## Next Phase Preparation

After Phase 1 completes:
1. Update `REFLECTION_LOG.md` with inventory phase learnings
2. Create `HANDOFF_P2.md` for synthesis phase
3. Create `P2_ORCHESTRATOR_PROMPT.md`

---

## Emergency Protocols

### If Agent Fails

1. Check error message
2. Refine grep pattern in `AGENT_PROMPTS.md`
3. Re-run single agent

### If False Positives High

1. Add exclusion patterns to agent prompt
2. Document in remediation notes
3. Manual filtering acceptable for V10, V11 (high noise patterns)

### If Timeout

1. Split scope: `packages/knowledge/server/src/` first
2. Then other directories
3. Merge results
