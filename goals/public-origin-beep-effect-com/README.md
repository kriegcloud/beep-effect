# Single public origin beep-effect.com

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Move the identity authority to the beep-effect.com/ns/ root, reserve the apex
route table in `@beep/public-site`, and gate the retired hosts.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/public-origin-beep-effect-com/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth, including the D1 to D6
   operator decisions and the I1 to I17 rulings.
3. [`PLAN.md`](./PLAN.md) - phases and closeout checklist.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`history/2026-10-20-operator-brief.md`](./history/2026-10-20-operator-brief.md) -
   the operator brief, verbatim. It is the only file that writes the retired
   hosts in full.
6. [`research/SOURCES.md`](./research/SOURCES.md) - sources and provenance.

## Current Phase

P0 to P3 are complete: the packet and doctrine, `@beep/public-site`, the
authority move with the drift folding and residue rewrite, and the
`retired-iri-authorities` law with its lane. P4 closeout is in progress: the
reflection is written and the closeout proposal rides the final PR.

## Latest Evidence

Proof on the final branch (2026-10-21):

- `bun run beep laws retired-iri-authorities --check`: 36,895 tracked files,
  0 findings; a seeded tracked violation turns it red in
  `laws-retired-iri-authorities.test.ts`.
- `bun run beep quality package-verify` green for all 19 touched workspaces,
  run through `beep-heavy`.
- `bun run beep cache audit`: 0 blocking findings after the reviewed re-record
  in `research/retired-iri-authorities-baseline-request.json`.
- `knowledge refs --check`, `knowledge doctor ci` and
  `knowledge semantic-delta`: 0 introduced; `goals doctor`: no new blocking
  findings; `lint reflection-artifacts`: 0 findings.
- Reflection: `history/reflections/2026-10-21-claude.md`.

Doctrine landed with this packet:

- `standards/architecture/DECISIONS.md`, entry of 2026-10-20.
- `standards/architecture/GLOSSARY.md`: Identity Authority, Public Origin,
  Site Route.
- `standards/ARCHITECTURE.md`, core principle 8.
- `explorations/identity-as-iri/DECISIONS.md`, supersession entry of
  2026-10-20.
- `explorations/knowledge-endgame/README.md`, trail note of 2026-10-20.

## Notes

- One PR carries code and doctrine. No deployment, Cloudflare config or CI
  deploy workflow; each surface gets its own deployment goal.
- No changesets: every affected workspace is private (I8).
- Outside `history/`, retired hosts are written defanged: ns[.]beep[.]sh,
  beep[.]sh, beep[.]dev, beep-effect[.]dev.
