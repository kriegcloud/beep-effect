# Handoff — Phase 3: Index Enhancement

> Context document for Phase 3 implementation.

---

## Context Budget Status

| Memory Type | Est. Tokens | Budget | Status |
|-------------|-------------|--------|--------|
| Working | TBD | ≤2,000 | ⏳ Pending |
| Episodic | TBD | ≤1,000 | ⏳ Pending |
| Semantic | ~200 | ≤500 | ✅ OK |
| Procedural | Links | N/A | ✅ OK |
| **Total** | **TBD** | **≤4,000** | **⏳ Pending** |

> ⚠️ This handoff will be fully populated when Phase 2 completes.

---

## Working Context (≤2K tokens)

### Phase 3 Mission

Enhance root AGENTS.md with comprehensive navigation to all agent resources.

### Tasks

| ID | Task | Agent | Output |
|----|------|-------|--------|
| 3.1 | Audit current AGENTS.md | codebase-researcher | Gap analysis |
| 3.2 | Design index structure | Orchestrator (direct) | Structure proposal |
| 3.3 | Update AGENTS.md | doc-writer | Enhanced `AGENTS.md` |
| 3.4 | Update package AGENTS.md files | agents-md-updater | Cross-references added |

### Success Criteria

- [ ] Context Navigation section added to AGENTS.md
- [ ] All context files linked
- [ ] Skills linked by category
- [ ] Specs linked by status
- [ ] `bun run check` passes
- [ ] REFLECTION_LOG.md updated

### Blocking Issues

*To be identified during Phase 2 completion.*

---

## Episodic Context (≤1K tokens)

### Phase 2 Summary

*To be filled by Phase 2 orchestrator with:*
- Context files generated
- Module coverage achieved
- Any gaps identified

---

## Semantic Context (≤500 tokens)

### Index Structure

```markdown
## Context Navigation

### Library Reference
| Library | Subtree | Key Modules |
|---------|---------|-------------|
| Effect | `.repos/effect/` | Effect, Schema, Layer, ... |

### Skills by Category
| Category | Skills |
|----------|--------|
| Domain Modeling | domain-modeling, pattern-matching |
| Services | service-implementation, layer-design |

### Specs by Status
| Status | Specs |
|--------|-------|
| Active | agent-context-optimization |
```

---

## Procedural Context (Links only)

| Resource | Path | Purpose |
|----------|------|---------|
| Master Orchestration | `MASTER_ORCHESTRATION.md` | Full Phase 3 workflow |
| Context Index | `context/INDEX.md` | Generated context catalog |
| Skills Manifest | `.claude/agents-manifest.yaml` | Agent capabilities |

---

## Exit to Phase 4

After completing Phase 3:
1. Update REFLECTION_LOG.md with learnings
2. Populate `handoffs/HANDOFF_P4.md` with P3 results
3. Verify `handoffs/P4_ORCHESTRATOR_PROMPT.md` is ready
