# Cache baseline re-record: `@beep/practice-claude-mod` after the gate repair

Reviewed 2026-10-14. The gate repair added the `@beep/test-runner` dev
dependency and its tsconfig reference, which moves the dependency digest of
`#build`, `#check`, `#lint:deprecated-apis` and `#test`. Commands, outputs,
env and cache flags are unchanged; no qualification is granted. The first
review is `cache-baseline-review.md`.
