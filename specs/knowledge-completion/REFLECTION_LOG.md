# Reflection Log: Knowledge Completion

> Cumulative learnings from each phase of the knowledge completion spec.

---

## Log Format

Each entry follows this structure:

```markdown
## Phase [N]: [Name] - [Date]

### What Worked
- [Specific technique or approach that succeeded]

### What Didn't Work
- [Approach that failed and why]

### Patterns Discovered
- [New pattern worth promoting to registry]

### Gotchas
- [Specific issue to avoid in future phases]

### Time Estimate Accuracy
- Estimated: [X hours]
- Actual: [Y hours]
- Variance reason: [explanation]
```

---

## Phase Entries

### Phase 0: Spec Creation - 2026-01-22

#### What Worked

- **Deep code analysis before writing spec**: Reading the actual `AiService.ts` revealed 3 methods (`generateObject`, `generateObjectWithSystem`, `generateText`) when initial assumptions only mentioned `generateObject`. This prevented a significant gap in the migration plan.

- **Reference implementation analysis**: Examining `tmp/effect-ontology/packages/@core-v2/` provided concrete patterns for the @effect/ai integration, not just theoretical API knowledge.

- **Pre-flight verification sections**: Adding bash commands to verify file paths before running agents prevents wasted effort on incorrect assumptions.

- **Parallelization diagrams**: ASCII art diagrams showing which tasks can run in parallel improve orchestration efficiency.

#### What Didn't Work

- **Initial scope underestimate**: The original plan file documented only `generateObject` usage. Manual verification found `EntityExtractor` uses `generateObjectWithSystem` (line 171), which has different system prompt requirements.

- **Legacy pattern oversight**: The `Context.GenericTag` usage in AiService (line 124) was not initially flagged as a pattern to avoid replicating.

#### Patterns Discovered

- **AiService interface discovery pattern**: When documenting service interfaces, always verify the actual file contents rather than relying on spec descriptions. Use `grep -n \"readonly\" [file]` to find all methods.

- **Critical question flagging**: Marking certain research questions as "CRITICAL" (e.g., system prompt support, mock Layer pattern) ensures they're answered before design phases.

- **Incremental migration order**: Starting with simplest services (MentionExtractor) before complex ones (EntityExtractor) reduces debugging complexity.

#### Gotchas

- **EntityExtractor is special**: Unlike other extractors that use `generateObject`, EntityExtractor uses `generateObjectWithSystem` for system prompts. This requires special migration handling.

- **@effect/ai system prompt support unclear**: Must verify during P1 research whether @effect/ai has native system prompt support or needs workaround.

- **Mock Layer pattern**: The exact API for creating `Layer.succeed(LanguageModel.LanguageModel, ...)` needs verification - don't assume the pattern without docs.

#### Time Estimate

- Estimated: 1 session
- Actual: 2 sessions (spec creation + spec-reviewer iteration)
- Variance reason: Spec-reviewer identified 5 gaps requiring additional file creation (RUBRICS.md, outputs/, P2-P8 handoffs)

---

*Entries for P1-P8 will be added as phases complete.*

---

## Pattern Candidates

Patterns scoring 75+ on the quality rubric should be promoted to `specs/_guide/PATTERN_REGISTRY.md`.

| Pattern | Score | Status |
|---------|-------|--------|
| Pre-flight verification in handoffs | 78 | Candidate |
| Parallelization diagrams in orchestrator prompts | 72 | Review |
| Critical question flagging for research phases | 80 | Candidate |

---

## Anti-Patterns Discovered

| Anti-Pattern | Phase | Mitigation |
|--------------|-------|------------|
| Trusting spec descriptions without code verification | P0 | Always read actual source files before documenting interfaces |
| Single-method assumption for services | P0 | Use `grep -n "readonly"` to find all interface methods |
| Migrating all files at once | P4 | Migrate one file at a time with verification between |
| Context.GenericTag replication | P4 | Check for legacy patterns and flag as "DO NOT REPLICATE" |
