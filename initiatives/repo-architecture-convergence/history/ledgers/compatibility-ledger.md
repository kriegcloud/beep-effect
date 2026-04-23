# Compatibility Ledger

This is the authoritative live compatibility ledger for the history surface.

This ledger records temporary compatibility shims, aliases, and bridge surfaces
introduced during convergence work. Do not use it for permanent architecture.

## Entry Rules

- Add an entry only when the shim or alias actually exists in repo state.
- Every entry must include an owner, creation phase, deletion phase, validation
  query or command, and current status.
- If the shim also requires a code-law exception, reference the governing
  `effect-laws.allowlist.jsonc` entry from the notes column.

## Current Entries

No executed compatibility surfaces have been recorded yet.

| ID | Surface | Created in phase | Owner | Consumers | Deletion phase | Validation evidence | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| None | None recorded | n/a | n/a | n/a | n/a | n/a | Clear | Populate when an actual compatibility surface lands. |
