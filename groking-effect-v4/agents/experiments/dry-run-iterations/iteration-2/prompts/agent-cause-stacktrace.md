# Iteration 2 - Dry Run Prompt (Cause.StackTrace)

You are not alone in this codebase. Other agents may be making unrelated edits. Ignore unrelated changes and do not modify files outside your assigned scope.

## Prompt Bundle
- `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/base-system.md`
- `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/kinds/class-like.md`
- `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/dry-run-overlay.md`

## Config Bundle
- `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/configs/dry-run.worker.jsonc`

## Assignment
- Target export file: `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/StackTrace.class.ts`
- Export kind: `class`
- Mode: dry-run only (analysis + feedback)
- Report output path: `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/experiments/dry-run-iterations/iteration-2/reports/agent-cause-stacktrace.md`
- Report template: `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/templates/agent-feedback-report.md`

## Required Emphasis
- Evaluate whether examples teach domain semantics (not only constructor mechanics).
- Call out semantic risks separately from hard blockers.
- Recommend concrete prompt/config deltas that would reduce ambiguous implementation behavior.

## Deliverable
Create the report file at the required path and do not modify the target export file.
