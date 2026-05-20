# 1Password CLI Integration

Status: P1 implementation note.

P1 uses 1Password as the credential bus, but manifests and app inputs carry
references only. The shared value object is
`@beep/shared-domain/values/OnePasswordReference`, which accepts
`op://vault/item/field` references with an optional section segment.

Implemented P1 behavior:

- `@beep/onepassword-cli` owns the CLI boundary for `op`.
- `OnePasswordCli.whoami` proves an operator session exists.
- `OnePasswordCli.probeReference` proves a reference can be resolved and
  returns only status plus byte length.
- `OnePasswordCli.read` returns `Redacted<string>` for downstream live calls.
- `@beep/installer-use-cases` exposes
  `validateSecretReference` and `readSecretReference`.
- `@beep/installer-server` maps the driver into installer-owned use-case
  contracts.

Safety contract:

- Plaintext secrets are not valid request parameters.
- `P1ManualProofRequest.discordBotTokenReference` is typed as
  `OnePasswordReference`.
- The React workbench rejects plaintext Discord bot tokens before invoking
  Tauri.
- The proof result records the reference and validation status, not the
  resolved token.

Out of scope for P1:

- 1Password account provisioning
- SSH agent setup
- commit signing setup
- shell plugin installation
- recovery flows for missing or malformed references
