# Spec Bootstrapper Handoff: Phase 1

> Transition from research to implementation.

---

## Session Summary: Phase 0-1 Completed

| Metric                 | Status      |
|------------------------|-------------|
| Spec structure created | Complete    |
| Research completed     | Complete    |
| Synthesis completed    | Complete    |
| Implementation started | Not started |

---

## What Was Accomplished

### Phase 0: Scaffolding
1. Created `specs/spec-bootstrapper/` directory structure
2. Wrote README.md with purpose and scope
3. Created REFLECTION_LOG.md template
4. Created QUICK_START.md guide
5. Created RUBRICS.md with evaluation criteria
6. Created templates/ with file templates

### Phase 1: Research
1. Launched CLI research agent - analyzed existing command patterns
2. Launched skill research agent - analyzed skill/agent patterns
3. Created synthesis report combining findings
4. Documented implementation plan in MASTER_ORCHESTRATION.md

---

## Key Findings from Research

### CLI Patterns
- Commands use `@effect/cli/Command.make()` with options and handlers
- Validation via Effect Schema with branded types
- Two-phase file generation: plan creation + execution
- Dry-run support by short-circuiting after preview
- Tagged errors with displayMessage getters

### Skill Patterns
- Simple skills: single `.md` file
- Complex skills: directory with `SKILL.md` entry point
- No manifest registration needed for skills
- 5-phase workflows with authorization gates
- Integration with CLI via programmatic invocation

---

## Remaining Work: Phase 2+ Items

### Priority 1: CLI Command Implementation

| Task                     | File                                              | Status  |
|--------------------------|---------------------------------------------------|---------|
| Create schemas.ts        | `commands/bootstrap-spec/schemas.ts`              | Pending |
| Create errors.ts         | `commands/bootstrap-spec/errors.ts`               | Pending |
| Create template.ts       | `commands/bootstrap-spec/utils/template.ts`       | Pending |
| Create file-generator.ts | `commands/bootstrap-spec/utils/file-generator.ts` | Pending |
| Create handler.ts        | `commands/bootstrap-spec/handler.ts`              | Pending |
| Create index.ts          | `commands/bootstrap-spec/index.ts`                | Pending |
| Register command         | `tooling/cli/src/index.ts`                        | Pending |

### Priority 2: Skill Creation

| Task               | File                                              | Status  |
|--------------------|---------------------------------------------------|---------|
| Create SKILL.md    | `.claude/skills/spec-bootstrapper/SKILL.md`       | Pending |
| Create templates   | `.claude/skills/spec-bootstrapper/templates/`     | Pending |
| Create phase guide | `.claude/skills/spec-bootstrapper/PHASE_GUIDE.md` | Pending |

### Priority 3: Integration

| Task                       | File                           | Status  |
|----------------------------|--------------------------------|---------|
| Update CLI CLAUDE.md       | `tooling/cli/CLAUDE.md`        | Pending |
| Update SPEC_CREATION_GUIDE | `specs/SPEC_CREATION_GUIDE.md` | Pending |

---

## P1 Orchestrator Prompt

```
You are implementing the spec-bootstrapper CLI command.

## Context
Research has been completed. See:
- specs/spec-bootstrapper/outputs/cli-research.md
- specs/spec-bootstrapper/outputs/synthesis-report.md
- specs/spec-bootstrapper/MASTER_ORCHESTRATION.md

## Your Tasks

1. Create the directory structure:
   mkdir -p tooling/cli/src/commands/bootstrap-spec/utils

2. Implement in order:
   a. schemas.ts - SpecName, SpecDescription, SpecComplexity, BootstrapSpecInput
   b. errors.ts - InvalidSpecNameError, SpecExistsError
   c. utils/template.ts - SpecContext, templates, createSpecContext()
   d. utils/file-generator.ts - GenerationPlan, createPlan(), executePlan()
   e. handler.ts - bootstrapSpecHandler()
   f. index.ts - bootstrapSpecCommand

3. Register in tooling/cli/src/index.ts

4. Run verification:
   bun run check --filter @beep/repo-cli
   bun run lint --filter @beep/repo-cli

## Requirements
- Use Effect patterns (namespace imports, Effect.gen, layers)
- Follow existing create-slice command patterns
- Support three complexity levels
- Implement dry-run mode
- Use tagged errors

## Success Criteria
- bun run beep bootstrap-spec --help works
- bun run beep bootstrap-spec -n test -d "Test" --dry-run shows preview
- bun run check passes
- bun run lint passes
```

---

## Verification Commands

```bash
# After implementation
bun run check --filter @beep/repo-cli
bun run lint --filter @beep/repo-cli
bun run beep bootstrap-spec --help
bun run beep bootstrap-spec -n test-feature -d "Test feature" --dry-run
```

---

## Notes for Next Agent

1. **Reference files heavily** - The create-slice command is the best reference
2. **Start with schemas** - Get validation working first
3. **Test incrementally** - Verify each module compiles before moving on
4. **Use existing utilities** - FsUtils, RepoUtils from @beep/tooling-utils
5. **Follow patterns exactly** - Don't innovate on patterns, copy them

---

## Files to Reference

| File                                               | Purpose              |
|----------------------------------------------------|----------------------|
| `tooling/cli/src/commands/create-slice/index.ts`   | Command pattern      |
| `tooling/cli/src/commands/create-slice/schemas.ts` | Schema pattern       |
| `tooling/cli/src/commands/create-slice/errors.ts`  | Error pattern        |
| `tooling/cli/src/commands/create-slice/handler.ts` | Handler pattern      |
| `outputs/cli-research.md`                          | Implementation guide |
| `outputs/synthesis-report.md`                      | Full plan            |
