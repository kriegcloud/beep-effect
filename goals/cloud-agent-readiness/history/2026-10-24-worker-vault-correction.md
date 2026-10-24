# Worker vault access correction — 2026-10-24 UTC

The operator clarified that the workers require `BEEP_SECRETS`. The initial
tbk-worker and dankserver worker accounts could read only their separate
development vaults. The operator explicitly approved replacing both accounts
with independently revocable, persistent accounts that can read the shared
vault and their respective development vaults.

| Worker | Verified visible vaults |
| --- | --- |
| beep-worker | `BEEP_SECRETS` |
| tbk-worker | `BEEP_SECRETS`, `tbk-worker-development` |
| dankserver worker | `BEEP_SECRETS`, `dankserver-worker-development` |

The two new accounts have read permission only, no environment access and no
vault-creation permission. Full-vault access includes all present and future
items in the shared vault. It does not narrow the upstream permissions of
stored credentials or authorize unrelated operations or cloud deployment.

Each new credential was delivered through an in-memory private pipe to its
worker's protected store. Both doctors passed identity, exact two-vault
membership, readable inventories, mode 0700/0600 storage, PATH resolution and
absence of OP credentials/SSH agent in the user service manager. The shared
vault contained 39 items at verification. The tbk repository credential still
passed its suppressed read check. Current recovery copies were saved in the
human-only Employee vault, outside both worker accounts' visible vaults.

The current dankserver recovery copy is explicitly labeled with its rotation
date. Superseded token generations are invalid. Both original one-vault
accounts were revoked, disappeared from the active account list, and their
former tokens failed suppressed authentication probes. Both current accounts
passed checks again after those revocations. Private operational receipts
retain rotation details; no token value is included in this repository.

This receipt supersedes earlier vault-membership claims, not their historical
verification dates or other host boundaries. Dankserver provider and workload
qualification remains separate from successful secret access.
