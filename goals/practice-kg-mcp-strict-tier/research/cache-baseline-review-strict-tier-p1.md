# Cache baseline review: practice-kg-mcp strict tier P1

Reviewed 2026-10-15 for P1 (Gate) of `goals/practice-kg-mcp-strict-tier`
(`feat/practice-kg-mcp-strict-tier`).

`bun run beep quality cache-policy` reported configuration drift for
`@beep/practice-kg-mcp`: `#build`, `#check`, `#lint:deprecated-apis` and
`#test`. No other subject drifted.

The drift comes from the package's dependency graph only. P1 gave the app a
workspace dependency on `@beep/observability` (the new `./strict` export and
the catalog kernel) and a dev dependency on `@beep/mcp-kit` (the stdio
conformance kit its strict-tier canary test drives), and
`bun run beep tsconfig-sync` added the matching project references to
`tsconfig.json` and `tsconfig.check.json`. Its turbo task commands, inputs,
outputs, env and cache flags are unchanged: `bun run beep lint package-scripts
--write` reports no drift, and no turbo task was added or renamed.

`@beep/observability` gained a new `./strict` export and
`@beep/law-practice-server` gained a span attribute; neither changed its
dependency graph or task configuration, and cache-policy reports no drift for
either.

Recording it accepts the existing posture for `@beep/practice-kg-mcp` only; no
qualification is granted and no other subject changes.
