# Codebase grounding — `@beep/form`

Freshness: 2026-06-18. Verified by reading repo source + two non-destructive
scaffolder `--dry-run` invocations. All paths are relative to repo root
`/home/elpresidank/YeeBois/projects/beep-effect5` unless noted.

This note records the **verified facts** the `SPEC.md`/`PLAN.md` decisions rest
on, plus corrections to assumptions in the originating prompt.

## 1. Package scaffolding (CLI)

Handler: `packages/tooling/tool/cli/src/commands/CreatePackage/Handler.ts`.

`bun run beep create-package <name> --family <family> --kind <kind> [flags]` is
the **family-aware** scaffolder (command name `create-package`, `Handler.ts:849`).

- `VALID_FAMILIES = ["drivers","foundation","tooling"]`; foundation kinds
  `VALID_FOUNDATION_KINDS = ["primitive","modeling","capability","ui-system"]`.
  So `--family foundation --kind ui-system` is valid (`Handler.ts:110-114`).
- `--with-stories-tsconfig` is **gated** to `--type library` (default) +
  `--family foundation` + `--kind ui-system` (`Handler.ts:1026-1039`). It emits a
  package-root `tsconfig.stories.json` **and** `stories/tsconfig.json`, creates a
  `stories/` directory, and wires `beep:check` to
  `tsgo -b tsconfig.json && bun run beep:check:tests && bun run beep:check:stories`
  plus `"beep:check:stories": "tsc -p tsconfig.stories.json --noEmit"`
  (`Handler.ts:1433-1440`).

**Verified dry-run** (`create-package form --family foundation --kind ui-system
--with-stories-tsconfig --dry-run`):

```
Would create package @beep/form (type: library)
Family: foundation   Kind: ui-system
Directory: packages/foundation/ui-system/form
Files: package.json, tsconfig.json, tsconfig.test.json, src/index.ts,
  test/.gitkeep, dtslint/.gitkeep, LICENSE, README.md, AGENTS.md,
  CLAUDE.md -> AGENTS.md (symlink), docgen.json, vitest.config.ts,
  docs/index.md, tsconfig.stories.json, stories/tsconfig.json
Root bootstrap updates:
  - package.json workspaces: SKIP (already covered by an existing workspace entry)
  - packages/foundation/modeling/identity/src/packages.ts: Register "form" and export $FormId
  - shared sync runs after scaffolding to update tsconfig references, aliases,
    tstyche, syncpack, and docgen
  - Lockfile: bun install --lockfile-only
```

**Consequence for PLAN P1:** the scaffolder writes the `beep` metadata block when
a family is set (`Handler.ts:1444-1448`) and **auto-syncs root tsconfig
references/aliases + the identity composer** (`$FormId` in
`packages/foundation/modeling/identity/src/packages.ts`). So the root
`tsconfig.json` path-alias + project references and identity registration are
**automated**, not manual. What is **not** automated and must be wired by hand:
Storybook app wiring (§5) and catalog dependency pins (§6).

### Wrong scaffolder (do NOT use)

`bun run beep architecture create package <slice> <role>` is the **slice/bounded-
context** generator (`packages/tooling/tool/cli/src/commands/Architecture/`).
Verified dry-run of `architecture create package form ui`:
`@beep/form-ui` at `packages/form/ui`, `exports: [".","./aggregates/*"]`, deps
`@beep/form-config` + `@beep/form-domain` (slice siblings) + `@beep/schema` +
`@beep/utils` + `effect`, and **no `beep` metadata block**. This violates LOCKED
DECISION #1 — it is the wrong tool.

## 2. Root catalog (`package.json` `catalog`)

Single Bun-style `"catalog": { ... }` block (no plural `catalogs`). Entries are
`"pkg": "version"`, referenced from packages as `"pkg": "catalog:"`. Verified
pins:

| key | pinned |
| --- | --- |
| `effect` | `4.0.0-beta.84` |
| `@effect/atom-react` | `4.0.0-beta.84` |
| `@base-ui/react` | `^1.5.0` (exact key is `@base-ui/react`, **not** `@base-ui-components/react`) |
| `@mui/x-date-pickers` | `^9.0.0-alpha.4` |
| `@mui/material` | `^9.0.0-beta.1` |
| `react` / `react-dom` | `19.2.7` |
| `next` | `16.3.0-canary.53` |

`@tanstack/react-form` and `@tanstack/form-core` are **absent** — must be added
(see SPEC; P0 widget research pins the heavy-field libs).

## 3. `@beep/ui` primitives (P1 binding targets)

All under `packages/foundation/ui-system/ui/src/components/`, imported as
`@beep/ui/components/<name>` (wildcard export `"./components/*"`). Verified present:

`input` (`Input`), `textarea` (`Textarea`), `select` (`Select`+parts),
`native-select` (`NativeSelect`+parts), `combobox` (`Combobox`+parts incl.
`ComboboxChips`/`ComboboxChip`/`ComboboxChipsInput` for multi), `command`,
`checkbox` (`Checkbox`), `switch` (`Switch`), `radio-group` (`RadioGroup`,
`RadioGroupItem`), `slider` (`Slider`), `toggle` (`Toggle`), `toggle-group`
(`ToggleGroup`, `ToggleGroupItem`), `input-otp` (`InputOTP`+parts), `label`
(`Label`), and `field` (`Field`, `FieldContent`, `FieldDescription`,
`FieldError`, `FieldGroup`, `FieldLabel`, `FieldLegend`, `FieldSeparator`,
`FieldSet`, `FieldTitle`).

**Gaps to note:**
- **No `NumberInput` component** — only a `useNumberInput` hook
  (`src/hooks/useNumberInput.ts`). The Number field binds `Input` (number mode)
  and/or that hook.
- **No standalone `MultiSelect`** — compose from `Combobox` chips
  (`ComboboxChips*`), i.e. combobox(multiple). Matches the locked inventory.
- **All six P3 heavy primitives are ABSENT** (phone, country, color picker,
  rating, emoji, upload/dropzone) → they must be built as base-ui/Tailwind
  primitives in `@beep/ui` first, then bound (LOCKED DECISIONS #3, #8).

### Error/label mapping surface

`FieldError` (`components/field.tsx`) signature:
`React.ComponentProps<"div"> & { errors?: Array<{ message?: string } | undefined> }`.
It dedupes by `message`, renders a single message or a `<ul>`, and **renders
`null` when the array is empty**. Invalid styling is driven by `data-invalid` on
`<Field>`. Standard-Schema issues are `{ message, path }[]`, so they are
**structurally compatible on `message`** — a field binding can pass mapped issues
straight into `<FieldError errors=… />` and set `data-invalid`/`aria-invalid`
when issues exist. This is the v4 replacement for the old dot-path `errorMap`
read (§7).

### Scoped-atom pattern (LOCKED DECISION #6 precedent)

`components/date-picker.tsx` (the existing **non-MUI** base-ui/react-day-picker
picker — coexists with the new MUI-x stack; do **not** replace it):

```tsx
"use client";
import { make as makeScopedAtom, useAtom } from "@effect/atom-react";
import * as P from "effect/Predicate";
import { Atom } from "effect/unstable/reactivity";

const DatePickerScope = makeScopedAtom((defaultValue: Date | undefined) =>
  Atom.make<{ internalValue: Date | undefined; open: boolean }>({
    internalValue: defaultValue, open: false,
  }));
// <DatePickerScope.Provider value={...}> … const [state, setState] = useAtom(DatePickerScope.use());
// setState((cur) => ({ ...cur, open }))   // immutable updater
// controlledness via P.hasProperty(props, "value")
```

`src/hooks/useNumberInput.ts` is the richer precedent (uses
`useAtomValue`/`useAtomSet`/`useAtomSubscribe` + `$UiId.create(...)` for scoped
ids + `Match`/`S`/`LiteralKit` from `@beep/schema`). Every non-form field-internal
`useState`/`useMemo`/`useCallback` is replaced by this pattern; DOM refs stay
React refs.

## 4. `@beep/ui` / `@beep/editor` package.json (mirror targets)

- `beep` metadata: both `{ "family": "foundation", "kind": "ui-system" }`.
- `sideEffects`: `@beep/ui` → `["**/*.css"]`; `@beep/editor` → `[]`.
- `exports`: `@beep/ui` is **source-only** with wildcard maps
  (`"./components/*": "./src/components/*.tsx"`, `./hooks/*`, `./lib/*`, …);
  `@beep/editor` is **dual** (top-level `exports` → `./src/*.tsx`, mirrored by
  `publishConfig.exports` → `./dist/*.js`).
- **Dependency placement:** in both, **`react` + `react-dom` are
  `peerDependencies` `^19`**; `next` is a peer (and dev) dep in `@beep/ui` only.
  `effect` is a dep `catalog:`; `@effect/atom-react`, `@base-ui/react`,
  `@mui/material`, `@mui/x-date-pickers` are deps `catalog:` in `@beep/ui`.
  `@beep/utils` is `workspace:^`.
- **Caveat:** `@beep/ui` imports `@beep/schema` in src but does **not** declare
  it in `package.json` (existing gap). `@beep/form` must **explicitly declare**
  every workspace dep it uses (`@beep/ui`, `@beep/schema`, `@beep/utils`).

## 5. Storybook wiring (manual; NOT auto-synced)

- Hub glob (auto-discovers stories): `apps/storybook/.storybook/main.ts:7` →
  `stories: ["../../../packages/foundation/ui-system/*/stories/**/*.stories.@(ts|tsx)"]`.
  Tailwind source scan `apps/storybook/.storybook/preview.css:9` →
  `@source "../../../packages/foundation/ui-system";`. Story typecheck include in
  `apps/storybook/tsconfig.stories.json` is also a `ui-system/*/stories/**`
  wildcard. **So placing stories at `packages/foundation/ui-system/form/stories/`
  is auto-discovered with no `.storybook` change.**
- **Correction to the prompt:** `apps/storybook/package.json` registers
  **`@beep/ui`** (`"@beep/ui": "workspace:^"`), **not** `@beep/editor`. Mirror the
  `@beep/ui` entry → add `"@beep/form": "workspace:^"`.
- `apps/storybook/tsconfig.stories.json` **does** register `@beep/editor` (and
  `@beep/ui`) in both `paths` and `references`. Mirror: add `@beep/form` +
  `@beep/form/*` paths and a `{ "path": ".../form/tsconfig.json" }` reference.
- Stories live in a **package-root `stories/` dir** (not colocated in `src/`).
  `@beep/ui` keeps one file per component under `stories/components/`
  (`field.stories.tsx`, `input.stories.tsx`, …). Story convention: import sources
  via `@beep/*` aliases; `import { expect, fn, userEvent, within } from
  "storybook/test"`; `import type { Meta, StoryObj } from "@storybook/react-vite"`;
  JSDoc on `meta`; `title` namespaced (form primitives use `Components/Forms/*`);
  `tags: ["autodocs"]`; each `Story` may carry `render` + a `play` interaction
  test.

## 6. `@beep/schema` reuse targets

Concept-module topology: folder concepts under
`packages/foundation/modeling/schema/src/<Concept>/` with `index.ts` barrel +
`<Concept>.schema.ts` role file(s); each role file opens with
`const $I = $SchemaId.create("<Concept>")` and annotates via
`$I.annoteSchema(...)`/`$I.annote(...)`. A concept may have **multiple** role
files (e.g. `Color/` → `Color.hex.ts`, `Color.oklch.ts`, `Color.rgb.ts`,
`Color.scale.ts`, `Color.transforms.ts`, `Color.adjust.ts`, `Color.shared.ts`).
**Adding role files** = drop `<Concept>.<role>.ts` into the folder with the
concept's `$I` composer and add one `export * from "./<role>.ts"` to `index.ts`.

- **DateTime** (LOCKED DECISION #7 reuse target):
  `src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts` →
  `DateTimeUtcFromValid` (bidirectional `S.decodeTo(S.DateTimeUtc, …)`), the full
  `DateTimeInput*` family (`DateTimeInputKind`, `…String`, `…Number`, `…Date`,
  `…DateTime`, `…Instant`, `…InstantWithZone`, `…Parts`, union `DateTimeInput`).
  Public at `@beep/schema` root and subpath `@beep/schema/DateTimeUtcFromValid`.
  The ported adapter's local `./schema` helper reconciles **into this concept**
  (add role files). `LocalDate` concept is at `src/LocalDate/` (with
  `LocalDateFromString`). **Flag:** a second `LocalDate` exists at
  `@beep/shared-domain/values/LocalDate` — reconcile against the **`@beep/schema`**
  one.
- **Color** (LOCKED DECISION #8 reuse target): `src/Color/`. Value types/transforms
  already provided: `HexColor`, `HexColorInput`, `NormalizeHexColor`, `Rgb`/`RgbInput`,
  `OklchColor`/`OklchInput`, cross-space transforms (`HexToRgb`, `RgbToOklch`,
  `OklchToHex`, …), scales, adjust (`Lighten`/`Darken`/`MixColors`/`WithAlpha`).
  Public at `@beep/schema/Color` (and most at root). The Color **field** drives off
  these; only the picker UI is new.
- **Defaults** (LOCKED DECISION #5): `withKeyDefaults`
  (`src/SchemaUtils/withKeyDefaults.ts`, public `@beep/schema/SchemaUtils`) is a
  `dual` applying `S.withConstructorDefault(...)` + `S.withDecodingDefaultKey(...)`.
  Siblings: `withEmptyArrayDefaults`, `boolKeyWithDefault`,
  `BoolKeyDefaultFalse`/`True`. **`schema.make({})` materializes constructor
  defaults — CONFIRMED** (e.g. `CsvCodecOptions.make({})`,
  `ParserOptions.Schema.make({})`, `DiscordConfigInput.make({})`). Caveat:
  `make({})` is total only when **every** field is defaulted or optional;
  partially-defaulted structs will fail — the defaults extractor must document/
  guard this.
- **Validation** (LOCKED DECISION #4): `Schema.toStandardSchemaV1(schema)` exists
  in effect v4 (`.repos/effect-v4/packages/effect/src/Schema.ts:990`), returns the
  schema augmented with a `"~standard"` property (`version:1, vendor:"effect",
  validate`). `StandardSchemaV1` is from `@standard-schema/spec`.
- **Anti-duplication:** a broad workspace scan found **no** existing
  `getDefaultFormValues`, form-options, validation-adapter, `toStandardSchemaV1`
  wrapper, or `@beep/form` package — this is greenfield, nothing is duplicated.

## 7. Old beep-effect4 substrate (modernization source, read-only)

`/home/elpresidank/YeeBois/projects/beep-effect4/packages/ui/ui/src/{form,inputs}`
and `…/packages/ui/core/src/adapters/AdapterEffectDateTime.ts`. Targeted
tanstack-form `^1.28.3` (v4 target is 1.33).

- **form-core:** `useAppForm.ts` (`createFormHook` + `createFormHookContexts`,
  lazy-imports ~22 field components + `Submit`/`FormDialog`), `Form.tsx`,
  `SubmitButton.tsx` (`form.Subscribe` selector `[isSubmitting, canSubmit]`),
  `makeFormOptions.ts`, `form-options-with-defaults.ts`,
  `form-options-with-submit{,-effect}.ts`, `groups/PasswordFieldsGroup.tsx`
  (`withFieldGroup` example). `withForm` is barrel-exported; `withFieldGroup` is
  not.
- **defaults (OLD):** came from a **custom schema annotation**
  (`DefaultFormValuesAnnotationId`, read via `getDefaultFormValuesAnnotation`),
  **not** from `.make()`. v1 LOCKED DECISION #5 deliberately **replaces** this with
  a `schema.make({})` extractor — a modernization, not a contradiction.
- **validation (OLD):** `validateWithSchema` used `ArrayFormatter.formatErrorSync`
  → flat `Record<dotPath, message>`; fields read
  `state.errorMap.onSubmit?.[field.name]`. v1 LOCKED DECISION #4 **drops** the
  ArrayFormatter adapter in favor of Standard Schema; fields read tanstack's
  Standard-Schema-populated `field.state.meta.errors` and map to `FieldError`.
  This is a deliberate rewrite of the error-read contract.
- **field inventory (OLD):** all P1/P2/P3 fields present EXCEPT, relative to the
  new inventory: Textarea (was `field.Text multiline`), NativeSelect (none),
  dedicated Number (TextField auto-detected number), Time (only Date/DateTime),
  Toggle/ToggleGroup (none). These are **additive** in v1 (the `@beep/ui`
  primitives already exist; Time → MUI-x). Surprising: old `RadioField` bound a
  `boolean`; date fields stored **ISO strings** (new canonical value is
  `DateTime` per #7).
- **heavy-field libs (OLD):** Phone → `react-phone-number-input` (+ transitive
  `libphonenumber-js`); Country → local dataset + MUI `Autocomplete` + `FlagIcon`
  (no lib); Color → custom MUI swatches off a fixed palette (no lib); Rating →
  MUI `Rating`; Emoji → `@emoji-mart/data` + `@emoji-mart/react`; Upload →
  `react-dropzone`; OTP → fully custom. The 2026 picks are re-selected in the P0
  widget research (MUI form inputs are banned in v1).
- **date adapter:** `AdapterEffectDateTime implements MuiPickersAdapter<string>`,
  value type effect `DateTime`, `lib = "effect-datetime"`, augments
  `PickerValidDateLookup`. Local `./schema` provides `DateInputToDateTime`,
  `createDateTimeWithTimezone`, `applyTimezone`, `createInvalidDateTime` (uses
  `$UiCoreId`, `unsafe*` DateTime calls, NaN-as-invalid). Port notes: confirm v4
  `DateTime` API parity for the `unsafe*`/NaN paths; `getYearRange` uses exclusive
  `lessThan` (drops the final year — pre-existing bug to fix on port); reconcile
  `./schema` into `@beep/schema` `DateTimeUtcFromValid`/`LocalDate`.
