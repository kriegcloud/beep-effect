---
title: OtlpPacketLab.ts
nav_order: 5
parent: "@beep/observability"
---

## OtlpPacketLab.ts overview

Experimental OTLP packet capture helpers for server observability testing.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [layerJson](#layerjson)
  - [layerProtobuf](#layerprotobuf)
- [models](#models)
  - [OtlpPacket (class)](#otlppacket-class)
  - [OtlpPacketEncoding](#otlppacketencoding)
  - [OtlpPacketEncoding (type alias)](#otlppacketencoding-type-alias)
  - [OtlpPacketKind](#otlppacketkind)
  - [OtlpPacketKind (type alias)](#otlppacketkind-type-alias)
- [services](#services)
  - [OtlpPacketLab (class)](#otlppacketlab-class)
---

# layers

## layerJson

Build a packet lab backed by JSON OTLP serialization.

**Example**

```ts
```typescript
import { layerJson } from "@beep/observability/experimental/server"

console.log(layerJson)
```
```

**Signature**

```ts
declare const layerJson: Layer.Layer<OtlpSerialization.OtlpSerialization | OtlpPacketLab, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/experimental/server/OtlpPacketLab.ts#L273)

Since v0.0.0

## layerProtobuf

Build a packet lab backed by protobuf OTLP serialization.

**Example**

```ts
```typescript
import { layerProtobuf } from "@beep/observability/experimental/server"

console.log(layerProtobuf)
```
```

**Signature**

```ts
declare const layerProtobuf: Layer.Layer<OtlpSerialization.OtlpSerialization | OtlpPacketLab, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/experimental/server/OtlpPacketLab.ts#L288)

Since v0.0.0

# models

## OtlpPacket (class)

One captured OTLP packet.

**Example**

```ts
```typescript
import { OtlpPacket } from "@beep/observability/experimental/server"

console.log(OtlpPacket)
```
```

**Signature**

```ts
declare class OtlpPacket
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/experimental/server/OtlpPacketLab.ts#L106)

Since v0.0.0

## OtlpPacketEncoding

OTLP body encodings captured by the packet lab.

**Example**

```ts
```typescript
import { OtlpPacketEncoding } from "@beep/observability/experimental/server"

console.log(OtlpPacketEncoding)
```
```

**Signature**

```ts
declare const OtlpPacketEncoding: AnnotatedSchema<LiteralKit<readonly ["json", "protobuf"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/experimental/server/OtlpPacketLab.ts#L71)

Since v0.0.0

## OtlpPacketEncoding (type alias)

Runtime type for `OtlpPacketEncoding`.

**Example**

```ts
```typescript
import type { OtlpPacketEncoding } from "@beep/observability/experimental/server"

const encoding: OtlpPacketEncoding = "json"
console.log(encoding)
```
```

**Signature**

```ts
type OtlpPacketEncoding = typeof OtlpPacketEncoding.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/experimental/server/OtlpPacketLab.ts#L91)

Since v0.0.0

## OtlpPacketKind

OTLP packet families captured by the packet lab.

**Example**

```ts
```typescript
import { OtlpPacketKind } from "@beep/observability/experimental/server"

console.log(OtlpPacketKind)
```
```

**Signature**

```ts
declare const OtlpPacketKind: AnnotatedSchema<LiteralKit<readonly ["logs", "metrics", "traces"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/experimental/server/OtlpPacketLab.ts#L36)

Since v0.0.0

## OtlpPacketKind (type alias)

Runtime type for `OtlpPacketKind`.

**Example**

```ts
```typescript
import type { OtlpPacketKind } from "@beep/observability/experimental/server"

const kind: OtlpPacketKind = "traces"
console.log(kind)
```
```

**Signature**

```ts
type OtlpPacketKind = typeof OtlpPacketKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/experimental/server/OtlpPacketLab.ts#L56)

Since v0.0.0

# services

## OtlpPacketLab (class)

Packet lab service for capturing serialized OTLP payloads.

**Example**

```ts
```typescript
import { Effect } from "effect"
import { OtlpPacketLab } from "@beep/observability/experimental/server"

const program = Effect.gen(function* () {
  const lab = yield* OtlpPacketLab
  return yield* lab.snapshot
})

console.log(program)
```
```

**Signature**

```ts
declare class OtlpPacketLab
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/experimental/server/OtlpPacketLab.ts#L139)

Since v0.0.0