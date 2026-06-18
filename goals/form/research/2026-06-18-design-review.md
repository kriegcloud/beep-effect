# P0 — design-review note (@beep/form)

Freshness: 2026-06-18. Synthesizes
[`codebase-grounding`](./2026-06-18-codebase-grounding.md),
[`field-widget-libraries`](./2026-06-18-field-widget-libraries.md), and
[`core-libraries`](./2026-06-18-core-libraries.md) into the v1 design. Covers the
four areas the P0 brief requires: **form-core API**, **validation/error
mapping**, **atom-state boundary**, and the **date-adapter plan**.

## 1. Form-core API

One centralized `createFormHook` in `@beep/form` (re-derived from the
beep-effect4 `src/form/` shape for tanstack v1.33 + effect v4):

- `createFormHookContexts()` → `createFormHook({ fieldContext, formContext,
  fieldComponents, formComponents })`. Register every P1 field as a
  `fieldComponent` (`Text`, `Textarea`, `Number`, `Select`, `NativeSelect`,
  `Combobox`, `MultiSelect`, `Checkbox`, `MultiCheckbox`, `Switch`, `MultiSwitch`,
  `Radio`, `RadioGroup`, `Slider`, `Toggle`, `ToggleGroup`, `OTP`), and
  `SubmitButton` as a `formComponent`. P2 (`Date`/`DateTime`/`Time`) and P3
  (`Phone`/`Country`/`Color`/`Rating`/`Emoji`/`Upload*`) register as they land.
- Export `useAppForm`, `withForm`, `withFieldGroup`, `extendForm`, the `Form`
  wrapper, and `SubmitButton`. Apps never call `createFormHook` themselves.
- Field-name hygiene: registered components are `Object.assign`-merged onto the
  live field — keep them stable and never name one after a `FieldApi` member
  (`state`, `handleChange`, `pushValue`, …).
- `SubmitButton` subscribes with a narrowing selector
  `(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })` and maps to a
  base-ui Button's disabled+busy contract.
- Form-options builders (schema-first):
  - `makeFormOptions({ schema, defaultValues, validators })` — base.
  - `formOptionsWithDefaults({ schema, … })` — derives `defaultValues` from the
    schema via the defaults extractor (§2).
  - `formOptionsWithSubmit({ schema, onSubmit, … })` — `onSubmit` MAY bridge to an
    effect atom mutation (sanctioned seam, §3). Fix the inverted
    `formOptionsWithSubmit` vs `…Effect` naming from beep-effect4: name by what
    `onSubmit` receives (decoded `Type` vs an `Effect`).
- Reusable composition: `withFieldGroup` for clusters (address, password+confirm,
  amount+currency) with `FieldsMap` remapping; `withForm` for whole sub-forms.
  Group/Form `defaultValues` are type-inference only.

## 2. Validation + default values + error mapping

**Validation source of truth = the form schema** (LOCKED #4/#5). One wrapper:

```ts
// toFormSchema centralizes message hooks + parse options; returns the ~standard schema
const standard = Schema.toStandardSchemaV1(schema, { leafHook, checkHook })
```

Pass `standard` to tanstack `validators`. **Routing rule (critical P0 finding):**
effect `validate` is optimistically sync but returns a `Promise` for any schema
that decodes asynchronously, and tanstack's **sync** slot throws on a Promise.
→ Route purely-sync schemas to `onChange/onBlur/onSubmit`; route async-capable
schemas to `onChangeAsync/onBlurAsync/onSubmitAsync` (with debounce + the provided
`AbortSignal`). The field-binding helper either detects sync-capability once or
defaults effect schemas to the async slots. This **refines** LOCKED #4 (which
named the sync slots) without contradicting it.

**Defaults extractor (LOCKED #5):** `getDefaultFormValues(schema)` calls
`schema.make({})` to materialize constructor defaults (declared via
`S.withConstructorDefault` or `@beep/schema` `withKeyDefaults`). `make({})` is
**total only when every field is defaulted or optional** — the extractor must
document this and fail loudly (or accept an explicit partial-defaults override)
for partially-defaulted schemas. This replaces beep-effect4's custom
`DefaultFormValuesAnnotation`.

**Error mapping:** `Schema.toStandardSchemaV1` runs with `errors:"all"`, so a
field can have multiple issues; the `SchemaIssue` tree flattens to
`{ message, path }[]`. tanstack buckets issues per field by path. Each field maps
`field.state.meta.errors` straight into `@beep/ui` `<FieldError errors={…} />`
(structurally compatible on `message`; it dedupes and self-hides when empty) and
sets `data-invalid`/`aria-invalid` when issues exist. Drop the beep-effect4
`ArrayFormatter` adapter and its `errorMap.onSubmit[name]` read entirely. Pass
`leafHook`/`checkHook` (or schema `annotations.message`) for end-user copy — never
ship default `Expected X, got Y` strings. Cross-field rules use Struct-level
`S.filter` emitting **Pointer** paths to the offending field.

**Encoded-vs-Type rule (P0 finding):** the tanstack field holds the schema's
**Encoded** shape during editing; the decoded **Type** exists only on
success/submit. For transform fields (string→DateTime, branded ids) the rich
`Type` is obtained by decoding the whole-form Encoded values at submit
(`decodeUnknownEffect`), not by assuming stored values are decoded. See §4 for how
the Date fields reconcile this with LOCKED #7.

## 3. Atom-state boundary (LOCKED #6)

- **`@tanstack/react-form` owns ALL** form/field value + validation + submission
  state. Never wrap that in atoms.
- **Scoped atoms replace every non-form field-internal React hook** (popover
  anchors, search/filter strings, debounced/derived values, picker visibility,
  the phone display string, the color "raw input before normalization"). Use the
  exact `@beep/ui` `date-picker.tsx` pattern: `make`/`useAtom` from
  `@effect/atom-react` + `Atom` from `effect/unstable/reactivity`, `"use client"`,
  immutable updater `setState((cur)=>({…cur,…}))`, controlledness via
  `P.hasProperty`. (`useNumberInput.ts` is the richer precedent.)
- **DOM refs stay React refs** (e.g. OTP focus management).
- **Sanctioned tanstack↔atom seam:** the form `onSubmit` action and any async
  validation / async option-loading MAY delegate to an effect atom mutation
  (`runtime.fn` / `Reactivity.mutation` / `AsyncResult`). tanstack still owns the
  form; the effectful action it triggers is atom-driven. Precedents:
  `packages/agents/client/src/Chat.atoms.ts`,
  `packages/foundation/ui-system/ui/src/internal/react-atoms.ts`,
  `apps/oip-web/src/components/ContactForm.tsx`. No app runtime is required —
  scoped atoms like `date-picker.tsx`.

## 4. Date-adapter plan (LOCKED #7)

- **Port** `AdapterEffectDateTime` (beep-effect4
  `packages/ui/core/src/adapters/AdapterEffectDateTime.ts`,
  `implements MuiPickersAdapter<string>`, value type effect `DateTime`,
  `lib = "effect-datetime"`, augments `PickerValidDateLookup`) to effect v4 and
  place it + a `LocalizationProvider` wrapper in **`@beep/ui`** as a **new MUI-x
  date/time primitive family**. It **coexists** with the existing non-MUI
  `date-picker.tsx` under a distinct name — do not replace it.
- **Port hygiene:** confirm v4 `DateTime` parity for the `unsafe*`/NaN-as-invalid
  paths; fix the `getYearRange` exclusive-`lessThan` bug (drops the final year).
- **Reconcile the local `./schema`** (`DateInputToDateTime`,
  `createDateTimeWithTimezone`, `applyTimezone`, `createInvalidDateTime`, uses
  `$UiCoreId`) **into** the existing `@beep/schema` `DateTimeUtcFromValid` (+
  `DateTimeInput*`, `LocalDate`) concept by adding role files within that concept's
  topology (`<Concept>.<role>.ts` + one `export *` in `index.ts`, with the
  concept's `$SchemaId.create("…")` composer). Do **not** fork it; do **not**
  confuse it with `@beep/shared-domain/values/LocalDate`.
- **New dependency edge:** this introduces `@beep/ui → @beep/schema`
  (foundation/modeling) — legal under the ui-system→modeling rule. Wire the
  workspace dep + tsconfig project reference explicitly. Isolate the
  `@mui/x-date-pickers` import to this one primitive family so the rest of the
  stack stays MUI-free and browser-safe.
- **Value reconciliation (Encoded-vs-Type, §2):** the Date/DateTime/Time field's
  working value is effect `DateTime` (the adapter operates on `DateTime`, the
  canonical value per #7). Validate it with the **type-side** schema (e.g.
  `S.typeSchema(DateTimeUtcFromValid)` / a schema whose Encoded = `DateTime`) so
  Standard Schema Input = Output = `DateTime` and no Encoded/Type skew occurs at
  the field. Reserve the Encoded↔Type transform (`DateTimeInput*` →
  `DateTimeUtcFromValid`) for boundary decode (e.g. hydrating defaults or decoding
  the whole form at submit). This satisfies #7 while honoring the Encoded-vs-Type
  rule.

## 5. Open implementation questions (for P1+, not blockers)

1. Exact sync-vs-async slot routing helper: detect per-schema, or always-async for
   effect schemas? (Lean: detect once; fall back to async.)
2. Confirm published `@tanstack/react-form@1.33.0` dependency set from npm before
   finalizing the catalog (local clone may be a modified devspace).
3. Self-hosted `emojibase-data` source + license for the emoji field's
   `emojibaseUrl`.
4. Phone metadata variant (`/min` vs `/mobile`) chosen to match the desired
   `isValidPhoneNumber` strictness.
