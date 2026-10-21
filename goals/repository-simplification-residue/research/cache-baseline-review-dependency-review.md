# Cache baseline review: #1882 dependency review

Reviewed 2026-10-21 for #1882 `residue-dependency-review`.

`bun run beep quality cache-policy` reported 7 blocking findings, all
introduced by this branch. The `origin/main` checkout this branch merged
reports none.

- Configuration drift for `@beep/repo-cli#build`, `#check`, `#doctest`,
  `#lint:deprecated-apis`, `#test` and `#test:property`. `@beep/repo-cli` now
  depends on `@beep/spdx`, which `beep ci dependency-review` uses to match
  licenses, so these tasks gain that workspace as a dependency input.
- Configuration drift for `//#lint:policy-fingerprint`, plus source drift for
  the root `turbo.json`. `beep lint policy-fingerprint --write` added the
  `@beep/spdx` `package.json` and `src/**` paths to the fingerprint task
  inputs, which follow the repo-cli dependency closure.

The commands, scripts and cache settings are unchanged. The only change is the
new dependency edge. Recording these subjects accepts the existing posture for
`//` and `@beep/repo-cli` with the added edge. No qualification is granted, and
no other subject changes.
