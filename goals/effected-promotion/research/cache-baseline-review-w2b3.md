# Cache baseline review: wave 2b-3

Reviewed 2026-10-21 for wave 2b-3 of `goals/effected-promotion` (SPEC D-31,
D-33 and D-36).

`bun run beep quality cache-policy` reported 21 blocking findings and one
review-level source drift, all introduced by this branch (the wave-2b-1 head
checkout, `18558794ac`, reports none):

- Unreviewed expansion for the new workspace `@beep/runtime-env`, eight task
  tuples (`#build`, `#check`, `#docgen`, `#lint`, `#lint:deprecated-apis`,
  `#lint:jsdoc`, `#lint:laws`, `#test`).
- Configuration drift on the two adopters that D-33 moves onto
  `@beep/runtime-env/ColorLevel`: `@beep/chalk` and `@beep/colors` (`#build`,
  `#check`, `#doctest`, `#lint:deprecated-apis`, `#test`, `#test:property`
  for each). Each drifted tuple follows from the new `@beep/runtime-env`
  workspace dependency in its manifest and the matching `tsconfig.json`
  reference; no command, input, output or cache flag changed.
- Root (`//`) drift on `//#lint:policy-fingerprint`, with the matching
  `turbo.json` source drift. `bun run beep lint policy-fingerprint --write`
  added the `@beep/runtime-env` `package.json` and `src/**` globs to the task
  inputs and to `standards/policy-tools.fingerprint.json`, because the package
  entered `@beep/repo-cli`'s dependency closure through `@beep/chalk` and
  `@beep/colors`. No other root task changed.

`@beep/repo-cli`, `@beep/repo-docgen`, `@beep/observability` and
`@beep/postgres` import the adopters but their manifests are unchanged, and the
policy reports no drift for them. The lab importers that now import
`@beep/runtime-env/<Module>` leaves live in `@beep/scratchpad`, which the policy
does not report; its recorded projection is unchanged. The policy-pack
`@beep/lint-rules` change (one allowlist entry removed and its fixture
retargeted) touches source only and reports no drift.

`@beep/runtime-env` was scaffolded by `bun run beep create-package` in
foundation/capability. Its scripts block is the generated task set, and it
carries no `turbo.json`, as the library scaffold emits none.

Recording these subjects accepts the existing posture for the new workspace,
the dependency-only drift of the two adopters, and the input-only growth of the
root policy-fingerprint task. No qualification is granted, and no other subject
changes.
