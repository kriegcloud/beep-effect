# Form Substrate (@beep/form)

## Status

Lifecycle: `active` — SPEC signed off (via the documented `/goal` launch); **P1
complete (green); P2 next.** Package scaffolded; schema-first core + all 17
fields bound/registered; 16 unit tests + 18 Storybook `play` tests passing.

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

**P1 Core + fields — complete (green).** `@beep/form` is scaffolded at
`packages/foundation/ui-system/form` and the schema-first core + full field set
are built and verified. Core: `toFormSchema` (Standard-Schema validation),
`getDefaultFormValues` (`schema.make({})`), `toFieldErrors` (issues →
`FieldError`), the four `formOptions` builders (sync/async slot routing +
decode-at-submit), `Path` helpers, `FieldOption`, the `useAppForm` factory, and
`Form`/`SubmitButton`. **17 fields** bound to `@beep/ui` primitives and
registered: Text, Textarea, Number, Select, NativeSelect, Combobox, Autocomplete,
MultiSelect, Checkbox, MultiCheckbox, Switch, MultiSwitch, RadioGroup, Slider,
Toggle, ToggleGroup, OTP. (Standalone `Radio` is intentionally subsumed by
`RadioGroup` — a single boolean-radio is niche; surface as a follow-up if needed.)

**Next: P2** (port `AdapterEffectDateTime` to effect v4 into `@beep/ui` as a new
MUI-x date/time family; reconcile its `./schema` into `@beep/schema`; bind
Date/DateTime/Time fields), then **P3** (heavy widgets), **P4** (full verify),
**P5** (close).

## Latest Evidence

- P1 (2026-06-18) — green: `bun run beep:check`, `beep:lint`, `beep:test` pass
  for `@beep/form` (5 unit-test files / 16 tests). **All 18 Storybook stories
  (17 fields + `Form/Demo`) pass their `play` tests in headless chromium** via
  `vitest --config vitest.storybook.config.ts`. Branch synced with `origin/main`
  (0 behind). Notable infra fixes: `Path.ts` made envelope-clean (dropped
  `@beep/types`); test/stories tsconfigs given project references so they consume
  `@beep/ui` `.d.ts` instead of re-typechecking its transitive deps (the phosphor
  resolution issue).
- P0 research artifacts under [`research/`](./research/) (dated 2026-06-18):
  codebase grounding, widget-library selections, core best-practice notes, and
  the design-review note.

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
