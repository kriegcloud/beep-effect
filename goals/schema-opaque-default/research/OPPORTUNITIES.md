# Opportunities

Friction receipts recorded while executing this goal.

## 2026-10-14: line-keyed inventories forget documented exceptions after a mass rewrite

- Doing: refreshing `standards/effect-vitest.inventory.jsonc` and
  `standards/schema-first.inventory.jsonc` after codemods that moved lines and
  rewrote evidence text (`new X` to `X.make`, `instanceof` to `S.is`, `.find` to
  `A.findFirst`; first seen on #1636, again here).
- Evidence: `bun run beep lint effect-vitest --write` re-keys a moved row (its id
  embeds line and evidence) and writes it back as `open`; `lint schema-first
  --write` turns a moved `exception` into an `advisory` with the generic message.
  On #1636 that dropped 33 documented exception reasons until they were carried
  back by hand from `origin/main`'s copy.
- Prevention: have `--write` carry `status` and `reason` from a disappeared row to
  the new row with the same (file, ruleId, symbol), nearest line first, and report
  what it carried.

## 2026-10-14: desktop session restarts kill running sub-agents

- Doing: a long codemod/proof sub-agent in this lane.
- Evidence: two session restarts (an account switch and a host restart) stopped the
  agent mid-run; the completion notice read "didn't finish before the previous
  session ended", and the `bun run check` / docgen results in flight were lost and
  had to be re-run.
- Prevention: run proofs as detached `beep-proof-*` jobs (`--detach`, then
  `yeet job wait`) and have agents write each result to the packet as it lands,
  so a restart costs only the step in progress.
