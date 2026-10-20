# Cache baseline review: ai-metrics catalog declarations

Reviewed 2026-10-14 for P2b of `goals/observability-kernel-catalog`
(`feat/observability-catalog-p2b`).

`bun run beep quality cache-policy` reported configuration drift for
`@beep/repo-ai-metrics` `#build`, `#check`, `#lint:deprecated-apis`, `#test`
and `#test:property`.

The drift comes from the package's dependency graph only: the package now
depends on `@beep/observability` (workspace) so `AiMetrics.instruments.ts` can
declare the agent-attribution keys with the catalog schemas, and its
`tsconfig.json` and `tsconfig.check.json` gained the matching project
reference. The package's turbo task commands, inputs, outputs, env and cache
flags are unchanged; no turbo task was added or renamed.

Recording it accepts the existing posture for `@beep/repo-ai-metrics` only;
no qualification is granted and no other subject changes.
