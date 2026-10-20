# Practice Claude Code mod: friction ledger

| Date | Work | Evidence | Prevention |
| --- | --- | --- | --- |
| 2026-10-14 | Gate repair in a sandboxed Codex lane | Inside the Codex workspace-write sandbox, `claude plugin test dist/plugin` exits 0 with "run ended without a report", even for a one-assertion test; the per-file child (`claude plugin test --file <test> <plugin>`) reports all six tests passing. In the owning operator session the aggregate command passes (6 pass). | Run `bun run plugin:test` from the owning session, not a sandboxed lane; treat a sandboxed "no report" as environment-only. |
| 2026-10-14 | Vitest in the same sandbox | Bun fork workers timed out at startup inside the sandbox; the suite passes (12 tests) with the repo's shared config in the owning session, so the lane's `pool: "threads"` override was reverted. | Same: run the app's vitest from the owning session. |
| 2026-10-14 | Release-check shape for the mod | `claude plugin validate` reads the hooks module statically: a name containing "claude" reads as Anthropic's, `register` must be a function declaration, hooks must be literals, `$`/`on` pass only into `const`/function-declared top-level functions, and bun bundles emit `var`. Cost about ten build/validate rounds. | Encoded in `src/build-plugin.ts` (generated entry, unminified, `var` to `const`) and SPEC D17. |
| 2026-10-14 | Slice 2 live response probe in the sandbox | Real server preflight at the supplied test bundle failed with `PgliteClient: Failed to connect`; an isolated copy under the writable scratch root served `kg_clients` and `kg_matter_lookup` successfully. The latter returned `content` JSON text and `isError: false`, without `structuredContent`. No client values were retained. | Probe disposable writable copies of the test bundle when the sandbox denies database writes to the original path. |
| 2026-10-14 | Slice 2 runner and hosted-log verification | Bun Vitest forks timed out before loading all five files; Node Vitest with `--pool=threads` passed 21 tests. Aggregate plugin tests again ended without a report; per-file execution exposed actionable fixture mistakes. Hosted job log reads failed with `error connecting to api.github.com`. | Keep per-file engine tests and a Node threads fallback available; inspect hosted JSDoc Ratchet job 115853747204 from the owning session before publication. |
| 2026-10-14 | Verify ported skill discovery | Claude Code 2.1.299: `claude plugin validate dist/plugin --json` succeeds but reports hooks only. Validating the skills directory returns an empty contents array. All five built SKILL.md files and their frontmatter were verified separately. | Have the validator inventory default plugin skill directories; confirm live skill discovery in the owning session before claiming the skills load. |
| 2026-10-14 | Flipping PR #1756 ready | `bun run beep yeet ready` refused with "blocked on threads-resolved: 0 review thread(s) still owe an answer" while GraphQL `reviewThreads.totalCount` was 0; `gh pr ready` worked. | The threads-resolved gate should pass on zero threads (or report the read failure it actually hit). |

## Verdict envelope promotion verification (2026-10-14)

- `bun run plugin:test`: aggregate runner reports "the file did not load" /
  "run ended without a report (exit code 0)" after plugin validation succeeds.
  The absolute-path `claude plugin test --file` runner passes all 15 cases.
  A sandbox-aware aggregate runner would avoid the extra verification pass.
- Default Vitest forks did not report test results in the sandbox; the
  requested `--pool=threads` fallback runs the six files successfully.
- `bunx turbo run knip:check`: "Could not find task `knip:check` in project";
  this checkout has retired Knip. Keep verification lists aligned with the
  current task catalog.
- The new workspace dependency requires generated TypeScript/Fallow config
  updates and a reviewed cache baseline refresh. Run config sync immediately
  after changing workspace dependency edges to surface this together.
- Lockfile-only install fails in the sandbox with read-only temporary/cache
  paths; a retry with temporary paths then reports existing `catalog:` entries
  missing. The only required lock change is the already-resolved domain
  workspace dependency in this app's lock entry; it was synchronized directly.
