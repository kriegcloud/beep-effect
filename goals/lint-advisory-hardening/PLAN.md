# Lint Advisory Hardening Plan

## Status

Status: `active`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | done | Confirm scope, current inventory, owners, and CI bypass risks. | Inventory and decisions recorded. |
| P1 Implement | done | Add policy lane, harden checkers, and clear current findings. | Acceptance criteria are implemented. |
| P2 Verify | in-progress | Run focused and repo quality proof. | Required commands pass or blockers are recorded. |
| P3 Close | pending | Publish, monitor, and close the packet. | PR is mergeable; packet reflection exists. |

## Implementation Plan

1. Create this packet and baseline inventory.
2. Extract root lint policy steps behind a reusable `bun run beep lint policy`
   command and keep unscoped root `bun run lint` behavior equivalent.
3. Add a dedicated PR CI lane for `bun run beep lint policy`.
4. Harden `native-runtime` false positives with precise context checks before
   treating the remaining warnings as the real backlog.
5. Fix the current `terse-effect`, `native-runtime`, and reflection backlog.
6. Promote `terse-effect`, `native-runtime`, `reflection-artifacts`, and
   `schema-first` advisory categories to failures.
7. Update docs and tests.
8. Run Yeet verify, publish, and monitor.

## P3 Closeout Checklist

Before marking the packet closed:

1. Write a closeout reflection to
   `history/reflections/<YYYY-MM-DD>-codex.md`.
2. Run `bun run beep lint reflection-artifacts`.
3. Update `README.md`, `ops/manifest.json`, and this plan with final evidence.

## Verification Commands

```sh
test "$(wc -m < goals/lint-advisory-hardening/GOAL.md)" -le 4000
jq . goals/lint-advisory-hardening/ops/manifest.json
git diff --check -- goals/lint-advisory-hardening
bun run beep laws terse-effect --check
bun run beep laws native-runtime --check
bun run beep lint reflection-artifacts
bun run beep lint schema-first
bun run beep lint policy
bun run lint
bun run beep yeet verify
```
