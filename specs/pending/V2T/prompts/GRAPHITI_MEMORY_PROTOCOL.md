# V2T Graphiti Memory Protocol

This file is the canonical Graphiti recall and writeback contract for the V2T
canonical spec package.

## Preflight

1. Run `bun run codex:hook:session-start`.
2. If `graphiti-memory` is available, run `get_status`.
3. If status is healthy, attempt `search_memory_facts`.
4. If the first fact search is unusable, try one shorter fallback query.
5. If fact search still fails, errors, or returns nothing useful, try
   `get_episodes` with the same `group_ids` value before falling back to
   repo-local sources.
6. Treat `get_episodes` as a lower-signal Graphiti fallback, not a replacement
   for a good fact search result.
7. If the wrapper exposes `group_ids` as a string, use the JSON array literal
   string `"[\"beep-dev\"]"`.
8. If Graphiti is unavailable or recall still fails after the episode fallback,
   continue with repo-local docs, code search, and the checked-in `.codex`
   guidance instead of blocking the phase.

## Recall Recipe

- First query: the active phase objective plus the repo seam names that matter
  for the current work.
- Fallback query: a shorter task-only query if the first query fails or returns
  nothing useful.
- Episode fallback: `get_episodes` with `group_ids: "[\"beep-dev\"]"` when
  fact search errors, is wrapper-fragile, or returns nothing reusable.
- Always record:
  - whether `get_status` passed
  - the exact recall query or queries attempted
  - whether `get_episodes` was attempted and what it returned
  - the exact error text when recall fails
  - whether the result was useful, partially useful, or unusable
  - whether the session used the documented repo-local fallback

## Writeback Template

Use these fixed Graphiti metadata values for durable writeback:

- `group_id: "beep-dev"`
- `source: "text"`
- `source_description: "codex-cli session"`

Prefer concise, durable titles in this shape:

- `V2T P0: <repo truth or decision>`
- `V2T P1: <design contract or boundary>`
- `V2T P2: <command matrix or rollout decision>`
- `V2T P3: <implementation root cause or pattern>`
- `V2T P4: <verification result or readiness finding>`
- `V2T session: <in-progress checkpoint>` when the session ends mid-phase

Structure `episode_body` with these sections in plain text:

1. `Context:` active phase, objective, and why the memory is durable
2. `Durable result:` repo truth, decision, fix, or reusable failure knowledge
3. `Evidence:` files, commands, or observations that support the conclusion
4. `Affected paths:` the main files, packages, or seams involved
5. `Open risk or next query:` unresolved risk or the next best recall hook for
   future sessions

## Session-End Summary Rule

- Write back a session-end summary before stopping whenever the session
  produced durable repo truth, architecture decisions, tricky fixes, or
  meaningful in-progress status that a later orchestrator would otherwise have
  to rediscover.
- This rule applies even when the phase remains `IN_PROGRESS`.
- If nothing memory-worthy happened, say that explicitly in the phase artifact
  instead of pretending memory was written.

## Worker Expectations

- Sub-agents do not call Graphiti unless the orchestrator explicitly assigns
  that work.
- Workers should still report memory-worthy findings, exact recall queries or
  errors if they attempted recall, and a suggested writeback title or summary
  for the orchestrator.
- The orchestrator owns final writeback and the final session-end summary.
