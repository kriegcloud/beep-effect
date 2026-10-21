# Cache baseline review: wave 2a

Reviewed 2026-10-21 for wave 2a of `goals/effected-promotion` (SPEC D-27 and
D-28).

`bun run beep quality cache-policy` reported 16 blocking findings, all
introduced by this branch (the `origin/main` baseline checkout reports none):

- Unreviewed expansions for the two new workspaces, eight task tuples each
  (`#build`, `#check`, `#docgen`, `#lint`, `#lint:deprecated-apis`,
  `#lint:jsdoc`, `#lint:laws`, `#test`): `@beep/npm-spec` and
  `@beep/tsconfig`.

No configuration drift and no root (`//`) expansion was reported. The lab
importers that now import `@beep/npm-spec/<Module>` and `@beep/tsconfig/<Module>`
leaves live in `@beep/scratchpad`, which the policy does not report.

Both workspaces were scaffolded by `bun run beep create-package` in
foundation/modeling. Each scripts block is the generated task set, and neither
carries a `turbo.json`, as the library scaffold emits none.

Recording these subjects accepts the existing posture for the two new
workspaces. No qualification is granted, and no other subject changes.
