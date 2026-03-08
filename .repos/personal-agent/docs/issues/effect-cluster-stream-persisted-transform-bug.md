# Bug: `Reply.serialize` fails for persisted streaming RPCs when success schema contains Transform fields

## Summary

`stream: true` + `.annotate(ClusterSchema.Persisted, true)` fails with `SchemaError` when the RPC's success schema contains fields with Transform schemas (e.g., `Schema.DateTimeUtcFromString`). The `Reply.Chunk` JSON codec receives pre-encoded type parameters that have had their transform chains stripped, so it cannot convert Type-form values (e.g., `DateTime.Utc`) to their encoded form (e.g., `string`).

Persisted streaming RPCs work correctly when the success schema contains only primitive types (Number, String, Literal).

## Environment

- **effect**: `4.0.0-beta.11`
- **Platform**: Node/Bun
- **Modules**: `effect/unstable/cluster` (`Entity`, `SingleRunner`, `ClusterSchema`), `effect/unstable/rpc` (`Rpc`)

## Minimal Reproduction

```typescript
import { DateTime, Effect, Schema, SchemaAST, Stream } from "effect"
import { ClusterSchema, Entity, SingleRunner } from "effect/unstable/cluster"
import { Rpc } from "effect/unstable/rpc"

// Schema.Class with a Transform field
class MyEvent extends Schema.Class<MyEvent>("MyEvent")({
  type: Schema.Literal("event"),
  createdAt: Schema.DateTimeUtcFromString // <-- Transform: string <-> DateTime.Utc
}) {}

// Persisted streaming RPC using that schema
const MyRpc = Rpc.make("stream", {
  payload: { key: Schema.String },
  success: MyEvent,
  stream: true,
  primaryKey: ({ key }) => key
}).annotate(ClusterSchema.Persisted, true)

const MyEntity = Entity.make("MyEntity", [MyRpc])

const layer = MyEntity.toLayer(
  Effect.succeed({
    stream: () =>
      Stream.make(
        new MyEvent({
          type: "event",
          createdAt: DateTime.unsafeNow()
        })
      )
  })
)

// Running this through SingleRunner produces:
// SchemaError: Expected string, got DateTime.Utc(...)
//   at ["values"][0]["createdAt"]
```

### Isolating the root cause (no cluster needed)

The bug can be reproduced at the schema level without standing up a cluster:

```typescript
import { DateTime, Schema, SchemaAST } from "effect"

class MyEvent extends Schema.Class<MyEvent>("MyEvent")({
  type: Schema.Literal("event"),
  createdAt: Schema.DateTimeUtcFromString
}) {}

// This works — toCodecJson preserves the full transform chain:
const jsonCodec = Schema.toCodecJson(MyEvent)
Schema.encodeSync(jsonCodec)(new MyEvent({ type: "event", createdAt: DateTime.unsafeNow() }))
// => { type: "event", createdAt: "2024-01-01T00:00:00.000Z" } ✅

// This fails — AST.toEncoded strips the transform chain:
const encodedSchema = Schema.make(SchemaAST.toEncoded(MyEvent.ast))
Schema.encodeSync(encodedSchema)(new MyEvent({ type: "event", createdAt: DateTime.unsafeNow() }))
// => SchemaError: Expected string, got DateTime.Utc(...) ❌
```

## Root Cause

In [`src/internal/schema/to-codec.ts`](https://github.com/Effect-TS/effect/blob/main/packages/effect/src/internal/schema/to-codec.ts), when `toCodecJson` processes a `Declaration` AST node, it maps type parameters through `AST.toEncoded` before passing them to the `toCodecJson`/`toCodec` handler:

```typescript
// to-codec.ts
case "Declaration": {
  const getLink = ast.annotations?.toCodecJson ?? ast.annotations?.toCodec
  if (Predicate.isFunction(getLink)) {
    const tps = AST.isDeclaration(ast)
      ? ast.typeParameters.map((tp) => InternalSchema.make(AST.toEncoded(tp)))
      //                                                    ^^^^^^^^^^^^^^
      //                     Strips transform chains from type parameters
      : []
    const link = getLink(tps)
    // ...
  }
}
```

`Reply.Chunk.schemaFrom` creates a `declareConstructor` with a `toCodecJson` annotation that uses the success type parameter for its `values` field:

```typescript
// Reply.ts — Chunk.schemaFrom
toCodecJson: ([success]) =>
  //           ^^^^^^^^^ receives AST.toEncoded(successSchema) — transforms stripped
  Schema.link<Chunk<Rpc.Any>>()(
    Schema.Struct({
      _tag: Schema.Literal("Chunk"),
      // ...
      values: Schema.NonEmptyArray(success) // <-- encoded-form schema, can't handle Type values
    }),
    Transformation.transform({
      decode: (encoded) => new Chunk(encoded),
      encode: (result) => ({ ...result }) // spreads Chunk but values remain as Type form
    })
  )
```

The flow:

1. Entity handler returns a `Stream<MyEvent>` where each element has `createdAt: DateTime.Utc`
2. Entity manager wraps emitted values in `Reply.Chunk({ values: [myEvent] })`
3. `Reply.serialize` calls `Schema.encodeEffect(Schema.toCodecJson(replySchema))(chunk)`
4. The Chunk's `toCodecJson` handler receives `success = Schema.make(AST.toEncoded(MyEvent.ast))`
5. `AST.toEncoded(MyEvent.ast)` produces a plain `Objects` AST with `createdAt: String` (no transform)
6. The codec tries to encode `DateTime.Utc` against `String` → **fails**

### Why Effect's own tests don't catch this

The existing cluster entity tests use `User` which has only primitive fields:

```typescript
// TestEntity.ts
export class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  name: Schema.String
}) {}
```

For primitive-only schemas, `AST.toEncoded` produces the same types as the Type form, so the codec works. The bug only manifests with Transform fields like `DateTimeUtcFromString`, `NumberFromString`, etc.

## Expected Behavior

Persisted streaming RPCs should work with any valid success schema, including schemas with Transform fields. The `Reply.Chunk` JSON codec should preserve the transform chain so it can properly encode Type-form values to their JSON representation.

## Workaround

Remove `Persisted` and `primaryKey` from streaming RPCs that use schemas with Transform fields:

```typescript
// Instead of:
const MyRpc = Rpc.make("stream", {
  payload: { ... },
  success: MyEvent,
  stream: true,
  primaryKey: ({ id }) => id
}).annotate(ClusterSchema.Persisted, true)

// Use:
const MyRpc = Rpc.make("stream", {
  payload: { ... },
  success: MyEvent,
  stream: true
})
```

This disables reply persistence (durable streams / idempotent replay), but streaming works correctly through `SingleRunner`.
