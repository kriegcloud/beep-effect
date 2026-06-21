# Form Substrate (@beep/form) Spec

## Objective

The repo has one canonical, reusable, **effect-first, schema-first** form/input
substrate: **`@beep/form`** at `packages/foundation/ui-system/form` (`beep`
metadata `{ family: foundation, kind: ui-system }`), built on
`@tanstack/react-form` v1.33 + effect v4, binding each field as a thin
tanstack-form binding over an existing `@beep/ui` base-ui/Tailwind primitive. A
single schema is the source of **both** validation (via
`Schema.toStandardSchemaV1`) **and** default values (via `schema.make({})`).
Observable end state:

- `@beep/form` exists with the form-core API (`useAppForm`, `withForm`,
  `withFieldGroup`, `Form`, `SubmitButton`, the form-options builders, the
  validation adapter, and `getDefaultFormValues`) and the full field inventory
  (P1 simple + P2 dates + P3 heavy).
- Every field **and** every new `@beep/ui` primitive has a `*.stories.tsx` story
  with a `play` test (auto-discovered by the Storybook hub glob), and the
  non-visual core has `@effect/vitest` unit tests.
- All public exports carry JSDoc (`@example`/`@category`/`@since`) and docgen
  passes.
- A working demo form exercises validation, defaults, submit, and several fields.
- `bun run beep yeet verify` is green with no new cross-boundary dependency
  violations.

Provenance: authored from a grilling session that locked the decisions below
(2026-06-18). Modernizes the effect-v3 substrate at
`/home/elpresidank/YeeBois/projects/beep-effect4/packages/ui/ui/src/{form,inputs}`
(+ `…/packages/ui/core/src/adapters/AdapterEffectDateTime.ts`). Closest in-repo
precedent: `goals/rich-text-foundation` (same foundation/ui-system +
foundation/modeling cross-cut).

## Non-Goals

- No dependency on `foundation/capability`, any slice
  (`domain`/`client`/`server`/`use-cases`/`tables`), drivers, or app runtime
  layers (the dependency envelope is normative — see Constraints).
- No `@mui/material` form inputs. MUI is used **only** for date/time
  (`@mui/x-date-pickers`).
- No **schema-to-form auto-generator** in v1. Fields are placed explicitly; a
  field MAY optionally read schema annotations (options/label), but there is no
  generator.
- No replacement of `@beep/ui`'s existing non-MUI `date-picker.tsx` — the new
  MUI-x date/time stack **coexists** with it under a distinct name.
- No port of the beep-effect4 `ArrayFormatter` validation adapter (obsolete) or
  the custom `DefaultFormValuesAnnotation` defaults mechanism.
- No new `@beep/schema` Color or DateTime concept — **reuse** the existing
  `Color/`, `DateTimeUtcFromValid/`, and `LocalDate/` concepts.
- No persistence/rpc/app wiring; no form-state library other than
  `@tanstack/react-form` (no wrapping form/field state in atoms).
- The slice scaffolder (`bun run beep architecture create package …`) is **not**
  to be used (it produces `@beep/form-ui` at `packages/form/ui` with sibling
  slice deps and no `beep` block).

## Source Hierarchy

1. User objective that created this packet (the grilled design session).
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards (`standards/ARCHITECTURE.md`;
   `standards/architecture/07-non-slice-families.md`).
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict. **The locked decisions
below are not to be reopened** — if execution surfaces a finding that contradicts
one, **stop and surface it** for sign-off rather than diverging.

## Target Surfaces

- `packages/foundation/ui-system/form` — **new** `@beep/form`.
- `packages/foundation/ui-system/ui` — **additive** changes to `@beep/ui`: the
  new MUI-x date/time primitive family (ported adapter +
  `LocalizationProvider`), and the new P3 heavy primitives (phone, country,
  color, rating, emoji, upload). Introduces a new `@beep/ui → @beep/schema`
  workspace dep + project reference.
- `packages/foundation/modeling/schema` — **additive** role files reconciling the
  date adapter's local `./schema` into the `DateTimeUtcFromValid`/`LocalDate`
  concept.
- `packages/foundation/modeling/identity` — `$FormId` registration (auto-written
  by the scaffolder).
- Root `package.json` `catalog` (new exact-pin deps), root `tsconfig.json` +
  `tsconfig.packages.json` (auto-synced by the scaffolder; verify).
- `apps/storybook` — `package.json` dependency + `tsconfig.stories.json`
  paths/references (**manual**); stories auto-discovered from the package-root
  `stories/` dir.

## Constraints

### Locked Decisions (binding; do not reopen)

1. **Placement / name.** `@beep/form` at `packages/foundation/ui-system/form`;
   `beep` metadata `{ family: foundation, kind: ui-system }`; browser/React
   client package.
2. **Dependency envelope.** MAY depend on `@beep/ui`, `@beep/schema`, `@beep/utils`,
   `@tanstack/react-form`, `@effect/atom-react`, `@base-ui/react`,
   `@mui/x-date-pickers` (dates only), and `effect` (note
   `effect/unstable/reactivity` is a **subpath of `effect`**). MUST NOT depend on
   `foundation/capability`, any slice, drivers, or app runtime layers.
3. **Render substrate.** Each field is a thin tanstack-form binding over an
   existing `@beep/ui` base-ui primitive + the `Field`/`FieldError`/`FieldLabel`
   composition. No `@mui/material` form inputs. MUI = date/time only.
4. **Validation.** Use effect v4 `Schema.toStandardSchemaV1(schema)` and pass the
   resulting Standard Schema to tanstack `validators.onChange/onBlur/onSubmit`
   (auto-detected; explicit helper is `standardSchemaValidators` — **plural** —
   from `@tanstack/form-core`). Map Standard-Schema issues to `@beep/ui`
   `FieldError` by path. Do not port the beep-effect4 `ArrayFormatter` adapter.
   **Refinement (P0):** schemas whose `validate` can be async MUST be routed to
   `onChangeAsync/onBlurAsync/onSubmitAsync` (the sync slot throws on a Promise);
   purely-sync schemas use the sync slots.
5. **Schema-first depth (v1).** The form schema is the single source of validation
   AND default values. `getDefaultFormValues(schema)` invokes `schema.make({})`
   to materialize constructor defaults (`S.withConstructorDefault` or `@beep/schema`
   `withKeyDefaults`). Fields are placed explicitly; MAY optionally read schema
   annotations; **no auto-generator**. (Totality caveat: `make({})` requires all
   fields defaulted/optional — document/guard.)
6. **Effect-first state boundary.** `@tanstack/react-form` owns ALL form/field
   value + validation + submission state — never wrap that in atoms. Replace every
   **non-form** field-internal `useState`/`useMemo`/`useCallback` with scoped
   atoms (`@effect/atom-react` `make`/`useAtom` + `effect/unstable/reactivity`),
   mirroring `@beep/ui` `date-picker.tsx`. DOM refs stay React refs. Sanctioned
   seam: `onSubmit` and async validation/option-loading MAY delegate to an effect
   atom mutation.
7. **Dates.** Port `AdapterEffectDateTime` to effect v4 + a `LocalizationProvider`
   wrapper into `@beep/ui` as a NEW MUI-x date/time primitive family that
   **coexists** with `date-picker.tsx`. Form Date/DateTime/Time fields bind it;
   canonical value type is effect `DateTime`. **Reuse, not fork,** the existing
   `@beep/schema` `DateTimeUtcFromValid` (+ `DateTimeInput*`, `LocalDate`) — add
   role files within that concept; introduces the `@beep/ui → @beep/schema` edge.
8. **Heavy-widget home.** P3 presentational widgets are added as base-ui/Tailwind
   primitives in `@beep/ui` first; `@beep/form` binds them. Color **reuses** the
   `@beep/schema` `Color/` module (value/transforms); only the picker UI is new.
   Country = base-ui Combobox + dataset + flags (no external picker lib). Search
   `standards/repo-exports.catalog.md` + the schema src before adding ANY schema
   concept.

### Setup prerequisites (binding)

- **Scaffold via the CLI, do not hand-roll.** `bun run beep create-package form
  --family foundation --kind ui-system --with-stories-tsconfig` (run `--dry-run`
  first). Confirmed by dry-run to land at `packages/foundation/ui-system/form`
  named `@beep/form` with the `beep` block and `tsconfig.stories.json` +
  `stories/tsconfig.json`. After scaffolding, mirror **`@beep/editor`** to fix up
  the `exports` map shape, `sideEffects`, and `peerDependencies`.
- **Browser-safe contract.** Client files start with `"use client"`;
  `react`/`react-dom` (and `next` if used) are `peerDependencies`, not
  `dependencies` (mirror `@beep/ui`). Declare every workspace dep explicitly
  (`@beep/ui`, `@beep/schema`, `@beep/utils`) — do not rely on transitive
  resolution.
- **Catalog new deps as exact pins**, referenced as `"catalog:"`:
  `@tanstack/react-form` `1.33.0` (and `@tanstack/form-core` `1.33.0` if imported
  directly); the P0-selected heavy-field libs (see P0 Research Outcomes).
  `effect`, `@base-ui/react`, `@effect/atom-react`, `@mui/x-date-pickers`,
  `@mui/material` are already cataloged.
- **Registration.** The scaffolder auto-syncs root `tsconfig` aliases/references
  and registers `$FormId`. **Manually** wire Storybook: add `"@beep/form":
  "workspace:^"` to `apps/storybook/package.json` (mirror the `@beep/ui` entry)
  and `@beep/form`/`@beep/form/*` paths + a `tsconfig` reference in
  `apps/storybook/tsconfig.stories.json`. Place stories in the package-root
  `stories/` dir (the hub glob matches
  `packages/foundation/ui-system/*/stories/**/*.stories.@(ts|tsx)`).
- **Anti-duplication.** Search `standards/repo-exports.catalog.md` (refresh with
  `bun run repo-exports:catalog`) before creating ANY schema/helper/component.

### Field inventory (binding targets)

- **P1** (bind existing `@beep/ui` primitives): Text→input, Textarea→textarea,
  Number→input(number)/`useNumberInput`, Select→select, NativeSelect→native-select,
  Combobox/Autocomplete→combobox/command, MultiSelect→combobox(multiple, chips),
  Checkbox→checkbox, MultiCheckbox→checkbox group, Switch→switch,
  MultiSwitch→switch group, Radio & RadioGroup→radio-group, Slider→slider,
  Toggle/ToggleGroup→toggle(-group), OTP→input-otp.
- **P2** (dates): Date, DateTime, Time → MUI-x + ported adapter (value `DateTime`).
- **P3** (heavy, new `@beep/ui` primitives first): Phone (E.164), Country, Color
  (off `@beep/schema` `Color/`), Rating, Emoji, Upload/UploadAvatar/UploadBox.

### Quality bar

- Effect-first/schema-first repo law (namespace-first imports, `$I` identity
  annotations, match over conditionals, schema defaults). JSDoc on all public
  exports. No new cross-boundary dependency violations. No unrelated refactors.

## Acceptance Criteria

- [ ] `@beep/form` exists at `packages/foundation/ui-system/form` (`beep` =
      `{ foundation, ui-system }`), scaffolded via the family CLI, mirroring
      `@beep/editor`'s `exports`/`sideEffects`/`peerDependencies`, within the
      locked dependency envelope.
- [ ] Form-core API present and re-derived for tanstack v1.33 + effect v4:
      `useAppForm` (via `createFormHook`+`createFormHookContexts`), `withForm`,
      `withFieldGroup`, `Form`, `SubmitButton` (subscribes `canSubmit`/
      `isSubmitting`), `makeFormOptions`/`formOptionsWithDefaults`/
      `formOptionsWithSubmit`, the `toStandardSchemaV1` validation adapter (with
      sync/async slot routing + path→`FieldError` mapping), and
      `getDefaultFormValues` (via `schema.make({})`).
- [ ] All P1 fields bound to `@beep/ui` primitives; P2 Date/DateTime/Time bound to
      the new MUI-x stack (ported `AdapterEffectDateTime`, value `DateTime`); P3
      Phone/Country/Color/Rating/Emoji/Upload* bound to new `@beep/ui` primitives
      built with the P0-selected libraries.
- [ ] The date adapter's `./schema` is reconciled into the `@beep/schema`
      `DateTimeUtcFromValid`/`LocalDate` concept (role files, not a fork); the
      `@beep/ui → @beep/schema` edge is wired explicitly.
- [ ] A `*.stories.tsx` story + `play` test exists for every field and every new
      `@beep/ui` primitive (auto-discovered by the hub glob).
- [ ] `@effect/vitest` unit tests exist for the validation adapter, the defaults
      extractor, the ported `AdapterEffectDateTime`, and pure helpers.
- [ ] JSDoc on all public exports; docgen passes.
- [ ] A working demo form exercises validation, defaults, submit, and several
      fields.
- [ ] `bun run beep yeet verify` green; no new cross-boundary dependency
      violations.
- [ ] No unrelated refactors or formatting churn.

## P0 Research Outcomes (verified 2026-06-18)

Detail in [`research/`](./research/). Heavy-field library selections
(adversarially verified; exact catalog pins):

| Widget | Decision | Catalog pin(s) |
| --- | --- | --- |
| Phone | `libphonenumber-js` engine + own base-ui picker (drop react-phone-number-input) | `libphonenumber-js` `1.13.6` |
| Color | `react-colorful` picker UI; value/transforms in `@beep/schema` `Color/` | `react-colorful` `5.7.0` |
| Emoji | `frimousse` (Liveblocks) headless; self-host Emojibase dataset | `frimousse` `0.3.0` |
| Rating | **Build custom** on base-ui `RadioGroup` + Tailwind (no lib) | none |
| Upload | `react-dropzone` headless `useDropzone()` | `react-dropzone` `15.0.0` |
| Country | base-ui Combobox + dataset + SVG flags (no picker lib) | `countries-list` `3.3.0`, `country-flag-icons` `1.6.17` |

Critical constraints discovered (binding on implementation):

- **Async validator slots:** route async-capable effect schemas to the `*Async`
  validator slots; the sync slot throws on a Promise (refines LOCKED #4).
- **Encoded vs Type:** the tanstack field holds the schema's **Encoded** shape;
  the decoded **Type** appears at submit. Date fields validate with the type-side
  schema so the field value is `DateTime` (reconciles LOCKED #7); transform/decode
  to `Type` runs at the form boundary.
- **`react-dom` is not a tanstack peer** — declare it as a `@beep/form` peer.
- **Open-range React peers:** `react-colorful` and `react-dropzone` satisfy React
  19 by an open `>=16.8` range (not explicit `^19`); `frimousse` is explicit
  `^18 || ^19`. `react-dropzone` v15 clears `isDragReject` after drop. Documented
  exits: custom base-ui color picker; React Aria `DropZone`.
- **Confirm** the published `@tanstack/react-form@1.33.0` dependency set from npm
  before finalizing the catalog (local clone may be modified).

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/form/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/form/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/form` | Passes |
| Scaffold landing | `bun run beep create-package form --family foundation --kind ui-system --with-stories-tsconfig --dry-run` | Lands `@beep/form` at `packages/foundation/ui-system/form` |
| Stories + play | every field/primitive story passes in Storybook | Renders + interactions pass |
| Core units | `@effect/vitest` for adapter/defaults/AdapterEffectDateTime/helpers | Pass |
| Quality gates | `bun run beep yeet verify` | Green |
| Docgen | docgen over `@beep/form` (+ touched `@beep/ui`/`@beep/schema`) | Passes |

## Stop Conditions

- A P0 (or later) finding contradicts a locked decision — surface for sign-off,
  do not silently diverge.
- Required source files are missing or materially contradictory.
- The implementation would exceed named scope or the dependency envelope.
- Verification requires credentials, cost, destructive side effects, or policy
  approval not named in this spec.
- The same blocker repeats after reasonable investigation.

## Decision Log

- 2026-06-18: Decisions 1–8 locked in the grilling session (see Locked Decisions).
- 2026-06-18: P0 research selected the heavy-field libraries and confirmed the
  tanstack v1.33 ↔ effect-v4 Standard-Schema seam (all four seam claims confirmed
  with file:line evidence); discovered the async-slot and Encoded-vs-Type
  constraints. No locked-decision contradictions.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
