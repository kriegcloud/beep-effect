---
title: index.ts
nav_order: 5
parent: "@beep/data"
---

## index.ts overview

Blockchain network metadata namespace.

**Example**

```ts
```typescript
import { Blockchain } from "@beep/data"

console.log(Blockchain.Networks.Ethereum.ticker)
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [Calendar (namespace export)](#calendar-namespace-export)
- [CurrencyCodes (namespace export)](#currencycodes-namespace-export)
- [KeyboardShortcuts (namespace export)](#keyboardshortcuts-namespace-export)
- [MimeTypesData (namespace export)](#mimetypesdata-namespace-export)
- [Timezones (namespace export)](#timezones-namespace-export)
---

# constants

## Blockchain (namespace export)

Re-exports all named exports from the "./Blockchain.ts" module as `Blockchain`.

**Example**

```ts
```typescript
import { Blockchain } from "@beep/data"

console.log(Blockchain.Networks.Ethereum.ticker)
```
```

**Signature**

```ts
export * as Blockchain from "./Blockchain.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/index.ts#L25)

Since v0.0.0

## Calendar (namespace export)

Re-exports all named exports from the "./Calendar.ts" module as `Calendar`.

**Example**

```ts
```typescript
import { Calendar } from "@beep/data"

console.log(Calendar.MonthNameValues[0])
```
```

**Signature**

```ts
export * as Calendar from "./Calendar.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/index.ts#L39)

Since v0.0.0

## CurrencyCodes (namespace export)

Re-exports all named exports from the "./CurrencyCodes.ts" module as `CurrencyCodes`.

**Example**

```ts
```typescript
import { CurrencyCodes } from "@beep/data"

console.log(CurrencyCodes.CurrencyCodeDataValues[0].code)
```
```

**Signature**

```ts
export * as CurrencyCodes from "./CurrencyCodes.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/index.ts#L53)

Since v0.0.0

## KeyboardShortcuts (namespace export)

Re-exports all named exports from the "./KeyboardShortcuts.ts" module as `KeyboardShortcuts`.

**Example**

```ts
```typescript
import { KeyboardShortcuts } from "@beep/data"

console.log(KeyboardShortcuts.KeyboardShortcutDataValues[0].name)
```
```

**Signature**

```ts
export * as KeyboardShortcuts from "./KeyboardShortcuts.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/index.ts#L67)

Since v0.0.0

## MimeTypesData (namespace export)

Re-exports all named exports from the "./MimeTypes.ts" module as `MimeTypesData`.

**Example**

```ts
```typescript
import { MimeTypesData } from "@beep/data"

console.log(MimeTypesData.lookup("asset.json"))
```
```

**Signature**

```ts
export * as MimeTypesData from "./MimeTypes.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/index.ts#L81)

Since v0.0.0

## Timezones (namespace export)

Re-exports all named exports from the "./Timezones.ts" module as `Timezones`.

**Example**

```ts
```typescript
import { Timezones } from "@beep/data"

console.log(Timezones.TimezoneNameValues[0])
```
```

**Signature**

```ts
export * as Timezones from "./Timezones.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/index.ts#L95)

Since v0.0.0