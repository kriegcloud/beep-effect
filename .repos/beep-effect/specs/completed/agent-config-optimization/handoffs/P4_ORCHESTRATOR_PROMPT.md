# Phase 4 Orchestrator Prompt

Copy and paste the content below to continue with Phase 3D (Templates and Deduplication).

---

## Prompt

```
Continue the agent configuration optimization project with Phase 3D: Templates and Deduplication.

## Context

Phase 3C completed successfully:
- 11 documentation files compressed
- 4,555 lines saved (63% average reduction)
- Target was 6,750-9,750 lines; achieved 67% of minimum

Phase 3D is OPTIONAL and focuses on:
- Creating shared templates to reduce duplication
- Estimated additional savings: 1,500-2,500 lines

## Prior Learnings

Compression technique that worked well:
1. Convert verbose code examples to tables
2. Keep 1 canonical example per pattern instead of 3-5
3. Reference existing documentation instead of duplicating
4. Condense methodology sections to bullet points
5. Use tables for quick reference instead of prose

## Phase 3D Tasks

### OPT-013: Verification Commands Template (HIGH ROI)
Create `.claude/templates/verification-commands.md` with standard commands.
Update 8-12 AGENTS.md files to reference it.
Estimated savings: 288-384 lines.

### OPT-014: Reference effect-patterns.md (MEDIUM ROI)
Remove duplicated Effect pattern explanations.
Update files to reference `.claude/rules/effect-patterns.md`.
Estimated savings: 300-500 lines.

### OPT-020-024: Deduplicate Guardrails (LOW ROI)
Create shared guardrails template.
Update files that duplicate contributor checklists.
Estimated savings: 600-900 lines.

## Files to Read First

1. `specs/agent-config-optimization/handoffs/HANDOFF_P4.md` - Full context
2. `specs/agent-config-optimization/handoffs/P3_PROGRESS.md` - Progress tracking
3. `.claude/rules/effect-patterns.md` - Existing pattern reference

## Constraints

- Do NOT remove package-specific information
- Maintain discoverability for readers
- Verify referenced files exist before removing content
- Update P3_PROGRESS.md with lines saved

## Start Point

Begin with OPT-013 (verification commands template) as it has the clearest ROI:
1. Audit which AGENTS.md files have "Verification" sections
2. Create the shared template
3. Update files to reference it
4. Track savings

If you determine Phase 3D is not worth continuing, explain why and mark the project complete.
```

---

## Alternative: Mark Project Complete

If Phase 3D is not needed, use this prompt instead:

```
Review the agent configuration optimization project and determine if Phase 3D is worth pursuing.

Context:
- Phase 3C saved 4,555 lines (63% average reduction)
- Target was 6,750-9,750 lines
- Phase 3D estimated savings: 1,500-2,500 lines

Read `specs/agent-config-optimization/handoffs/P3_PROGRESS.md` for full details.

Decision needed:
1. Is the additional 1,500-2,500 lines worth the effort?
2. Would template references reduce documentation discoverability?
3. Is 67% of the minimum target acceptable?

If stopping here is the right call, update P3_PROGRESS.md to mark the project complete with final metrics.
```
