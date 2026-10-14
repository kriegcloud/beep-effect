# Integration after the consolidated quality repair

PR #1666 landed as `7a42f17d0d56fb4772a60c873edacdc7a686acec`. This lane
integrates main at `3749e7ca4a44b086a7844bccc616aa960dd60c75`. The prior lane
head was `992c599bd0d0c3475a2ad51e75401810ac193b63`.

## Preserved behavior and coverage

The thirteen admitted production files and eight messaging test files retain
their previously reviewed SHA-256 values. The merge keeps every coverage row,
aggregate, policy field and provenance field from the incoming main baseline.
It adds only the thirteen reviewed messaging file identities. New main rows for
graduation, skill frontmatter, shading and the knowledge doctor remain present.
No coverage floor is reduced to qualify this lane.

Both existing ambiguous-delivery holds remain outside the checkout. This
integration does not inspect, replay, resend or clear them. Tests use disposable
fixtures and do not make live provider calls.

## Compiler and dependency configuration

The CLI retains its separate production, source-check and test profiles. Main's
generated source build/check commands use `tsc-rs`; the canonical package test
worker uses the exact Effect compiler through `@beep/tsgo-shim`. A fresh CLI
test-worker receipt records `test-tsgo-package-result/v1`, package identity
`@beep/repo-cli`, compiler exit code zero and an empty diagnostic output.

The dependency merge keeps main's `ai-sync` edge together with the lane's
provider, MCP and T3 edges. AgentMessage package exports, its test-kit wildcard
and the root AgentMessage/T3 source aliases remain intact. Canonical config,
package-script, boundary and policy-fingerprint writers generate the combined
configuration; the frozen-lockfile install succeeds.

## Cache baseline review scope

Record the observed combined posture for `//`, `@beep/ai-provider-cli`,
`@beep/repo-cli` and `@beep/t3-code`. These subjects combine the lane's reviewed
dependency and fingerprint inputs with main's source compiler migration and
new root policy command. The T3 workspace retains its previously reviewed
`tsc` build and `tsgo` source/test checks; the current package-script writer
reports no drift for those commands. Keep all other subject reviews unchanged.

The earlier review evidence remains in:

- `standards/cache-qualification-agent-message-review.md`;
- `goals/agent-session-bridges/research/T3-CACHE-REVIEW.md`;
- `goals/agent-session-bridges/research/T3-CACHE-HELPER-REVIEW.md`;
- `goals/agent-session-bridges/research/T3-MAIN-INTEGRATION.md`;
- `goals/tsc-rs-gates/research/cache-baseline-review-2026-10-14.md`;
- `goals/turborepo-task-qualification/research/retired-effect-paths-baseline-review.md`.

The canonical recorder must preserve the existing profile, epoch, qualification
scope and tuple ledger. This records legacy configuration and grants no cache
reuse qualification. Independent review and the recorder's changed-subject
guard must confirm this scope before publication.

## Remaining publication proof

The strict compiler result is local proof for this integrated checkout. The
combined commit still needs independent integration review, canonical Yeet
publication, fresh hosted checks, review-thread closure and the review window.
The separate coordinator's red-check merge exception does not qualify #1571.
