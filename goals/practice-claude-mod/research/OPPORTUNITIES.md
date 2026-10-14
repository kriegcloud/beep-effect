# Practice Claude Code mod: friction ledger

| Date | Work | Evidence | Prevention |
| --- | --- | --- | --- |
| 2026-10-14 | Gate repair in a sandboxed Codex lane | Inside the Codex workspace-write sandbox, `claude plugin test dist/plugin` exits 0 with "run ended without a report", even for a one-assertion test; the per-file child (`claude plugin test --file <test> <plugin>`) reports all six tests passing. In the owning operator session the aggregate command passes (6 pass). | Run `bun run plugin:test` from the owning session, not a sandboxed lane; treat a sandboxed "no report" as environment-only. |
| 2026-10-14 | Vitest in the same sandbox | Bun fork workers timed out at startup inside the sandbox; the suite passes (12 tests) with the repo's shared config in the owning session, so the lane's `pool: "threads"` override was reverted. | Same: run the app's vitest from the owning session. |
| 2026-10-14 | Release-check shape for the mod | `claude plugin validate` reads the hooks module statically: a name containing "claude" reads as Anthropic's, `register` must be a function declaration, hooks must be literals, `$`/`on` pass only into `const`/function-declared top-level functions, and bun bundles emit `var`. Cost about ten build/validate rounds. | Encoded in `src/build-plugin.ts` (generated entry, unminified, `var` to `const`) and SPEC D17. |
