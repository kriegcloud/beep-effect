# Form Substrate (@beep/form)

## Status

Lifecycle: `active` — P0 research complete; **awaiting `SPEC.md` sign-off before
P1 begins.**

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Build `@beep/form` (`packages/foundation/ui-system/form`): a reusable,
effect-first, schema-first form/input substrate on `@tanstack/react-form` v1.33
+ effect v4, binding fields to existing `@beep/ui` base-ui/Tailwind primitives,
with a schema as the single source of validation **and** default values. Proven
by a Storybook story + `play` test for every field and a working demo form.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/form/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth (locked decisions, scope,
   acceptance, stop conditions).
3. [`PLAN.md`](./PLAN.md) - full P0→Close execution plan with per-phase exit
   criteria.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - P0 deep-dive: codebase grounding, 2026 widget
   library selections, tanstack-form / base-ui / effect-schema notes, and the
   design-review note.
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

**P0 Research — complete.** Codebase facts verified (scaffolder confirmed via
two `--dry-run` proofs), 2026 field-widget libraries selected and adversarially
verified, and the form-core / validation / atom-boundary / date-adapter design
recorded in `research/`. **Next concrete action: human sign-off on `SPEC.md`.**
Do **not** start P1 implementation until sign-off lands.

## Latest Evidence

P0 research artifacts under [`research/`](./research/) (dated 2026-06-18):
codebase grounding, widget-library selections, core best-practice notes, and the
design-review note. No implementation evidence yet (P1 not started).

## Notes

- Decisions were locked in a grilling session before authorship — see the
  `SPEC.md` "Locked Decisions" log. Do **not** re-grill. If execution surfaces a
  finding that contradicts a locked decision, **stop and surface it** for
  sign-off rather than diverging.
- This packet touches two foundation packages: the new `@beep/form`
  (ui-system) **and** additive changes to `@beep/ui` (new MUI-x date primitives +
  new P3 heavy primitives) and `@beep/schema` (date-adapter reconciliation). It
  introduces a new `@beep/ui → @beep/schema` dependency (legal under
  ui-system→modeling).
- Closest worked precedent in `goals/`: `rich-text-foundation` (same
  foundation/ui-system + foundation/modeling cross-cut shape).
