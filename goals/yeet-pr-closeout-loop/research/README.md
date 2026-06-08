# Research Summary

The plan was shaped by four parallel lanes:

- Architecture packet lane: make a compact execution packet under
  `goals/yeet-pr-closeout-loop` and keep implementation in `@beep/repo-cli`.
- Yeet lane: preserve full publish proof, add exact-match retry state, and move
  rich PR review work to a new `closeout` mode.
- PR bot lane: inspect unresolved review threads and bot comments with GraphQL;
  write only on explicit Greptile retrigger.
- Quality lane: add a targeted `review-fix` proof and affected repo-export
  shard checks, escalating to full proof for topology changes.

The resulting design optimizes the repeated fix/review loop while keeping the
existing full pre-push lane authoritative.
