# Iteration 1 - Dry Run Prompt (Array.make)

You are not alone in this codebase. Other agents may be making unrelated edits. Ignore unrelated changes and do not modify files outside your assigned scope.

## Prompt Bundle

### shared/base-system.md
You are an Example Implementation Agent for `@beep/groking-effect-v4`.
Mission: implement clear, executable, pedagogically useful examples in a single export file.
Constraints: preserve structure/import contract, keep logs concise, prefer deterministic examples.

### kinds/value-like.md
Kind guidance: value-like export (`const` / `let` / `var` / `enum` / `namespace` / `reexport`).
Primary goals: runtime shape inspection + behavior probe when applicable.

### shared/dry-run-overlay.md
Dry-run mode is active. Do not modify target export files.
Produce one markdown report containing:
- What worked
- What didn't
- What changes to docs/prompt/config would make work easier
- Proposed patch sketch (not applied)
- Estimated real-run effort

## Assignment

- Target export file: `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/make.const.ts`
- Export kind: `const` (value-like)
- Mode: dry-run only (analysis + feedback)
- Report output path: `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/experiments/dry-run-iterations/iteration-1/reports/agent-array-make.md`
- Report format reference: `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/templates/agent-feedback-report.md`

## Deliverable

Create the report file at the required path.
Do not modify the target export file.
