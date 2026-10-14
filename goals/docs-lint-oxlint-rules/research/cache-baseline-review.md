# Cache baseline review: docs lint inputs on oxlint (2026-10-14)

Reviewer: Codex implementation lane B, source review.

The docs-specific `lint:jsdoc` and `//#lint:jsdoc:root` inputs replace the ESLint root config
and repo-configs source with `.oxlintrc.docs.json`, tsdoc.json and lint-rules source/manifest.
The policy-fingerprint task additionally includes the docs config. The generated script names
are unchanged. Root full docs lint now runs oxlint without ESLint's content result cache.

No cache flag, task dependency or output changed. No cached computation is newly qualified;
this review records the existing posture against the new docs configuration bytes. The
`BEEP_ESLINT_PROFILE` global env and deprecated-apis inputs remain unchanged for lane A.

`research/cache-audit.log` identifies 148 changed computations and turbo.json source drift.
This request covers only subjects owning those computations plus the root configuration.
Reversal: restore the previous docs Turbo inputs and generate a reviewed reverse baseline.
