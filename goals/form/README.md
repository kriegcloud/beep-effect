# Form Substrate (@beep/form)

## Status

Lifecycle: `active` — SPEC signed off (via the documented `/goal` launch); **P1
in progress.** Package scaffolded and the schema-first core + first field set are
green (typecheck/lint/test).

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

**P1 Core + simple fields — in progress.** `@beep/form` is scaffolded at
`packages/foundation/ui-system/form` (family-aware scaffolder; `$FormId`
registered; root tsconfig + storybook wired; `@tanstack/react-form@1.33.0`
cataloged). The schema-first core is built and green: `toFormSchema`
(Standard-Schema validation), `getDefaultFormValues` (`schema.make({})`),
`toFieldErrors` (issues → `FieldError`), the four `formOptions` builders, the
`Path` helpers, the `useAppForm` factory, and `Form`/`SubmitButton`. First field
set bound to `@beep/ui` primitives: Text, Number, Textarea, Checkbox, Switch
(more landing). 16 `@effect/vitest`-style unit tests + a demo Storybook story
with a `play` test pass. Remaining P1: the rest of the field inventory + their
stories/tests, then P2 (dates) and P3 (heavy widgets).

## Latest Evidence

- P1 (2026-06-18): `bun run beep:check`, `beep:lint`, `beep:test` green for
  `@beep/form` (5 test files / 16 tests). Demo story `Form/Demo` with a `play`
  test. Notable infra fixes: `Path.ts` made envelope-clean (dropped `@beep/types`
  for `as unknown as`); test/stories tsconfigs given project references so they
  consume `@beep/ui` `.d.ts` instead of re-typechecking its transitive deps.
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
