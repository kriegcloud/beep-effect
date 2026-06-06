# Task Inventory

`tasks/tasks.jsonc` is the machine-readable ranked inventory. Use
`tasks/tasks.schema.json` as the contract.

The synthesis phase may add human-readable briefs in this directory for grouped
tasks, but the JSONC inventory remains the source used for implementation
selection.

Task status vocabulary:

- `seeded-hypothesis`: known or likely opportunity before the new research
  batches finish.
- `candidate`: research-backed task not yet selected.
- `selected`: chosen for current-PR implementation.
- `in-progress`: implementation started.
- `done`: implemented and proven.
- `deferred`: not implemented now, with risk/owner/next proof recorded.
- `rejected`: not worth doing, unsafe, or superseded by a better task.

Selection rule:

- Mark a task `selected` only when it can plausibly produce a substantial
  measured benefit, remove duplicated work, prevent resource regression, or
  unlock a larger measured speedup.
- Mark a task `done` only after it updates
  `../history/outputs/before-after-matrix.md` or records why timing is not
  applicable.
- Mark a task `deferred` only when the `deferred` object records reason,
  owner/surface, residual risk, and next proof step.
