# Phase P[N] Orchestrator Prompt Template

Copy-paste this prompt to start Phase P[N] execution.

---

## Prompt

You are implementing Phase P[N] of the `todox-wealth-mgmt-knowledge-mvp` spec: **[phase name]**.

### Context

[Brief summary of what was completed in previous phases - 2-3 sentences max]

[Key findings or learnings from previous phase that inform this phase]

### Your Mission

[Clear, concise description of what this phase accomplishes]

- [Work item 1]
- [Work item 2]
- [Work item 3]

### Critical Patterns

[Include 2-5 short code/examples showing key patterns or gotchas]

**Pattern Name**:
```ts
// Example payload shape / pseudo-code
```

### Reference Files

- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R0_SYNTHESIZED_REPORT_V3.md` - synthesis input
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P0_DECISIONS.md` - contracts
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P1_PR_BREAKDOWN.md` - PR plan + gates

### Verification

[Commands to run after each step]

```bash
# Prefer single quotes around rg patterns (zsh: backticks in double-quotes trigger command substitution).
bun run check
bun run test
```

### Success Criteria

- [ ] [Specific, measurable completion item 1]
- [ ] [Specific, measurable completion item 2]
- [ ] Type check passes
- [ ] Tests pass

### Handoff Document

Read full context in: `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P[N].md`

### Next Phase

After completing Phase P[N]:
1. Update `REFLECTION_LOG.md` with learnings
2. Create/update `handoffs/HANDOFF_P[N+1].md`
3. Create/update `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md`
