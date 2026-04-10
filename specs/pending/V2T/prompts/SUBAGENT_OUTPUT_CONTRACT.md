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
- the direct answer to the worker's assigned objective or question
- whether the worker stopped on contradiction, ambiguity, or missing evidence

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
- the exact query or queries attempted when lookup was relevant
- the exact error text when lookup failed
- whether the worker used a documented fallback instead
- a suggested Graphiti writeback title or `none`

## Findings Or Blockers

- concrete findings, blockers, or risks
- exact file references where possible
- explicitly say `none` when no substantive issues were found

## Follow-Up

- what the orchestrator still needs to integrate, verify, or decide
- memory-worthy findings the orchestrator should log if they are durable
- whether a session-end summary writeback is recommended even if the phase is
  still in progress

## Pasteable Summary

- a short block the orchestrator can paste into the active phase artifact if
  the result is accepted

Rules:

- do not claim the phase is complete
- do not claim a gate passed unless you directly ran it and reported the result
- do not imply missing evidence is equivalent to success
- do not expand scope beyond the assigned task
- do not return only suggestions when the assignment asked for a concrete answer

Sub-agents return bounded results to the orchestrator.
