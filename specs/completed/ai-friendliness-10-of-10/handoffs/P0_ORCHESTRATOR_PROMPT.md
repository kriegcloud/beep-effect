# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 implementation.

---

## Prompt

You are implementing Phase 0 (Discovery & Baseline) of the ai-friendliness-10-of-10 spec.

### Context

This spec aims to achieve 10/10 AI-friendliness by addressing:
- 0% ai-context.md coverage (62+ packages need files)
- Missing error pattern catalog
- No onboarding system for new agents
- Abstract rules lacking worked examples

### Your Mission

Complete 5 discovery tasks to establish baseline:

1. **Package Inventory** (Task 0.1)
   - List all 62+ packages in packages/, apps/, tooling/
   - Check ai-context.md and AGENTS.md status for each
   - Output: `specs/ai-friendliness-10-of-10/outputs/packages-inventory.md`

2. **AGENTS.md Quality Audit** (Task 0.2)
   - Score all 66 AGENTS.md files (0-10 scale)
   - Use rubric: purpose, files, patterns, examples, guardrails
   - Output: `specs/ai-friendliness-10-of-10/outputs/agents-md-quality.md`

3. **Error Pattern Extraction** (Task 0.3)
   - Mine `specs/*/REFLECTION_LOG.md` for error mentions
   - Check `.claude/rules/*.md` for NEVER patterns
   - Categorize: TypeScript, Effect, Biome, Turborepo
   - Target: 20+ patterns
   - Output: `specs/ai-friendliness-10-of-10/outputs/error-patterns.md`

4. **Rules Without Examples** (Task 0.4)
   - Audit `.claude/rules/*.md` for abstract rules
   - List formal notation without worked examples
   - Output: `specs/ai-friendliness-10-of-10/outputs/rules-without-examples.md`

5. **Onboarding Friction** (Task 0.5)
   - Identify assumed knowledge gaps
   - Note missing getting-started paths
   - Output: `specs/ai-friendliness-10-of-10/outputs/onboarding-gaps.md`

### Critical Patterns

- Use `codebase-researcher` agent for exploration
- Create outputs/ directory files (not just console output)
- Update REFLECTION_LOG.md after completion

### Reference Files

- Spec README: `specs/ai-friendliness-10-of-10/README.md`
- Full orchestration: `specs/ai-friendliness-10-of-10/MASTER_ORCHESTRATION.md`
- Handoff details: `specs/ai-friendliness-10-of-10/handoffs/HANDOFF_P0.md`

### Verification

After each task:
```bash
cat specs/ai-friendliness-10-of-10/outputs/[filename].md
```

After all tasks:
```bash
ls specs/ai-friendliness-10-of-10/outputs/
# Expected: 5 markdown files
```

### Success Criteria

- [ ] packages-inventory.md with 62+ packages listed
- [ ] agents-md-quality.md with scores for 66 files
- [ ] error-patterns.md with 20+ patterns
- [ ] rules-without-examples.md with abstract rules listed
- [ ] onboarding-gaps.md with friction points
- [ ] REFLECTION_LOG.md updated with P0 entry

### After Completion

Create handoff files for P1:
1. `handoffs/HANDOFF_P1.md` - Full context for ai-context generation
2. `handoffs/P1_ORCHESTRATOR_PROMPT.md` - Copy-paste prompt for P1
