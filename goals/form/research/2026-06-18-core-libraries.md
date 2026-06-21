# P0 — core libraries: tanstack-form v1.33, base-ui selection, effect-schema ↔ Standard Schema

Freshness: 2026-06-18. Verified against the local tanstack-form clone
(`/home/elpresidank/YeeBois/dev/tanstack/form`, exactly v1.33.0) and effect v4
source (`.repos/effect-v4/packages/effect/src/Schema.ts`,
`.../SchemaIssue.ts`). All four integration-seam claims were independently
**confirmed with file:line evidence** (last section).

## A. `@tanstack/react-form` v1.33.0

MIT. Peer `react: "^17 || ^18 || ^19"`; **`react-dom` is NOT a peer** (only a
dev dep upstream) — `@beep/form` must declare its own `react`/`react-dom` peers
`^19`. Depends on `@tanstack/form-core@1.33.0` (exact, not caret) +
`@tanstack/react-store@^0.11.0`. form-core itself depends on
`effect@4.0.0-beta.84` (matches the repo catalog) + `@standard-schema/spec`.

**Catalog action:** pin `"@tanstack/react-form": "1.33.0"`. `form-core` /
`react-store` resolve transitively; add `"@tanstack/form-core": "1.33.0"` **only
if** importing `standardSchemaValidators` directly.

### Composition (the `useAppForm` factory)

```ts
const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();
const { useAppForm, withForm, withFieldGroup, extendForm } = createFormHook({
  fieldContext, formContext,
  fieldComponents: { Text, Textarea, Number, Select, /* …all P1 fields… */ },
  formComponents: { SubmitButton },
});
```

- `fieldComponents` are merged onto the field via `Object.assign(field, …)` →
  reached as `field.Text` inside `<form.AppField>`. **Gotcha:** keep field
  components stable and avoid names that collide with `FieldApi` members
  (`handleChange`, `state`, `pushValue`, …) or you overwrite the API.
- `formComponents` spread onto the form → `form.SubmitButton` inside `form.AppForm`.
- `SubmitButton` uses a **narrowing** subscribe to minimize re-renders:
  `<form.Subscribe selector={(s)=>({canSubmit:s.canSubmit,isSubmitting:s.isSubmitting})}>`.

### Standard Schema validators (first-class, zero adapter)

Pass a Standard Schema **object** straight to
`validators.onChange/onBlur/onSubmit`. Auto-detected via
`isStandardSchemaValidator(v) = !!v && '~standard' in v`; dispatched through the
exported helper `standardSchemaValidators` (**plural**; file is singular
`standardSchemaValidator.ts`). This is exactly LOCKED DECISION #4 — confirmed.

### Async validators, field arrays, dependent fields, groups

- **Async:** `validators.onChangeAsync/onBlurAsync/onSubmitAsync`, with
  `onChangeAsyncDebounceMs` (or a field-level `asyncDebounceMs` default); async
  validators receive an `AbortSignal`.
- **Field arrays:** `<form.Field name="items" mode="array">`; mutators on the
  array `FieldApi`: `pushValue/insertValue/replaceValue/removeValue/swapValues/
  moveValue/clearValues`.
- **Dependent/linked fields:** `validators.onChangeListenTo: ['password']`
  re-runs this field's `onChange` when a sibling changes; read siblings via
  `fieldApi.form.getFieldValue(name)`.
- **Form Groups (new in 1.33, PR #2128):** `withFieldGroup({ defaultValues, props,
  render })` for reusable, **remappable** field clusters (address, password+confirm,
  amount+currency); call with a `fields` mapping. `withForm` is for whole reusable
  sub-forms. Both `defaultValues` are for **type inference only** — the real form
  is created once by `useAppForm` and passed via the `form` prop.
- **Typed context caveat:** `useFormContext()`/`useTypedAppFormContext` type form
  data as `Record<string,never>` (intentionally untyped) — prefer `withForm` for
  typed access in subcomponents.

## B. `@base-ui/react` 1.5.0 — selection primitives

MIT, React-19-native, already installed; exact pin `1.5.0` (catalog key is
**`@base-ui/react`**, NOT the legacy `@base-ui-components/react`). The repo's
`@beep/ui` already wraps these as `combobox.tsx`/`select.tsx`/`native-select.tsx`
— `@beep/form` binds those wrappers.

**Decision rule:** `Combobox` (filterable, fixed set — no free-form text) ·
`Select` (no text input; compact dropdown) · `Autocomplete` (free-form text +
suggestions). For `@beep/form`: country → Combobox (single, filterable, flag+label
items); multi-select → Combobox `multiple` + `Chips` parts; small enum → Select;
async/server search → Combobox controlled `filteredItems`.

- Both Roots are generic `<Value, Multiple>`; bind `value` + `onValueChange`
  (single mode may emit `null` — normalize for decode), `name`/`form`/`required`
  for native hidden-input submission.
- **No `onBlur` on Root** — wire `field.handleBlur` on `Combobox.Input` /
  `Select.Trigger`.
- **Object values:** always set `isItemEqualToValue` (or use `{value,label}` items
  with stable `value`) or selection resets when items re-fetch (base-ui#3818).
- Built-in `useFilter` (Intl.Collator, accent/case-robust) for client filtering;
  `filteredItems` + debounced `onInputValueChange` + `Combobox.Status`
  (kept mounted, aria-live) + `Combobox.Empty` for async; `Group`/`GroupLabel`;
  `virtualized` flag is BYO-virtualizer (`@tanstack/react-virtual`, optional —
  ~250 countries don't need it).

## C. effect v4 Schema ↔ Standard Schema

`Schema.toStandardSchemaV1(schema, options?)` (`Schema.ts:990`) returns
`StandardSchemaV1<S["Encoded"], S["Type"]> & S` — both a usable Schema and a
Standard Schema (it `Object.assign`s `"~standard": { version:1, vendor:"effect",
validate }`; **mutates** the schema, idempotent). `parseOptions` default to
`{ errors:"all" }` → a field can receive **multiple** issues (the `@beep/ui`
`FieldError` `errors: Array<{message?}>` shape is correct; map every message).

Two findings that shape the binding (refinements, not contradictions):

1. **`validate` is optimistically sync, Promise-on-async.** It forks decode on a
   MixedScheduler and polls; returns a `Result` synchronously when decode
   completes immediately, otherwise a `Promise<Result>`. TanStack's **sync**
   slot throws `"async function passed to sync validator"` if it sees a Promise.
   → **Route async-capable schemas to `onChangeAsync/onBlurAsync/onSubmitAsync`.**
   Plain decoding (string→DateTime, branded ids, struct refinements) is sync and
   works on the sync slot. Build one `@beep/form` helper that either inspects
   sync-capability or defaults effect schemas to the async slots.
2. **Standard Schema Input = Encoded, Output = Type.** `validate` consumes the
   **Encoded** (wire) value and returns the decoded **Type**. So the tanstack
   field holds the **Encoded** shape during editing; the Type only exists on
   success/submit. For string→DateTime / branded-id fields, do **not** type the
   field value as the Type — obtain the rich Type by decoding the whole-form
   Encoded values at submit (`decodeUnknownEffect`). (See the design-review note
   for how this reconciles with LOCKED #7's "canonical value type is DateTime".)

- **Issue → FieldError:** `makeFormatterStandardSchemaV1` flattens the
  `SchemaIssue` tree to `{ message:string, path:ReadonlyArray<PropertyKey> }`
  (`Pointer` appends path; `Composite`/`AnyOf` flatMap). TanStack's
  `prefixSchemaToErrors` buckets by dotted/array path per field. Paths may contain
  numbers/symbols — coerce with `String()` if read directly.
- **Cross-field validation:** attach `S.filter`/refinements at the Struct level
  that emit **Pointer** paths to the offending field (e.g. `confirmPassword`) so
  whole-object checks surface on the right field, not a form-level catch-all.
- **Messages:** defaults are developer-oriented (`Expected X, got Y`); a thrown
  defect collapses to one pathless `Cause.pretty` message. Pass
  `leafHook`/`checkHook` (and/or schema `annotations.message`) for end-user copy.
  → Centralize in one `toFormSchema(schema, { leafHook?, checkHook?, parseOptions? })`.
- **Browser-safe:** `toStandardSchemaV1` + decode use effect core only (no Node).
  `@standard-schema/spec` is only needed as a **types-level** dep if at all —
  effect ships its own `StandardSchemaV1` typing.

## D. Integration-seam verification (all CONFIRMED)

| Claim | Verdict | Evidence |
| --- | --- | --- |
| react-form v1.33 auto-detects a Standard Schema on `validators.onChange/onBlur/onSubmit` (no wrapper) | confirmed | `FieldApi.runValidator` (`FieldApi.ts:844-852`) + `FormApi.runValidator` (`FormApi.ts:1646-1654`) branch on `isStandardSchemaValidator` → `standardSchemaValidators[type]` |
| helper is `standardSchemaValidators` (PLURAL), exported from `@tanstack/form-core` | confirmed | `standardSchemaValidator.ts:73-110` (file singular, const plural); re-exported `form-core/src/index.ts:9` |
| effect `Schema.toStandardSchemaV1` is spec-compliant + `validate` may be async | confirmed | `Schema.ts:990-1038`; `~standard` `{version:1,vendor:'effect',validate}`; validate returns sync `Result` or `Promise<Result>` |
| async schema validation via `onChangeAsync/onSubmitAsync` | confirmed | `FormAsyncValidateOrFn = FormValidateAsyncFn \| StandardSchemaV1`; `FormApi.validateAsync` (`FormApi.ts:2153+`) dispatches `type:'validateAsync'` |

**Caveat to confirm before finalizing the catalog:** the local form-core clone
lists extra `@effect/*` beta.84 deps (likely a locally-modified devspace clone) —
confirm the **published** `@tanstack/react-form@1.33.0` dependency set from the
npm registry when adding the catalog pin.
