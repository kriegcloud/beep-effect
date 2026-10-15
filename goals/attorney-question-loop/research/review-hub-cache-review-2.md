# Cache baseline re-record: `@beep/practice-review-hub` after P3c

Reviewed 2026-10-15. P3c adds the `notice` subcommand, which sends through `@beep/m365`. The app
now depends on `@beep/m365`, and `@beep/law-practice-domain` moved from dev to runtime
dependencies. Those new dependency edges change the digests of `#build`, `#check`,
`#lint:deprecated-apis` and `#test`. Commands, inputs, outputs, env and cache flags are
unchanged, and no qualification is granted. The first review is `review-hub-cache-review.md`.
