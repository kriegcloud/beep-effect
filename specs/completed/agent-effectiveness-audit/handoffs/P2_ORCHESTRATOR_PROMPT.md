# P2 Orchestrator Prompt

You are implementing Phase 2 (Hook Optimization) of the `agent-effectiveness-audit` spec.

### Context

P0 measured baseline token overhead:
- **Per-prompt**: ~8,000-10,000 tokens
- **Skills crawl**: 55,000 tokens (conditional)
- **Target**: ≤4,000 tokens

P1 scored all 45 skills and identified consolidation opportunities.

### Your Mission

Reduce per-prompt token injection from ~8,000-10,000 to ≤4,000 through hook optimization.

### Optimization Strategies

| Strategy | Savings | Priority |
|----------|---------|----------|
| Lazy-load skills | ~54,500 | HIGH |
| Split rules | ~4,900 | MEDIUM |
| Index manifest | ~4,500 | MEDIUM |

### Agent Deployment Strategy

**Phase 2.1: Analysis**
Deploy codebase-researcher to analyze hook architecture:
```
Analyze the hook system in .claude/hooks/:
1. Map all hook files and their invocation points
2. Measure token injection at each stage
3. Identify eager-loading bottlenecks
4. Document the startup → prompt → response flow

Key files:
- .claude/hooks/startup.ts
- .claude/hooks/session-context.ts
- .claude/hooks/user-prompt-submit.ts

Write to: specs/agent-effectiveness-audit/outputs/hook-analysis.md
```

**Phase 2.2: Implementation**
Deploy effect-code-writer to implement lazy loading:
```
Implement lazy skill loading:
1. Create skills index (name → path → triggers)
2. Replace full crawl with index lookup
3. Load SKILL.md content only when triggered
4. Maintain backwards compatibility

Test that skills are still discoverable.

Create backup before modifying:
cp .claude/hooks/user-prompt-submit.ts .claude/hooks/user-prompt-submit.ts.bak
```

**Phase 2.3: Validation**
Deploy Explore agent to validate:
```
Validate hook optimization:
1. Measure post-optimization token count
2. Test skill discovery (trigger matching)
3. Verify agent workflows function
4. Compare before/after metrics

Write to: specs/agent-effectiveness-audit/outputs/hook-validation.md
```

### Success Criteria

- [ ] Hook flow documented
- [ ] Token injection reduced to ≤4,000
- [ ] Skills still discoverable
- [ ] No breaking changes
- [ ] `outputs/P2_HOOK_OPTIMIZATION.md` created
- [ ] REFLECTION_LOG.md updated with P2 entry
- [ ] `handoffs/HANDOFF_P3.md` created
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

### Verification

```bash
# Check outputs exist
ls specs/agent-effectiveness-audit/outputs/hook-*.md

# Verify backup exists
ls .claude/hooks/*.bak

# Test skill discovery (manual)
# Start new conversation, reference skill trigger, verify loading
```

### Handoff Document

Read full context in: `specs/agent-effectiveness-audit/handoffs/HANDOFF_P2.md`
