# Cache baseline review: wave 2b-2

Reviewed 2026-10-21 for wave 2b-2 of `goals/effected-promotion` (SPEC D-34 and
D-35).

`bun run beep quality cache-policy` reported 15 blocking findings and one review
item, all introduced by this branch (the `b7712d0aed` baseline checkout reports
none):

- Unreviewed expansions for the new workspace `@beep/github`, eight task tuples
  (`#build`, `#check`, `#docgen`, `#lint`, `#lint:deprecated-apis`,
  `#lint:jsdoc`, `#lint:laws`, `#test`).
- Configuration drift on `@beep/repo-cli` (`#build`, `#check`, `#doctest`,
  `#lint:deprecated-apis`, `#test`, `#test:property`). Its manifest swaps the
  npm `@effected/github` catalog dependency for the `@beep/github` workspace
  dependency; no command, input, output or cache flag changed.
- Configuration drift on the root tuple `//#lint:policy-fingerprint`, with the
  matching `turbo.json` source-drift review item. `bun run beep lint
  policy-fingerprint --write` added the declared inputs of the two packages
  that repo-cli's dependency closure now reaches,
  `packages/drivers/github/{package.json,src/**}` and
  `packages/foundation/modeling/semver/{package.json,src/**}`. The task
  command and cache flags are unchanged.

`@beep/github` was scaffolded by `bun run beep create-package` in drivers. Its
scripts block is the generated task set, and it carries no `turbo.json`. The lab
importers (`scratchpad/effected/github-actions`) live in `@beep/scratchpad`,
which the policy does not report.

Recording these subjects accepts the existing posture for the new workspace,
the dependency-only drift of repo-cli and the input-list drift of the root
policy-fingerprint task. No qualification is granted, and no other subject
changes.
