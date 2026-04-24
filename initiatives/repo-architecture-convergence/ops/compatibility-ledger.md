# Compatibility Ledger

This is the authoritative ledger for temporary aliases, shims, compatibility
subpaths, route exceptions, and allowlist-linked bridge surfaces introduced
during repo architecture convergence. Each live row must carry the closeout
fields needed to retire the bridge without referring back to a design-only
seed.

If a compatibility ledger appears anywhere outside `ops/`, treat it as
historical or planning context only. This file is the only live compatibility
ledger for active execution.

## Entry Rules

- Add an entry only when the compatibility surface exists in landed repo state.
- Every entry must include shim kind, canonical replacement, affected
  consumers, owner, reason, issue, created phase, expiry or deletion phase,
  deletion gate, validation query, proof plan, removal evidence, and status.
- If the surface also requires repo-law exception governance, reference the
  matching `standards/effect-laws.allowlist.jsonc` entry.

## Current Entries

No executed compatibility surfaces have been recorded yet.

| ID | Surface | Shim kind | Canonical replacement | Affected consumers | Owner | Reason | Issue | Created phase | Expiry or deletion phase | Deletion gate | Validation query | Proof plan | Allowlist reference | Removal evidence | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| None | None recorded | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Clear | Populate when an actual compatibility surface lands. |
