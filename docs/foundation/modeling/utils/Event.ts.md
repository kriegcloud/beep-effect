---
title: Event.ts
nav_order: 6
parent: "@beep/utils"
---

## Event.ts overview

Helpers for schema-backed server-sent event envelopes.

Since v0.0.0

---
## Exports Grouped by Category
- [codecs](#codecs)
  - ["effect/unstable/encoding/Sse" (namespace export)](#effectunstableencodingsse-namespace-export)
- [constructors](#constructors)
  - [makeEvent](#makeevent)
---

# codecs

## "effect/unstable/encoding/Sse" (namespace export)

Re-exports all named exports from the "effect/unstable/encoding/Sse" module.

**Example**

```ts
import * as Sse from "@beep/utils/Event"

console.log(Sse)
```

**Signature**

```ts
export * from "effect/unstable/encoding/Sse"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Event.ts#L25)

Since v0.0.0

# constructors

## makeEvent

Creates a typed server-sent event schema.

**Example**

```ts
import * as S from "effect/Schema"
import { makeEvent } from "@beep/utils/Event"

const Progress = makeEvent({ percent: S.Finite })("Progress")
const event = new Progress({ payload: { percent: 100 } })
console.log(event)
```

**Signature**

```ts
declare const makeEvent: { <TTag extends TString.NonEmpty, TFields extends S.Struct.Fields>(payload: TFields, tag: TTag): MakeEventSchema<TTag, TFields>; <TFields extends S.Struct.Fields>(payload: TFields): <TTag extends TString.NonEmpty>(tag: TTag) => MakeEventSchema<TTag, TFields>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Event.ts#L89)

Since v0.0.0