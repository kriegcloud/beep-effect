# Sub-Agent Output Contract

Every worker return should use this structure.

## Required Sections

### Summary

- one short paragraph answering the assigned question directly

### Evidence

- files inspected
- commands run
- commands not run
- external references used

### Findings

- concrete findings, not generic advice
- note contradictions explicitly

### Risks Or Gaps

- what remains uncertain
- what would require broader scope

### Stop Reason

- `completed`
- `blocked_by_contradiction`
- `blocked_by_missing_source`
- `blocked_by_scope`

### File Changes

- list changed files if any
- say `none` if read-only
