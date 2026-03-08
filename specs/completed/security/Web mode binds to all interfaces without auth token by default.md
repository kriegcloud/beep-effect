# Status
not-applicable on current main

## Outcome
This finding targets the vendored `.repos/t3code` subtree rather than first-party Beep workspaces. Current root workspaces exclude `.repos/*`, so this is tracked as out of scope for the live product code in this repository.

## Evidence
- Vendored subtree present under `.repos/t3code`
- Root workspaces do not include `.repos/*`
- First-party agent transport hardening was applied separately in `packages/ai/sdk`
