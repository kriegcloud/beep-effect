# V2T Sub-Agent Output Contract

Every V2T sub-agent must return a concise report with these sections:

## Status

- `complete`, `partial`, or `blocked`
- one sentence on what is done versus still open

## Scope

- assigned phase
- agent role used
- read scope
- write scope or explicit read-only confirmation

## Outcome

- what was audited, designed, implemented, or verified
- whether the result is complete, partial, or blocked

## Files

- files changed or audited
- explicitly say `none` when no files changed

## Commands

- exact commands run
- `passed`, `failed`, `blocked`, `not run`, or `not applicable` for each
- explicitly say `none` when no commands were run

## Repo Truth Checks

- package names, task surfaces, or file-path claims that were verified
- any stale assumptions or copied commands that were proven wrong

## Evidence

- the source of the main conclusion: file, diff, command output, or direct repo observation
- any claim that still needs orchestrator confirmation

## Memory Notes

- whether Graphiti memory preflight or lookup was attempted
- whether the worker used a documented fallback instead

## Findings Or Blockers

- concrete findings, blockers, or risks
- exact file references where possible

## Follow-Up

- what the orchestrator still needs to integrate, verify, or decide

Rules:

- do not claim the phase is complete
- do not claim a gate passed unless you directly ran it and reported the result
- do not imply missing evidence is equivalent to success
- do not expand scope beyond the assigned task

Sub-agents return bounded results to the orchestrator.
