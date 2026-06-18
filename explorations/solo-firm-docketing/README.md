# Solo-Firm IP Docketing

## Status

Stage: `align`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

Tom's solo IP practice cannot miss a deadline — office-action response periods,
filing windows, patent maintenance/annuity fees, and court orders, some of them
*years* out, where a miss is malpractice. The product promises "it never misses
the deadline" yet its doctrine says it does not *replace* docketing. This packet
lands on how we deal with docketing: handroll, integrate a paid solution with a
good API/MCP/SDK, or hybrid — reliable, agent-integratable, and developer-sane.

## Next Open Question

**Held at the review gate by request.** Research (three deep-research tracks +
in-repo inventory) and align are complete; the recommendation lives at the bottom
of [`DECISIONS.md`](./DECISIONS.md). Before `shape`, the user confirms four things
(see `ops/manifest.json` `openQuestions`): (1) L2 = narrow-handroll-first vs
buy-first; (2) US-patents-first scope; (3) the dead-man's-switch reliability model
as a first-class requirement; (4) whether to evaluate CPI/LawToolBox partner-API
access now or after the handroll spine ships.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - cited prior art + capability inventory (stage 1).
4. [`research/`](./research/) - the three full deep-research reports cited by RESEARCH.md.
5. [`DECISIONS.md`](./DECISIONS.md) - grilling log + recommendation (stage 2).
6. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, not started — held at review gate).
7. [`MAP.md`](./MAP.md) - decomposition (stage 4, not started — held at review gate).

## Related Packets

- [`microsoft-365-integration`](../microsoft-365-integration/README.md) — owns the
  Outlook/Graph **transport** (native `@beep/m365` Effect driver + own MCP server,
  delegated auth, `Calendars.ReadWrite` reserved). Docketing **reuses** it as the
  Outlook push channel and **drives** its calendar-write scope reservation.
- [`EXAMPLE.md`](../EXAMPLE.md) — the *fictional* `matter-deadline-radar` prior:
  it killed escalating reminders ("different product, wouldn't be trusted") and
  did zero deadline math. This packet consciously revisits that kill with a
  *trustworthy* (approval-gated, redundant, dead-man's-switch) reminder design.

## Trail

<Dated one-liners, newest first: what each session did and where it stopped.>

- 2026-06-18: packet opened straight at `research` (capture = the user's written
  brief + four locked planning-grill decisions). Ran three deep-research tracks
  (IP-prosecution docketing; court/litigation deadline engines; official-data /
  handroll route), wrote `RESEARCH.md` + `research/0{1,2,3}-*.md`, logged align in
  `DECISIONS.md` (doctrine = vigilance overlay, not system of record) and a
  per-layer recommendation. Stopped at the review gate before shape.
