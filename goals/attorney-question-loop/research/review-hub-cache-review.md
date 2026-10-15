# Cache baseline record: `@beep/practice-review-hub` (new app)

Reviewed 2026-10-14. `@beep/practice-review-hub` is a new service app, scaffolded by
`bun run beep create-package --type app --app-kind service` for attorney-question-loop P3b. Its
tasks (`#build`, `#check`, `#lint`, `#lint:deprecated-apis`, `#lint:jsdoc`, `#lint:laws`,
`#test`) and its `turbo.json` come from the scaffold unchanged. They are recorded as first
entries with the standard commands, outputs, env and cache flags. No qualification is granted,
and the scope, profile and epoch are unchanged.

The root subject (`//`) changes only because the scaffold registered the app: the workspace
entry in the root `package.json`, `bun.lock`, `syncpack.config.ts`, `tsconfig.packages.json` and
the root `tsconfig.json` references. No root command, output, env or cache flag changed.
