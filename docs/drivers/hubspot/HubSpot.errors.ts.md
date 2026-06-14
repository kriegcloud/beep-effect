---
title: HubSpot.errors.ts
nav_order: 2
parent: "@beep/hubspot"
---

## HubSpot.errors.ts overview

Typed technical errors for the HubSpot driver boundary.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [HubSpotError (class)](#hubspoterror-class)
  - [HubSpotErrorOptions (class)](#hubspoterroroptions-class)
  - [HubSpotErrorReason](#hubspoterrorreason)
  - [HubSpotErrorReason (type alias)](#hubspoterrorreason-type-alias)
---

# errors

## HubSpotError (class)

Technical failure raised by the HubSpot driver boundary.

**Example**

```ts
import { HubSpotError } from "@beep/hubspot"

const error = HubSpotError.fromReason("transport", {
  formGuid: "form-guid",
  url: "https://api.hsforms.com/submissions/v3/integration/secure/submit/12345/form-guid"
})

console.log(error.reason) // "transport"
```

**Signature**

```ts
declare class HubSpotError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.errors.ts#L80)

Since v0.0.0

## HubSpotErrorOptions (class)

Options used when constructing HubSpot driver errors.

**Example**

```ts
import { HubSpotErrorOptions } from "@beep/hubspot"

const options = HubSpotErrorOptions.make({
  formGuid: "form-guid",
  status: 429
})

console.log(options.status) // 429
```

**Signature**

```ts
declare class HubSpotErrorOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.errors.ts#L171)

Since v0.0.0

## HubSpotErrorReason

Technical error reasons emitted by the HubSpot driver.

**Example**

```ts
import { HubSpotErrorReason } from "@beep/hubspot"
import * as S from "effect/Schema"

const reason = S.decodeSync(HubSpotErrorReason)("transport")
console.log(reason) // "transport"
```

**Signature**

```ts
declare const HubSpotErrorReason: AnnotatedSchema<LiteralKit<readonly ["config", "request encoding", "response decoding", "response status", "transport"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.errors.ts#L34)

Since v0.0.0

## HubSpotErrorReason (type alias)

Type for `HubSpotErrorReason`.

**Example**

```ts
import type { HubSpotErrorReason as HubSpotErrorReasonType } from "@beep/hubspot"

const reason: HubSpotErrorReasonType = "response status"
console.log(reason) // "response status"
```

**Signature**

```ts
type HubSpotErrorReason = typeof HubSpotErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.errors.ts#L60)

Since v0.0.0