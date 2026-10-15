# Cache baseline review: Palantiri P1 package and CLI group

Reviewed 2026-10-14 for P1 of `goals/palantiri-parcels`
(`feat/palantiri-parcels`).

`bun run beep quality cache-policy` reported:

- unreviewed expansion for the new `@beep/palantiri` package: `#build`,
  `#check`, `#docgen`, `#lint`, `#lint:deprecated-apis`, `#lint:jsdoc`,
  `#lint:laws` and `#test`;
- configuration drift for `@beep/repo-cli` `#build`, `#check`, `#doctest`,
  `#lint:deprecated-apis`, `#test` and `#test:property`;
- after `bun run beep lint policy-fingerprint --write`, configuration drift
  for `//#lint:policy-fingerprint` (source: `turbo.json`).

`@beep/palantiri` was scaffolded by `bun run beep create-package palantiri
--family tooling --kind library`; its task commands, inputs, outputs, env and
cache flags are the generated tooling-library defaults, untouched by hand
(`bun run beep lint package-scripts --write` reports no change). Its
dependency graph is `@beep/identity`, `@beep/observability`,
`@beep/repo-ai-metrics`, `@beep/schema` and `effect`, with `@beep/fc-runs` and
`@effect/vitest` for tests.

The `@beep/repo-cli` drift comes from its dependency graph only: it gained a
workspace dependency on `@beep/palantiri` for the new `beep palantiri`
command group, and its `tsconfig.json` and `tsconfig.check.json` gained the
matching project reference. Its turbo task commands, inputs, outputs, env and
cache flags are unchanged; no turbo task was added or renamed.

The root drift is the generated `//#lint:policy-fingerprint` input list in
`turbo.json`: because `@beep/repo-cli` now depends on `@beep/palantiri`, the
computed policy-tool closure gained
`packages/tooling/library/palantiri/package.json` and
`packages/tooling/library/palantiri/src/**`. The task's command, outputs, env
and cache flags are unchanged.

Recording it accepts the existing posture for these three subjects only; no
qualification is granted and no other subject changes.

## Carried subject: `@beep/repo-ai-metrics`

This branch also carries PR #1806 (not yet on `main`), whose
`@beep/repo-ai-metrics` workspace dependency on `@beep/observability` was
reviewed in
`goals/observability-kernel-catalog/research/cache-baseline-review-ai-metrics-catalog.md`.
Its configuration drift is re-recorded here unchanged. The subject's task
commands, inputs, outputs, env and cache flags are untouched, and no
qualification is granted.
