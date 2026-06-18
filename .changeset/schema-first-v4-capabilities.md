---
"@beep/schema": patch
"@beep/rdf": patch
"@beep/oip-web": patch
"@beep/hubspot": patch
"@beep/file-processing": patch
"@beep/agents-use-cases": patch
"@beep/acp": patch
"@beep/architecture-lab-server": patch
"@beep/libpff": patch
"@beep/md": patch
"@beep/nlp": patch
"@beep/observability": patch
"@beep/repo-configs": patch
"@beep/runpod": patch
"@beep/semantic-web": patch
"@beep/shared-domain": patch
"@beep/shared-ui": patch
"@beep/tika": patch
"@beep/venice-ai": patch
"@beep/wink": patch
---

Harden schema-first Effect v4 capabilities. Hardens the `beep lint schema-first`
`SFV4-arbitrary-tests` rule to the full Effect v4 sync/async codec family and
routes findings into structured Yeet `schema-first-policy` issues. Adds
schema-derived `toArbitrary` annotations to source brands (case-format strings,
`FileName`, `WindowsDriveRoot`, `EthereumValidatorPublicKey`, `SymbolId`,
file-processing artifact ids/names), class-local decoder statics
(`@beep/rdf`, OIP models), Markdown projection and secure-header constructor
defaults, HubSpot outbound email precision, and a broad set of
schema-derived property tests deriving data from source schemas across the
affected packages. No public wire formats change; the additions are schema
annotations, derived statics, enforcement tooling, and tests.
