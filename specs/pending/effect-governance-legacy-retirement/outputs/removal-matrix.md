# Removal Matrix

## Status

Draft hypotheses seeded during P0. Lock in P1.

| Surface | Current Function | Proposed Disposition | Why | Status |
|---|---|---|---|---|
| `lint:effect-laws` | legacy rollback script | remove | no longer authoritative or on blocking path | needs-validation |
| `lint:effect-laws:strict` | stricter rollback script | remove | stale user-facing entrypoint after replacement promotion | needs-validation |
| `//#lint:effect-laws` | Turbo task metadata | remove | only supports the legacy root script | needs-validation |
| `eslint.config.mjs` | root ESLint shim | split or retain | `lint:jsdoc` still needs a root ESLint entrypoint | needs-validation |
| `ESLintConfig.ts` mixed export | combines Effect-law and docs-lane config | split | docs lane should survive without carrying `beep-laws` | needs-validation |
| Effect-law rule modules | legacy rule implementations | remove | replacement lane is already authoritative | needs-validation |
| `eslint-rules.test.ts` | fixture suite for legacy rules | remove or archive | only needed while the rule modules still exist | needs-validation |
| `effect-first-regressions.test.ts` | conventions around legacy rule runtime modules | rewrite or reduce | some assertions may still be useful for shared allowlist code | needs-validation |
| `NoNativeRuntime.ts` ESLint-backed runner | repo-local parity runner | rewrite away from ESLint | clearest remaining Effect-lane ESLint dependency | needs-validation |
| `tooling/cli` ESLint deps | supports `NoNativeRuntime.ts` | remove if rewrite succeeds | should disappear from Effect lane if the runner is rewritten | needs-validation |
| `tooling/configs` ESLint deps | supports docs lane and mixed config | retain for docs lane or split | not automatically removable while docs lane stays on ESLint | needs-validation |
| stale docs references to `lint:effect-laws` | outdated guidance | update | reduces drift and operator confusion | needs-validation |
