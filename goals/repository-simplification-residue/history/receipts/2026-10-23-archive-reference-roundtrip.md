# Archive reference qualification — 2026-10-23

Closes #1867. The SPEC Decision Log approves the current existing reference
`op://BEEP_SECRETS/ai-metrics/raw-archive-key`. The agent shim read exited 0;
output was captured in process memory, never printed or stored. The old TBK
reference observation in the predecessor packet is retained as historical.
No forwarder, credential, existing archive or home configuration was changed.

The actual `@beep/repo-ai-metrics` archive implementation was exercised through
`writeEncryptedRawArchiveObject`, `readEncryptedRawArchiveEnvelope` and
`decryptEncryptedRawArchiveEnvelope` with one public synthetic JSONL string.
The key flowed directly from the suppressed shim read into a Redacted value.
No private transcript was read. The scratch directory was created under this
lane's ignored `.beep/`, had mode 0700, and was removed in `finally`.

| Qualification | Result |
| --- | --- |
| Current reference resolves through approved agent route | exit 0 |
| Exact `op run --env-file=<reference-only probe env> -- true` verification | exit 0 |
| AES-256-GCM write/read/decrypt content identity | true |
| Repeat write uses same content-addressed object | true |
| Wrong synthetic key rejects decryption | true |
| Raw source path absent from envelope | true |
| Scratch access scoped to owner (0700) | true |
| Probe process exit / scratch cleanup | 0 / completed |

Only booleans and exit codes were emitted. No key, plaintext private content,
source identifier, ciphertext or archive object identity entered the receipt.
The current-shell doctor findings and unused systemd limitation are recorded
in the adjacent package census. Desktop Environments MCP was skipped.
Reversal: no persistent projection was changed; old observations and recovery
assets remain. Revert this receipt PR to withdraw qualification, without
removing existing archives or changing their keys.
