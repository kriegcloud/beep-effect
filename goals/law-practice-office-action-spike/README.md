# Law-Practice Office-Action Spike

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Graduate the `law-practice` slice from domain-only to minimum-viable (domain +
use-cases + server): add the IP-law vertical (OfficeAction / Claim /
Rejection §101-§102-§103-§112 / PriorArt / Distinction) as bespoke
Effect-Schema, the IR→law-entity mapping, and wire the rung-0 office-action
review loop end-to-end on **one** fixture office action with a trivial view.
Depends on `epistemic-claim-lifecycle-gate` (composed only via its public
surface).

Graduated from
[`explorations/atlas-synthesis`](../../explorations/atlas-synthesis/MAP.md)
(the decomposition). Sibling: `epistemic-claim-lifecycle-gate` (build that
first).

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/law-practice-office-action-spike/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - supporting research, if present.
6. [`history/`](./history/) - evidence and closeouts, if present.

Product authority: `goals/agentic-professional-runtime/SPEC.md` +
[`docs/data-model-law-practice.md`](../agentic-professional-runtime/docs/data-model-law-practice.md).
Referenced (not merged): `goals/ip-law-knowledge-graph`,
`goals/oppold-corpus-pipeline`.

## Current Phase

`P0 Schema / data-model` — not started. Next concrete action: design the
bespoke `OfficeAction`/`Claim`/`Rejection`/`PriorArtReference`/`Distinction`
Effect-Schema in `@beep/law-practice-domain`, reconciling field names against
`docs/data-model-law-practice.md`. **Do not** start P1 wiring until the
`epistemic-claim-lifecycle-gate` public surface exists.

## Latest Evidence

Not started.

## Notes

- BINDING sequencing: schema → service-contract → implementation → verify.
  Forbidden anti-pattern: starting with loose helpers and composing a service
  at the end. Helpers are extracted **after** schema + contract are fixed.
- Slice ownership: epistemic owns the lifecycle/gate/projection mechanism +
  the `Evidence(char-span)` primitive; this packet owns the IP-law product
  language + the IR→law mapping. Compose epistemic **only** via its public
  surface; no direct slice-to-slice internal imports.
- First slice is deliberately shallow: one §102, one claim, one ref, one
  distinction kind (`missing_limitation`). Multi-ref §103, §101/§112, the
  §132 response ladder, FalkorDB, and a real GraphRAG ask are DEFERRED.
- Privilege wall: the fixture OA is synthetic/public only — never a real
  client matter in the repo.
- Federation invariant: `OfficeAction.matterId` (matter wall) modeled now;
  any cross-matter view is a permissioned projection, enforcement deferrable.
