---
title: useNumberInput.ts
nav_order: 7
parent: "@beep/ui"
---

## useNumberInput.ts overview

---
## Exports Grouped by Category
- [components](#components)
  - [useNumberInput](#usenumberinput)
- [components, components](#components-components)
  - [useNumberBoundary](#usenumberboundary)
- [constants](#constants)
  - [maxSafeInteger](#maxsafeinteger)
  - [minSafeInteger](#minsafeinteger)
- [models](#models)
  - [BoundaryParams (class)](#boundaryparams-class)
  - [NumberInputChangeMetadata (class)](#numberinputchangemetadata-class)
  - [NumberInputError](#numberinputerror)
  - [NumberInputError (type alias)](#numberinputerror-type-alias)
  - [NumberInputEventType](#numberinputeventtype)
  - [NumberInputEventType (type alias)](#numberinputeventtype-type-alias)
  - [SpinParams (class)](#spinparams-class)
  - [UseNumberInputOptions (type alias)](#usenumberinputoptions-type-alias)
- [utilities](#utilities)
  - [getStepFactor](#getstepfactor)
  - [numberToString](#numbertostring)
  - [toNumber](#tonumber)
---

# components

## useNumberInput

Fully managed number-input hook with keyboard and spinner controls.

**Example**

```ts
import React from "react"
import { useNumberInput } from "@beep/ui/hooks/useNumberInput"

function Example() {
  const number = useNumberInput({ defaultValue: 1, min: 0, max: 10 })
  return React.createElement("input", { ref: number.inputRef, ...number.getInputProps() })
}

console.log(Example.name)
```

**Signature**

```ts
declare const useNumberInput: (options?: UseNumberInputOptions) => { inputRef: React.RefObject<HTMLInputElement | null>; getInputProps: (handlers?: Partial<InputHandlers>) => { pattern: string; role: string; "aria-valuemin": number; "aria-valuemax": number; autoComplete: string; autoCorrect: string; "aria-valuetext": string; "aria-valuenow": number | undefined; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; onBlur: (event: React.FocusEvent<HTMLInputElement, Element>) => void; onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void; onWheel: (event: React.WheelEvent<HTMLInputElement>) => void; }; getIncrementProps: (handlers?: Partial<ButtonHandlers>) => { onMouseUp: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; onMouseLeave: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; onTouchEnd: (event: React.TouchEvent<HTMLButtonElement>) => void; disabled: boolean; "aria-disabled": boolean | undefined; onTouchStart?: ((event: React.TouchEvent<HTMLButtonElement>) => void) | undefined; onMouseDown?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | undefined; tabIndex: number; }; getDecrementProps: (handlers?: Partial<ButtonHandlers>) => { onMouseUp: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; onMouseLeave: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; onTouchEnd: (event: React.TouchEvent<HTMLButtonElement>) => void; disabled: boolean; "aria-disabled": boolean | undefined; onTouchStart?: ((event: React.TouchEvent<HTMLButtonElement>) => void) | undefined; onMouseDown?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | undefined; tabIndex: number; }; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L632)

Since v0.0.0

# components, components

## useNumberBoundary

Low-level hook that manages string and numeric boundary state for a number input.

Use this when you need number parsing, formatting, and range-aware increment/decrement
behavior but want to build your own DOM event handlers on top.

**Example**

```ts
```typescript
import React from "react"
import { useNumberBoundary } from "@beep/ui/hooks/useNumberInput"

function Example() {
  const number = useNumberBoundary({ defaultValue: 1, min: 0, max: 10 })
  return React.createElement("output", null, number.interfaceValue)
}

console.log(Example.name)
```
```

**Signature**

```ts
declare const useNumberBoundary: (options?: UseNumberInputOptions, scope?: string | undefined) => { interfaceValueAtom: Atom.Writable<string, string>; numberValue: number | undefined; interfaceValue: string; setInterfaceValue: (value: string) => void; increment: (params?: SpinParams) => void; decrement: (params?: SpinParams) => void; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L555)

Since v0.0.0

# constants

## maxSafeInteger

Highest safe integer supported by the hook defaults.

**Example**

```ts
import { maxSafeInteger } from "@beep/ui/hooks/useNumberInput"

console.log(maxSafeInteger)
```

**Signature**

```ts
declare const maxSafeInteger: number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L214)

Since v0.0.0

## minSafeInteger

Lowest safe integer supported by the hook defaults.

**Example**

```ts
import { minSafeInteger } from "@beep/ui/hooks/useNumberInput"

console.log(minSafeInteger)
```

**Signature**

```ts
declare const minSafeInteger: number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L199)

Since v0.0.0

# models

## BoundaryParams (class)

Schema describing optional numeric bounds and controlled values for number input hooks.

**Example**

```ts
import { BoundaryParams } from "@beep/ui/hooks/useNumberInput"

const params = BoundaryParams.make({ min: 0, max: 10, defaultValue: 5 })
console.log(params.defaultValue)
```

**Signature**

```ts
declare class BoundaryParams
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L230)

Since v0.0.0

## NumberInputChangeMetadata (class)

Metadata passed to `UseNumberInputOptions.onChange`.

**Example**

```ts
import { NumberInputChangeMetadata, NumberInputEventType } from "@beep/ui/hooks/useNumberInput"

const metadata = NumberInputChangeMetadata.make({
  error: null,
  eventType: NumberInputEventType.Enum.change,
  valueText: "5"
})

console.log(metadata.valueText)
```

**Signature**

```ts
declare class NumberInputChangeMetadata
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L453)

Since v0.0.0

## NumberInputError

Error states reported through the `onChange` metadata callback.

**Example**

```ts
import { NumberInputError } from "@beep/ui/hooks/useNumberInput"

console.log(NumberInputError.Options)
```

**Signature**

```ts
declare const NumberInputError: AnnotatedSchema<LiteralKit<readonly ["exceed-max", "below-min"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L420)

Since v0.0.0

## NumberInputError (type alias)

Runtime type for `NumberInputError`.

**Signature**

```ts
type NumberInputError = typeof NumberInputError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L432)

Since v0.0.0

## NumberInputEventType

Event types reported through the `onChange` metadata callback.

**Example**

```ts
import { NumberInputEventType } from "@beep/ui/hooks/useNumberInput"

console.log(NumberInputEventType.Options)
```

**Signature**

```ts
declare const NumberInputEventType: AnnotatedSchema<LiteralKit<readonly ["change", "blur"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L393)

Since v0.0.0

## NumberInputEventType (type alias)

Runtime type for `NumberInputEventType`.

**Signature**

```ts
type NumberInputEventType = typeof NumberInputEventType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L405)

Since v0.0.0

## SpinParams (class)

Schema describing step and precision overrides for spinner changes.

**Example**

```ts
import { SpinParams } from "@beep/ui/hooks/useNumberInput"

const params = SpinParams.make({ step: 0.5, precision: 1 })
console.log(params.step)
```

**Signature**

```ts
declare class SpinParams
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L256)

Since v0.0.0

## UseNumberInputOptions (type alias)

Options accepted by `useNumberBoundary` and `useNumberInput`.

**Example**

```ts
import type { UseNumberInputOptions } from "@beep/ui/hooks/useNumberInput"

const options: UseNumberInputOptions = { min: 0, max: 10, step: 1 }
console.log(options.max)
```

**Signature**

```ts
type UseNumberInputOptions = BoundaryParams &
  SpinParams & {
    /**
     * If true, the input's value will change based on mouse wheel.
     */
    readonly allowMouseWheel?: boolean | undefined;
    /**
     * When user types number directly into the input.
     * This controls the value update when you blur out of the input.
     * - If true and the value is greater than max, the value will be reset to max.
     * - Else, the value remains the same.
     */
    readonly clampValueOnBlur?: boolean | undefined;
    /**
     * This controls the value update behavior in general.
     * - If true and you use the stepper or up/down arrow keys, the value will not exceed the max or go lower than min.
     * - If false, the value will be allowed to go out of range.
     */
    readonly keepWithinRange?: boolean | undefined;
    /**
     * If true, the input will be focused as you increment or decrement the value with the stepper.
     */
    readonly focusInputOnChange?: boolean | undefined;
    readonly formatter?: ((value: string) => string) | undefined;
    readonly parser?: ((value: string) => string) | undefined;
    /**
     * Callback function invoked whenever the input value changes.
     */
    readonly onChange?: ((value: number | undefined, metadata: NumberInputChangeMetadata) => void) | undefined;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L499)

Since v0.0.0

# utilities

## getStepFactor

Compute the effective step multiplier for an increment or decrement gesture.

Holding `meta` or `ctrl` applies a fine-grained `0.1x` multiplier, while `shift`
applies a coarse `10x` multiplier. The returned value is clamped so precision
rounding never produces a no-op step.

**Example**

```ts
```typescript
import { getStepFactor } from "@beep/ui/hooks/useNumberInput"

const coarse = getStepFactor({ shiftKey: true }, 2, { precision: 0 })
const fine = getStepFactor({ ctrlKey: true }, 2, { precision: 2 })

console.log(coarse) // 20
console.log(fine) // 0.2
```
```

**Example**

```ts
```typescript
import { pipe } from "effect"
import { getStepFactor } from "@beep/ui/hooks/useNumberInput"

const factor = pipe({ metaKey: true }, getStepFactor(5, { precision: 2 }))

console.log(factor) // 0.5
```
```

**Signature**

```ts
declare const getStepFactor: { (step: number, options: { readonly precision: number; }): (event: Partial<ModifierKeyState>) => number; (event: Partial<ModifierKeyState>, step: number, options: { readonly precision: number; }): number; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L366)

Since v0.0.0

## numberToString

Format an optional numeric value using a fixed decimal precision.

Invalid numeric values normalize to an empty string so the hook can safely render
controlled inputs.

**Example**

```ts
```typescript
import { numberToString } from "@beep/ui/hooks/useNumberInput"

const formatted = numberToString(12.345, 2)
const empty = numberToString(undefined, 2)

console.log(formatted) // "12.35"
console.log(empty) // ""
```
```

**Signature**

```ts
declare const numberToString: { (precision: number): (value: number | undefined) => string; (value: number | undefined, precision?: number): string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L319)

Since v0.0.0

## toNumber

Convert editable number-input text into a number when the text is parseable.

Empty strings and invalid numeric strings normalize to `undefined`.

**Example**

```ts
```typescript
import { toNumber } from "@beep/ui/hooks/useNumberInput"

const parsed = toNumber("12.5")
const missing = toNumber("")

console.log(parsed) // 12.5
console.log(missing) // undefined
```
```

**Signature**

```ts
declare const toNumber: (value: string | undefined) => number | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useNumberInput.ts#L287)

Since v0.0.0