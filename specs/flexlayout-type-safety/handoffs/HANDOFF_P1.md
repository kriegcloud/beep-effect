# FlexLayout Type Safety Handoff — P0 → P1

> Phase 0 (Scaffolding) complete. Ready for Phase 1 (Discovery).

---

## Session Summary: P0 Complete

### What Was Accomplished
- Spec folder structure created following META_SPEC_TEMPLATE
- All core documents scaffolded:
  - README.md, QUICK_START.md, MASTER_ORCHESTRATION.md
  - AGENT_PROMPTS.md, RUBRICS.md, REFLECTION_LOG.md
  - Templates for file-analysis, batch-report, handoff
- Prior context documented (IJsonModel.ts, BorderNode.ts, TabNode.ts fixes)

### Metrics
| Metric | Value |
|--------|-------|
| Files completed (prior) | 3 / 44 |
| Spec documents created | 10 |
| Templates created | 3 |

---

## Lessons Learned from Prior Work

### What Worked
1. **Schema class with extend()** — Clean inheritance for JSON node types
2. **Intermediate mutable object** — Work around readonly Schema properties
3. **decodeUnknownSync for internal data** — Fail-fast catches bugs early

### What Needed Adjustment
- Direct mutations to Schema class instances fail (readonly properties)
- `Partial<SchemaClass>` doesn't work — use `Record<string, unknown>` instead

### Prompt Improvements Applied
- Added `Record<string, unknown>` intermediate pattern to Schema Expert prompts
- Emphasized mutation avoidance with Schema classes

---

## P1 Tasks: Discovery

### Task 1.1: Generate File Inventory (codebase-researcher)

Deploy `codebase-researcher` to scan all 44 files:

```
Scan packages/ui/ui/src/flexlayout-react/ and generate outputs/codebase-context.md.

For each file, identify:
1. File category (Model / View / Utility)
2. Presence of unsafe patterns (any, native methods, type assertions)
3. toJson() methods
4. Estimated issue count

Output format: Markdown table with Status column for tracking.
```

### Task 1.2: Detailed Analysis of Priority Files (effect-researcher)

For each model file with toJson(), deploy `effect-researcher`:

Priority order:
1. `model/Model.ts` — Main model, most complex
2. `model/TabSetNode.ts` — Tab set serialization
3. `model/RowNode.ts` — Row serialization
4. `model/BorderSet.ts` — Border collection
5. `model/Node.ts` — Base node class

Analysis prompt:
```
Analyze [FILE_PATH] for unsafe patterns per specs/flexlayout-type-safety/RUBRICS.md.

Output JSON:
{
  "file": "[path]",
  "summary": { "critical": N, "high": N, "medium": N },
  "issues": [{ "type", "line", "code", "fix", "agent" }],
  "recommendedAgent": "effect-schema-expert | effect-predicate-master"
}
```

### Task 1.3: Self-Reflection Checkpoint

After scanning all files, update REFLECTION_LOG.md:
- Most common unsafe patterns
- Files with highest severity
- Any false positives in detection
- Improvements to scanning prompt

---

## P1 Success Criteria

- [ ] `outputs/codebase-context.md` created with all 44 files
- [ ] Priority model files analyzed with issue counts
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] Ready to proceed to Phase 2 (Evaluation)

---

## Verification Commands

```bash
# No code changes in Phase 1 - just verify spec outputs exist
ls specs/flexlayout-type-safety/outputs/
```

---

## Notes for Next Agent

1. **Read first**: RUBRICS.md defines what patterns to look for
2. **Use standard agents**: `codebase-researcher` for scanning, `effect-researcher` for Effect-specific analysis
3. **Log unusual findings**: If you discover patterns not in RUBRICS.md, add them
4. **Generate handoff**: When done, create HANDOFF_P2.md using templates/handoff.template.md

---

## P1 Orchestrator Prompt

See [P1_ORCHESTRATOR_PROMPT.md](./P1_ORCHESTRATOR_PROMPT.md) for the ready-to-use prompt.
