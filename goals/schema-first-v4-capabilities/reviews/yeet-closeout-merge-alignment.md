# Yeet Closeout Merge Alignment

## Context

The branch merged `origin/feat/yeet-pr-closeout-loop` before continuing the
schema-first packet so the initiative tracks the Yeet command shape that is
expected to merge soon. The latest aligned remote head was `caddde1e54`
(`feat(repo-cli): harden yeet quality ergonomics`).

## Packet Changes

- P5 now names `bun run beep yeet verify --tier review-fix` for review-fix
  iteration.
- P5 now treats `yeet closeout` as the read-first hosted PR review gate.
- P5 now records `publish --start-pr-early --monitor` as the explicit
  remote-overlap path, distinct from `--fast`.
- P5 now mentions hardware profile detection before unusually heavy parallel
  proof work.
- The manifest records the exact closeout command and proof-reuse policy.
- The packet keeps structured `schema-first-policy` issue proof tied to the
  focused lint and Yeet parser tests added during P2.
- The packet acknowledges current Yeet failure packets: quality-lock behavior,
  known sub-lane hints, docgen proof manifests, terse-effect output categories,
  and richer closeout handoff state for review bots.

## Review Notes

Proof reuse is intentionally not an escape hatch. Use
`publish --amend --no-edit --reuse-verified` or
`publish --push-only --reuse-verified` only when Yeet accepts exact matching
state for the current branch and worktree.

`yeet closeout` should inspect hosted review state before claiming merge
readiness. It should not retrigger Greptile unless a future operator explicitly
chooses `--retrigger-greptile`.

`publish --start-pr-early --monitor` intentionally skips commit/pre-push hooks
to get hosted checks and reviewers moving, but it still runs full local proof.
Treat follow-up failures as required fixes, not as waived evidence.
