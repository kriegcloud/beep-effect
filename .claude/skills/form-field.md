---
paths:
  - "packages/ui/ui/src/inputs/**/*"
  - "packages/ui/ui/src/form/**/*"
---

# Form Field Skill

Create TanStack Form integrated input fields following beep-effect patterns.

## When to Invoke

Invoke this skill when:
- Creating a new form input field (Select, DatePicker, Rating, etc.)
- Integrating MUI input components with TanStack Form
- Building custom form controls with validation
- Adding form fields to `@beep/ui/inputs`

## MCP Server Prerequisites

**No MCP servers required.** This skill uses local codebase patterns only.

### Reference Strategy

1. Read existing fields in `packages/ui/ui/src/inputs/`
2. Use `TextField.tsx` as the canonical reference
3. Check `@beep/ui/form` for context hooks

---

## Critical Constraints

1. **DefaultOmit Pattern** — MUST use `DefaultOmit<T>` for props (strips controlled props)
2. **useFieldContext Hook** — MUST use `useFieldContext<T>()` to access form field state
3. **Store Subscription** — MUST use `useStore` with selector pattern for error state
4. **Error Combination** — MUST combine submit AND inline validation errors
5. **Effect Utilities** — Use Effect for array operations

---

## Workflow

### Step 1: Parse Requirements

Extract from user request:
- Field type (text, select, checkbox, date, etc.)
- Value type (`string`, `boolean`, `Date`, `Option<T>`, etc.)
- Base MUI component to wrap
- Custom validation requirements

### Step 2: Read Reference Implementation

```typescript
// Always start with TextField as canonical example
Read({ file_path: "packages/ui/ui/src/inputs/TextField.tsx" })
Read({ file_path: "packages/ui/ui/src/inputs/Field.tsx" })

// Read similar field type if available
Read({ file_path: "packages/ui/ui/src/inputs/SelectField.tsx" })
Read({ file_path: "packages/ui/ui/src/inputs/CheckboxField.tsx" })
```

### Step 3: Generate Component

Follow the output template below.

### Step 4: Wire Up Exports

1. Add to `packages/ui/ui/src/inputs/index.ts`
2. Verify TypeScript exports compile

---

## Output Template

```typescript
import { useFieldContext } from "@beep/ui/form";
import MuiComponent, { type ComponentProps } from "@mui/material/Component";
import { useStore } from "@tanstack/react-form";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import type React from "react";
import type { DefaultOmit } from "./Field";

const ComponentField: React.FC<DefaultOmit<ComponentProps>> = ({
  helperText,
  slotProps,
  ...props
}) => {
  // 1. Get field context with appropriate type
  const field = useFieldContext<string>();

  // 2. Subscribe to form store for errors (MUST use selector pattern)
  const { isError, error } = useStore(
    field.form.store,
    (state) =>
      ({
        isError: !!state.errorMap.onSubmit?.[field.name],
        error: state.errorMap.onSubmit?.[field.name],
      }) as const  // REQUIRED for type stability
  );

  // 3. Check for inline validation errors
  const hasInlineErrors = A.length(field.state.meta.errors) > 0;

  return (
    <MuiComponent
      // Wire field identification
      id={field.name}
      name={field.name}
      // Wire value and handlers
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      // Combine submit and inline errors
      error={isError || hasInlineErrors}
      helperText={
        (error || hasInlineErrors
          ? `${error ? `${error}` : ""} ${A.join(", ")(field.state.meta.errors)}`
          : undefined) ?? helperText
      }
      // Pass through remaining props
      slotProps={slotProps}
      {...props}
    />
  );
};

export default ComponentField;
```

---

## DefaultOmit Pattern

```typescript
// Field.tsx - ALWAYS import this
export type OmitProps = "error" | "value" | "onChange" | "onBlur" | "defaultValue" | "id" | "name";
export type DefaultOmit<T> = Omit<T, OmitProps>;
```

**CRITICAL**: Form fields MUST use `DefaultOmit<T>` because TanStack Form controls:
- `value` - Controlled by field state
- `onChange` - Controlled by `field.handleChange`
- `onBlur` - Controlled by `field.handleBlur`
- `error` - Derived from form error map
- `id` / `name` - Set to `field.name`
- `defaultValue` - Not applicable in controlled mode

---

## Error Display Pattern

```typescript
// Subscribe to submit errors
const { isError, error } = useStore(
  field.form.store,
  (state) =>
    ({
      isError: !!state.errorMap.onSubmit?.[field.name],
      error: state.errorMap.onSubmit?.[field.name],
    }) as const
);

// Check inline validation errors
const hasInlineErrors = A.length(field.state.meta.errors) > 0;

// Combine both error types
<TextField
  error={isError || hasInlineErrors}
  helperText={
    (error || hasInlineErrors
      ? `${error ? `${error}` : ""} ${A.join(", ")(field.state.meta.errors)}`
      : undefined) ?? helperText
  }
/>
```

---

## Value Type Patterns

### String Field

```typescript
const field = useFieldContext<string>();

onChange={(e) => field.handleChange(e.target.value)}
```

### Boolean Field (Checkbox/Switch)

```typescript
const field = useFieldContext<boolean>();

onChange={(e) => field.handleChange(e.target.checked)}
```

### Number Field

```typescript
import { transformValue, transformValueOnChange } from "@beep/ui-core/utils";

const field = useFieldContext<string>();
const isNumberType = P.isNumber(field.state.value);

value={isNumberType ? transformValue(field.state.value) : field.state.value}
onChange={(e) => {
  const transformedValue = isNumberType
    ? transformValueOnChange(e.target.value)
    : e.target.value;
  field.handleChange(transformedValue);
}}
```

### Select Field (Single)

```typescript
const field = useFieldContext<string>();

value={field.state.value}
onChange={(e) => field.handleChange(e.target.value)}
```

### Multi-Select Field

```typescript
const field = useFieldContext<string[]>();

value={field.state.value}
onChange={(e) => {
  const value = e.target.value;
  field.handleChange(typeof value === "string" ? value.split(",") : value);
}}
```

### Date Field (Effect DateTime)

```typescript
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";

const field = useFieldContext<DateTime.DateTime>();

// Convert to native Date for MUI DatePicker
value={F.pipe(field.state.value, DateTime.toDate, O.getOrNull)}
onChange={(date) => {
  if (date) {
    const dt = DateTime.unsafeFromDate(date);
    field.handleChange(dt);
  }
}}
```

---

## HelperText Component

For custom error display:

```typescript
import FormHelperText, { type FormHelperTextProps } from "@mui/material/FormHelperText";

export type HelperTextProps = FormHelperTextProps & {
  readonly errorMessage?: string | undefined;
  readonly helperText?: React.ReactNode | undefined;
  readonly disableGutters?: boolean | undefined;
};

export function HelperText({
  errorMessage,
  helperText,
  disableGutters,
  sx,
  ...rest
}: HelperTextProps) {
  if (!errorMessage && !helperText) return null;

  return (
    <FormHelperText
      error={!!errorMessage}
      sx={[{ mx: disableGutters ? 0 : 1.75 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...rest}
    >
      {errorMessage || helperText}
    </FormHelperText>
  );
}
```

---

## Example Invocations

### Example 1: Create RatingField

**User request**: "Create a RatingField component for star ratings"

**Actions**:
1. Read `packages/ui/ui/src/inputs/TextField.tsx` for pattern
2. Import MUI Rating component
3. Create `RatingField.tsx` with `useFieldContext<number>()`
4. Wire `value={field.state.value}` and `onChange={(_, value) => field.handleChange(value ?? 0)}`
5. Add export to `inputs/index.ts`

### Example 2: Create MultiCheckboxField

**User request**: "Create a field for selecting multiple checkboxes"

**Actions**:
1. Read existing `CheckboxField.tsx`
2. Create `MultiCheckboxField.tsx` with `useFieldContext<string[]>()`
3. Map over options to render checkboxes
4. Toggle values in/out of array on change
5. Use `A.filter` and `A.append` for array manipulation

---

## Key Reference Files

| File | Pattern | Value Type |
|------|---------|------------|
| `TextField.tsx` | Basic string field | `string` |
| `CheckboxField.tsx` | Boolean field | `boolean` |
| `SelectField.tsx` | Single select | `string` |
| `MultiSelectField.tsx` | Multi select | `string[]` |
| `DatePickerField.tsx` | Effect DateTime | `DateTime.DateTime` |
| `RadioGroupField.tsx` | Radio options | `string` |
| `SliderField.tsx` | Numeric slider | `number` |
| `SwitchField.tsx` | Toggle boolean | `boolean` |

---

## Accessibility Requirements

```typescript
const labelId = `${field.name}-label`;
const inputId = `${field.name}-input`;

<FormLabel id={labelId} htmlFor={inputId}>
  {label}
</FormLabel>
<Input
  id={inputId}
  aria-labelledby={labelId}
  {...(!label && { "aria-label": `${name} input` })}
/>
```

---

## Test ID Conventions

Add `data-testid` attributes to form fields for Playwright testing:

```typescript
<MuiTextField
  data-testid={`${field.name}-field`}
  id={field.name}
  name={field.name}
  // ... other props
/>
```

**Naming Pattern**: `{field.name}-field` (e.g., `email-field`, `password-field`)

---

## Related Skills

| Skill | Relationship |
|-------|--------------|
| `atomic-component.md` | Use for custom styled inputs beyond MUI components |
| `effect-check.md` | Run AFTER generation to validate Effect patterns |
| `visual-testing.md` | Generate form interaction tests using field test IDs |
| `mui-component-override.md` | Use for global MUI input styling changes |

**Form vs Component Skill:**
- **This skill**: TanStack Form integrated inputs with validation
- **atomic-component.md**: Presentational components without form context

**Workflow Integration:**
1. Generate form field with this skill
2. Run `effect-check.md` to validate patterns
3. Generate form tests with `visual-testing.md`
4. Use `data-testid="{field.name}-field"` selectors in tests

---

## Verification Checklist

- [ ] Uses `DefaultOmit<T>` for props type
- [ ] Uses `useFieldContext<T>()` with correct value type
- [ ] Uses `useStore` with selector pattern for errors
- [ ] Combines submit and inline validation errors
- [ ] Wires `id` and `name` to `field.name`
- [ ] Wires `value` to `field.state.value`
- [ ] Wires `onChange` to `field.handleChange`
- [ ] Wires `onBlur` to `field.handleBlur`
- [ ] Uses Effect utilities (`A.join`, `A.length`), not native methods
- [ ] Includes `helperText` prop passthrough
- [ ] Export added to `inputs/index.ts`
- [ ] Component is default exported
- [ ] `data-testid` added for Playwright testing
