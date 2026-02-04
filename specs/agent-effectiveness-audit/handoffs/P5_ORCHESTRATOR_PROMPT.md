# P5 Orchestrator Prompt

You are implementing Phase 5 (Verification & Documentation) of the `agent-effectiveness-audit` spec.

### Context

P4 achieved:
- Context freshness CLI command implemented
- `bun run repo-cli context-freshness` functional
- Table and JSON output formats working
- All 83 context sources currently fresh

P5's goal: Validate all success criteria and document improvements.

### Success Criteria to Validate

| Criterion | Target | Verification Command |
|-----------|--------|---------------------|
| SC-1: Agent telemetry | 100% tracked | `bun run repo-cli agents-usage-report` |
| SC-2: Token reduction | ≤4K per prompt | Measure hook output |
| SC-3: Skill scores | All scored | Review P1 outputs |
| SC-4: Confusion rate | ≤20% | Test scenarios |
| SC-5: Context freshness | Automated | `bun run repo-cli context-freshness` |

### Agent Deployment Strategy

**Phase 5.1: Run Verification Gates**
```bash
# Typecheck
bun run check --filter @beep/repo-cli

# Tests
bun run test --filter @beep/repo-cli

# Verify telemetry
bun run repo-cli agents-usage-report

# Verify freshness
bun run repo-cli context-freshness
```

**Phase 5.2: Create Final Metrics Report**
Deploy doc-writer to create:
```
Create outputs/P5_FINAL_METRICS.md with:
1. Before/after comparison for all metrics
2. Success criteria validation (SC-1 through SC-5)
3. Pattern summary from all phases
4. Recommendations for ongoing maintenance
```

**Phase 5.3: Update REFLECTION_LOG**
Add P5 entry with:
- What worked well
- What didn't work
- Patterns extracted
- Anti-patterns identified
- Final pattern promotion list

**Phase 5.4: Promote Patterns**
Deploy reflector to:
```
Review all REFLECTION_LOG patterns scoring ≥75.
For each, add to specs/_guide/PATTERN_REGISTRY.md with:
- Pattern name and score
- Problem solved
- Solution approach
- Evidence of effectiveness
- Source spec reference
```

### Success Criteria

- [ ] All typecheck/tests pass
- [ ] SC-1 through SC-5 validated
- [ ] `outputs/P5_FINAL_METRICS.md` created
- [ ] `outputs/verification-report.md` created
- [ ] REFLECTION_LOG.md P5 entry completed
- [ ] Patterns promoted to PATTERN_REGISTRY.md
- [ ] Spec marked complete in README.md

### Verification

```bash
# Full verification
bun run check --filter @beep/repo-cli
bun run test --filter @beep/repo-cli
bun run repo-cli agents-usage-report
bun run repo-cli context-freshness --format json
```

### Handoff Document

Read full context in: `specs/agent-effectiveness-audit/handoffs/HANDOFF_P5.md`
