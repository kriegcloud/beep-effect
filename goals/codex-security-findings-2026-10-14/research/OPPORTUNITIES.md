# Friction receipts

## 2026-10-14: fresh worktree package check lacks built dependency declarations

- Doing: verifying the first `@beep/repo-cli` security repair in a newly
  bootstrapped sibling worktree.
- Evidence: `bun run beep quality package-verify @beep/repo-cli --quick`
  passed lint but its `beep:check` step reported `TS6305` for missing
  `@beep/utils`, `@beep/schema`, and repo-utils `dist/*.d.ts`, followed by
  cascaded type errors. The focused 21-test parser suite passed.
- Would have prevented it: package verification building or identifying its
  dependency declaration closure before reporting source diagnostics, or a
  clear preflight naming the required build command.

## 2026-10-14: GraphQL quota hides PR file ownership

- Doing: checking whether the open Yeet S11 PR overlaps the security repair.
- Evidence: `gh pr view 1678 --json files` returned `API rate limit already
  exceeded`; the REST `/pulls/1678/files` call supplied the file list.
- Would have prevented it: a REST fallback for the read-only PR-file lookup
  when GraphQL quota is exhausted.

## 2026-10-14: Bun config flag silently changed command interpretation

- Doing: blocking an untrusted source checkout from loading a Bun preload
  before the signed pilot worker starts.
- Evidence: with Bun 1.4.2, `--config <path>` still loaded the source checkout's
  `bunfig.toml` and did not run the worker, while `--config=<path>` suppressed
  the preload and ran the worker. Both forms exited zero in the small isolated
  reproduction.
- Would have prevented it: CLI argument-shape tests that execute the pinned
  Bun version instead of checking only a mocked process argument list.
