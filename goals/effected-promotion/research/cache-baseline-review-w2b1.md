# Cache baseline review: wave 2b-1

Reviewed 2026-10-21 for wave 2b-1 of `goals/effected-promotion` (SPEC D-31 and
D-32).

`bun run beep quality cache-policy` reported 20 blocking findings and one
review-level source drift, all introduced by this branch (the wave-2a head
checkout reports none):

- Unreviewed expansion for the new workspace `@beep/walker`, eight task tuples
  (`#build`, `#check`, `#docgen`, `#lint`, `#lint:deprecated-apis`,
  `#lint:jsdoc`, `#lint:laws`, `#test`).
- Configuration drift on the two adopters that D-32 moves onto
  `@beep/walker/Walker`: `@beep/repo-utils` (`#build`, `#check`,
  `#lint:deprecated-apis`, `#test`, `#test:property`) and `@beep/repo-cli`
  (the same five plus `#doctest`). Each drifted tuple follows from the new
  `@beep/walker` workspace dependency in its manifest; no command, input,
  output or cache flag changed.
- Root (`//`) drift on `//#lint:policy-fingerprint`, with the matching
  `turbo.json` source drift. `bun run beep lint policy-fingerprint --write`
  added the `@beep/walker` and `@beep/glob` `package.json` and `src/**` globs
  to the task inputs and to `standards/policy-tools.fingerprint.json`, because
  both packages entered `@beep/repo-cli`'s dependency closure. No other root
  task changed.

The lab importers that now import `@beep/walker/<Module>` leaves live in
`@beep/scratchpad`, which the policy does not report; its recorded projection
is unchanged.

`@beep/walker` was scaffolded by `bun run beep create-package` in
foundation/capability. Its scripts block is the generated task set, and it
carries no `turbo.json`, as the library scaffold emits none.

Recording these subjects accepts the existing posture for the new workspace,
the dependency-only drift of the two adopters, and the input-only growth of the
root policy-fingerprint task. No qualification is granted, and no other subject
changes.
