# Form Substrate (@beep/form) Plan

## Status

Status: `P5 complete (closed; full Yeet verify green)` — SPEC signed off via the documented
`/goal` launch.

This plan describes the **full** implementation lifecycle (P0→Close). P0
(research + packet authorship) and P1 (core + all 17 fields + units + stories
with passing `play` tests) are complete; P2 (dates adapter), P3 (heavy
third-party fields), P4 (full Yeet verify), and P5 (closeout reflection) are
complete.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | complete | Verify codebase facts; select 2026 widget libraries; record the form-core / validation / atom-boundary / date-adapter design. | `research/` holds the codebase-grounding note, widget-library selections (each pinned + adversarially verified), tanstack/base-ui/effect-schema notes, and the design-review note. Scaffolder confirmed by `--dry-run`. No locked-decision contradictions (or any are surfaced). |
| P1 Core + simple fields | complete | Scaffold `@beep/form`; build the form-core API + the validation adapter + the defaults extractor; bind the P1 fields to existing `@beep/ui` primitives. | DONE + green: scaffold, core (toFormSchema/getDefaultFormValues/toFieldErrors/4 formOptions builders/Path/Options/contexts), useAppForm factory + Form/SubmitButton, **17 fields** bound + registered, 16 core unit tests, **18 Storybook stories with `play` tests passing in chromium**. `check`/`lint`/`test` green; branch synced with main. |
| P2 Dates (adapter port) | complete | Port `AdapterEffectDateTime` to effect v4 into `@beep/ui` as a new MUI-x date/time primitive family; reconcile its `./schema` into `@beep/schema`; bind Date/DateTime/Time fields. | DONE + green: schema role helpers/tests, new `@beep/ui` MUI-X Effect DateTime primitive family + adapter unit tests, legal `@beep/ui` → `@beep/schema` dep/reference, Date/DateTime/Time fields registered, 21 form Storybook `play` tests passing in chromium. Full Yeet verify remains P4. |
| P3 Heavy third-party fields | complete | Add the P3 base-ui/Tailwind primitives to `@beep/ui` (using the P0-selected libraries); bind Phone/Country/Color/Rating/Emoji/Upload fields. | DONE + green: exact-pinned P3 libraries cataloged, `@beep/ui` primitives added (Phone/Country/Color/Rating/Emoji/Upload family), `@beep/form` fields registered, helper unit tests added, 29 form Storybook `play` tests passing in chromium. Full Yeet verify remains P4. |
| P4 Verify | complete | Run the full quality lane and capture evidence. | DONE + green: `bun run beep yeet verify` passed on 2026-06-18 after the repo-sanity writers refreshed tsconfig/docgen and fallow boundaries; all 29 form Storybook `play` tests pass in chromium; docgen, lint, typecheck, tests, secrets, security, SAST, and Nix gates pass. |
| P5 Close | complete | PR, review response, closeout reflection, readiness. | DONE: packet status + evidence updated, closeout reflection exists, and `bun run beep lint reflection-artifacts` is the closeout gate. |

### P1 exit criteria (Core + simple fields)

Setup prerequisites (proofs):

1. Scaffold with `bun run beep create-package form --family foundation --kind
   ui-system --with-stories-tsconfig` (run `--dry-run` first). Confirm it lands at
   `packages/foundation/ui-system/form` named `@beep/form` with a `beep` block
   `{ family: foundation, kind: ui-system }`. Then mirror **`@beep/editor`** to
   fix up the `exports` map shape, `sideEffects`, and `peerDependencies`. **Do
   NOT** use the slice scaffolder (`architecture create package …`).
2. Browser-safe contract: every client file starts with `"use client"`;
   `react`/`react-dom` (and `next` if used) are `peerDependencies`, not
   `dependencies` (mirror `@beep/ui`). Declare every workspace dep explicitly
   (`@beep/ui`, `@beep/schema`, `@beep/utils`) — do not rely on transitive
   resolution.
3. Catalog: add exact-pin entries `"@tanstack/react-form": "1.33.0"` (and
   `"@tanstack/form-core": "1.33.0"` if referenced directly) to the root
   `catalog`; reference as `"catalog:"`. (`effect`, `@base-ui/react`,
   `@effect/atom-react`, `@mui/x-date-pickers`, `@mui/material` are already
   cataloged.)
4. Registration: the scaffolder auto-syncs root `tsconfig.json` aliases +
   references and registers `$FormId` in identity. **Manually** wire Storybook:
   add `"@beep/form": "workspace:^"` to `apps/storybook/package.json` (mirror the
   `@beep/ui` entry) and `@beep/form`/`@beep/form/*` paths + a `tsconfig.json`
   reference to `apps/storybook/tsconfig.stories.json`. Confirm
   `tsconfig.quality.packages.json` has `{ "path":
   "packages/foundation/ui-system/form" }`. Stories live in the package-root
   `stories/` dir (mirror `@beep/editor/stories/`).

Form-core (modernized from beep-effect4 `src/form/`, re-derived for tanstack
v1.33 + effect v4):

5. `useAppForm` via `createFormHook` + `createFormHookContexts`, registering all
   P1 field components + form components (`SubmitButton`); export `withForm` and
   `withFieldGroup`. `Form` wrapper. `SubmitButton` subscribes to
   `canSubmit`/`isSubmitting` via `form.Subscribe`.
6. Form-options builders: `makeFormOptions`, `formOptionsWithDefaults` (uses the
   defaults extractor), `formOptionsWithSubmit` (its `onSubmit` MAY bridge to an
   atom mutation per the sanctioned seam).
7. Validation adapter: `Schema.toStandardSchemaV1(schema)` passed to tanstack
   `validators.onChange/onBlur/onSubmit` (auto-detected; the explicit helper is
   `standardSchemaValidators` — PLURAL — from `@tanstack/form-core`). Standard-
   Schema issues map to `@beep/ui` `FieldError` by path; set
   `data-invalid`/`aria-invalid` when issues exist. **Do NOT** port the
   beep-effect4 `ArrayFormatter` adapter.
8. Defaults extractor: `getDefaultFormValues(schema)` invokes `schema.make({})`
   to materialize constructor defaults (declared via `S.withConstructorDefault`
   or `@beep/schema` `withKeyDefaults`). Document/guard the "all fields must be
   defaulted/optional" totality caveat.
9. Atom-state boundary: `@tanstack/react-form` owns ALL form/field/validation/
   submission state. Replace every non-form field-internal
   `useState`/`useMemo`/`useCallback` with scoped atoms
   (`@effect/atom-react` `make`/`useAtom` + `effect/unstable/reactivity`),
   mirroring `@beep/ui` `date-picker.tsx`. Keep DOM refs as React refs.
10. P1 fields bound to existing `@beep/ui` primitives: Text→input,
    Textarea→textarea, Number→input(number)/`useNumberInput`, Select→select,
    NativeSelect→native-select, Combobox/Autocomplete→combobox/command,
    MultiSelect→combobox(multiple, chips), Checkbox→checkbox,
    MultiCheckbox→checkbox group, Switch→switch, MultiSwitch→switch group, Radio &
    RadioGroup→radio-group, Slider→slider, Toggle/ToggleGroup→toggle(-group),
    OTP→input-otp. Each field: a `*.stories.tsx` story + `play` test in
    `stories/`. `@effect/vitest` units for the validation adapter, defaults
    extractor, and pure helpers. JSDoc (`@example`/`@category`/`@since`) on all
    public exports.

### P2 exit criteria (Dates)

11. Port `AdapterEffectDateTime` (beep-effect4
    `packages/ui/core/src/adapters/AdapterEffectDateTime.ts`) to effect v4 and
    place it (+ a `LocalizationProvider` wrapper) in `@beep/ui` as a NEW MUI-x
    date/time primitive family that **coexists** with the existing non-MUI
    `date-picker.tsx` (distinct name; do not replace it). Fix the `getYearRange`
    exclusive-`lessThan` bug on port; confirm v4 `DateTime` parity for the
    `unsafe*`/NaN-invalid paths.
12. Reconcile the adapter's local `./schema` helper **into** the existing
    `@beep/schema` `DateTimeUtcFromValid` (+ `DateTimeInput*`, `LocalDate`)
    concept by adding role files within that concept's topology — do **not** fork
    it, and do **not** confuse it with `@beep/shared-domain/values/LocalDate`.
13. New `@beep/ui → @beep/schema` workspace dep + project reference wired
    explicitly (legal under ui-system→modeling).
14. Date/DateTime/Time fields bind the MUI-x stack; canonical value type is
    effect `DateTime`. Story + `play` test per field; `@effect/vitest` units for
    the ported adapter.

### P3 exit criteria (Heavy third-party fields)

15. For each P3 widget, add the base-ui/Tailwind primitive to `@beep/ui` FIRST
    (using the P0-selected 2026 libraries — see
    [`research/2026-06-18-field-widget-libraries.md`](./research/2026-06-18-field-widget-libraries.md)),
    then bind the field in `@beep/form`: Phone (E.164), Country (base-ui Combobox
    + dataset + flags; NO external picker lib), Color (picker UI new; value/
    transforms off `@beep/schema` `Color/`), Rating, Emoji,
    Upload/UploadAvatar/UploadBox (dropzone). Catalog any selected libs as
    exact pins.
16. Each P3 field + primitive: a `*.stories.tsx` story + `play` test;
    `@effect/vitest` units where there is non-visual logic; JSDoc on all exports.

## P5 Closeout Checklist

Before marking the packet closed (and `status` → `completed-retained` /
`complete`):

1. Write a closeout reflection via the `/reflect` skill (or copy
   `_template/history/reflections/_TEMPLATE.md`) to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Critique the repo **tooling**,
   the **implementation**, and the **goal/prompt**. Capture TODOs worth
   codifying. Its YAML frontmatter must validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts` (`reflectionRequired: true`, so a
   missing/invalid reflection blocks closeout).
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.

## Current Blockers

- None. SPEC sign-off was given via the documented `/goal` launch (see
  `README.md` Launch), implementation is complete, full Yeet verify is green,
  and the closeout reflection is recorded.

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive run outputs under `history/`.
- If execution surfaces a finding that contradicts a locked decision, STOP and
  surface it for sign-off rather than diverging.

## Verification Commands

```sh
test "$(wc -m < goals/form/GOAL.md)" -le 4000
jq . goals/form/ops/manifest.json
rg -n "form|GOAL.md|agentLaunchers|packetAnchorDocument" goals/form
git diff --check -- goals/form
bun run beep lint reflection-artifacts
bun run beep yeet verify
```
