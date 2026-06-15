---
"@beep/agents-domain": patch
"@beep/agents-server": patch
"@beep/agents-use-cases": patch
"@beep/agents-client": patch
"@beep/workspace-tables": patch
"@beep/workspace-use-cases": patch
"@beep/workspace-server": patch
"@beep/epistemic-tables": patch
"@beep/test-utils": patch
"@beep/md": patch
"@beep/identity": patch
"@beep/db-admin": patch
"@beep/repo-configs": patch
---

Ship the end-to-end desktop chat surface across the agents/workspace/epistemic slices: streamed block-by-block rich-text assistant turns, edit-as-branch, cancel-in-flight (no partial row), PGlite persistence across relaunch, and UsageRecord capture at turn finalization, with a deterministic fixture agent powering the CI contract test and the Anthropic forced-tool kernel validated end-to-end.

Also makes `@beep/md`'s `Pre.language` JSON-safe (`S.Option` → `S.OptionFromNullOr`) so documents survive a JSON boundary (jsonb columns and the rpc/ndjson wire); the encoded form changes from a non-JSON-safe `Option` instance to `string | null` while the decoded type stays `Option<string>`.

Adds shared `@beep/test-utils` integration-test helpers (`makePgliteIntegrationGate`) and makes the `fallow:audit` duplication gate source-aware (real source-code duplication blocks; idiomatic test/config boilerplate is advisory).
