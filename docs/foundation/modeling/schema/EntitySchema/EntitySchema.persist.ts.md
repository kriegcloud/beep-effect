---
title: EntitySchema.persist.ts
nav_order: 71
parent: "@beep/schema"
---

## EntitySchema.persist.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CheckedPersistedFor (type alias)](#checkedpersistedfor-type-alias)
  - [EncodedAbsenceKind (type alias)](#encodedabsencekind-type-alias)
  - [EntityIdLike (type alias)](#entityidlike-type-alias)
  - [IndexHint (type alias)](#indexhint-type-alias)
  - [IndexHintKind (type alias)](#indexhintkind-type-alias)
  - [PersistDescriptor (type alias)](#persistdescriptor-type-alias)
  - [PersistDescriptor (namespace)](#persistdescriptor-namespace)
    - [Any (type alias)](#any-type-alias)
  - [PersistDescriptorByValueStrategy (type alias)](#persistdescriptorbyvaluestrategy-type-alias)
  - [PersistDescriptorFor (type alias)](#persistdescriptorfor-type-alias)
  - [PersistDescriptorForInput (type alias)](#persistdescriptorforinput-type-alias)
  - [PersistOptions (type alias)](#persistoptions-type-alias)
  - [PersistStrategy](#persiststrategy)
  - [PersistStrategy (type alias)](#persiststrategy-type-alias)
  - [PersistedFor (type alias)](#persistedfor-type-alias)
  - [PersistedMap (type alias)](#persistedmap-type-alias)
  - [StorageKind (type alias)](#storagekind-type-alias)
  - [ValueStrategy (type alias)](#valuestrategy-type-alias)
- [schemas](#schemas)
  - [EncodedAbsenceKind](#encodedabsencekind)
  - [IndexHint](#indexhint)
  - [IndexHintKind](#indexhintkind)
  - [PersistDescriptor](#persistdescriptor)
  - [StorageKind](#storagekind)
  - [ValueStrategy](#valuestrategy)
---

# models

## CheckedPersistedFor (type alias)

Persisted map that matches a field map and rejects keys outside that field map.

**Example**

```ts
import type { CheckedPersistedFor, EntityFieldInputs, PersistedFor } from "@beep/schema/EntitySchema"

type Checked = CheckedPersistedFor<EntityFieldInputs, PersistedFor<EntityFieldInputs>>
console.log({} as { checked: Checked })
```

**Signature**

```ts
type CheckedPersistedFor<FieldMap, Persisted> = Persisted & NoExtraPersistedKeys<FieldMap, Persisted>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L600)

Since v0.0.0

## EncodedAbsenceKind (type alias)

Runtime type for `EncodedAbsenceKind`.

**Example**

```ts
import type { EncodedAbsenceKind } from "@beep/schema/EntitySchema"

const absence: EncodedAbsenceKind = "optionalKey"
console.log(absence)
```

**Signature**

```ts
type EncodedAbsenceKind = typeof EncodedAbsenceKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L261)

Since v0.0.0

## EntityIdLike (type alias)

Entity-id schema shape accepted by persisted entity factories.

**Example**

```ts
import type { EntityIdLike } from "@beep/schema/EntitySchema"

console.log({} as { idSchema: EntityIdLike })
```

**Signature**

```ts
type EntityIdLike = S.Codec<unknown, number> & {
  readonly Type: unknown;
  readonly entityType: string;
  readonly tableName: string;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L465)

Since v0.0.0

## IndexHint (type alias)

Runtime type for `IndexHint`.

**Example**

```ts
import { IndexHint } from "@beep/schema/EntitySchema"
import type { IndexHint as IndexHintValue } from "@beep/schema/EntitySchema"

const hint: IndexHintValue = IndexHint.btree
console.log(hint.kind)
```

**Signature**

```ts
type IndexHint = typeof IndexHint.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L216)

Since v0.0.0

## IndexHintKind (type alias)

Runtime type for `IndexHintKind`.

**Example**

```ts
import type { IndexHintKind } from "@beep/schema/EntitySchema"

const kind: IndexHintKind = "unique"
console.log(kind)
```

**Signature**

```ts
type IndexHintKind = typeof IndexHintKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L166)

Since v0.0.0

## PersistDescriptor (type alias)

Descriptor for one persisted entity field.

**Example**

```ts
import type { PersistDescriptor } from "@beep/schema/EntitySchema"

const descriptor: PersistDescriptor<"text", "provided", "name"> = {
  columnName: "name",
  storageKind: "text",
  valueStrategy: "provided"
}
console.log(descriptor.storageKind)
```

**Signature**

```ts
type PersistDescriptor<TStorageKind, TValueStrategy, TColumnName, TIndexHints> = TStorageKind extends StorageKind
  ? TValueStrategy extends PersistStrategy
    ? PersistDescriptorShape<TStorageKind, TValueStrategy, TColumnName, TIndexHints>
    : never
  : never
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L333)

Since v0.0.0

## PersistDescriptor (namespace)

Companion types for `PersistDescriptor`.

**Example**

```ts
import type { PersistDescriptor } from "@beep/schema/EntitySchema"

declare const descriptor: PersistDescriptor.Any
console.log(descriptor.storageKind)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L358)

Since v0.0.0

### Any (type alias)

Any persistence descriptor value.

**Signature**

```ts
type Any = {
    readonly columnName?: string;
    readonly indexHints?: ReadonlyArray<IndexHint>;
    readonly storageKind: StorageKind;
    readonly valueStrategy: PersistStrategy;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L365)

Since v0.0.0

## PersistDescriptorByValueStrategy (type alias)

Persistence descriptor narrowed by storage kind and value strategy.

**Example**

```ts
import type { PersistDescriptorByValueStrategy } from "@beep/schema/EntitySchema"

type ProvidedText = PersistDescriptorByValueStrategy<{
  readonly storageKind: "text"
  readonly valueStrategy: "provided"
}>
console.log({} as { descriptor: ProvidedText })
```

**Signature**

```ts
type PersistDescriptorByValueStrategy<Descriptor> = Descriptor extends unknown
    ? {
        readonly [Kind in Descriptor["storageKind"]]: {
          readonly [Strategy in Descriptor["valueStrategy"]]: Descriptor & {
            readonly storageKind: Kind;
            readonly valueStrategy: Strategy;
          };
        }[Descriptor["valueStrategy"]];
      }[Descriptor["storageKind"]]
    : never
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L440)

Since v0.0.0

## PersistDescriptorFor (type alias)

Persistence descriptor type permitted for one schema field.

**Example**

```ts
import * as S from "effect/Schema"
import type { PersistDescriptorFor } from "@beep/schema/EntitySchema"

type TextDescriptor = PersistDescriptorFor<typeof S.String>
console.log({} as { descriptor: TextDescriptor })
```

**Signature**

```ts
type PersistDescriptorFor<Schema> = Schema["~encoded.optionality"] extends "optional"
  ? never
  : [S.Codec.DecodingServices<Schema>] extends [never]
    ? [S.Codec.EncodingServices<Schema>] extends [never]
      ? PersistDescriptorForEncoded<S.Codec.Encoded<Schema>>
      : never
    : never
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L517)

Since v0.0.0

## PersistDescriptorForInput (type alias)

Persistence descriptor type permitted for one entity field input.

**Example**

```ts
import type { EntityFieldInput, PersistDescriptorForInput } from "@beep/schema/EntitySchema"

type Descriptor = PersistDescriptorForInput<EntityFieldInput>
console.log({} as { descriptor: Descriptor })
```

**Signature**

```ts
type PersistDescriptorForInput<Field> = PersistDescriptorFor<SelectedFieldOf<Field>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L539)

Since v0.0.0

## PersistOptions (type alias)

Options accepted by persistence descriptor constructors.

**Example**

```ts
import { IndexHint } from "@beep/schema/EntitySchema"
import type { PersistOptions } from "@beep/schema/EntitySchema"

const options: PersistOptions<"provided", "user_id", readonly [typeof IndexHint.unique]> = {
  columnName: "user_id",
  indexHints: [IndexHint.unique],
  valueStrategy: "provided"
}
console.log(options.columnName)
```

**Signature**

```ts
type PersistOptions<Strategy, ColumnName, IndexHints> = {
  readonly columnName?: ColumnName;
  readonly indexHints?: IndexHints;
  readonly valueStrategy?: Strategy;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L282)

Since v0.0.0

## PersistStrategy

Compatibility alias for lifecycle strategy.

**Example**

```ts
import { PersistStrategy } from "@beep/schema/EntitySchema"

console.log(PersistStrategy.ast)
```

**Signature**

```ts
declare const PersistStrategy: AnnotatedSchema<LiteralKit<readonly ["computedByService", "defaultedOnInsert", "derived", "generatedOnInsert", "incrementedOnWrite", "provided", "providedByContext", "updatedOnWrite"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L115)

Since v0.0.0

## PersistStrategy (type alias)

Runtime type for `PersistStrategy`.

**Example**

```ts
import type { PersistStrategy } from "@beep/schema/EntitySchema"

const strategy: PersistStrategy = "provided"
console.log(strategy)
```

**Signature**

```ts
type PersistStrategy = ValueStrategy
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L131)

Since v0.0.0

## PersistedFor (type alias)

Exact persisted descriptor map permitted for a field map.

**Example**

```ts
import type { EntityFieldInputs, PersistedFor } from "@beep/schema/EntitySchema"

type Persisted = PersistedFor<EntityFieldInputs>
console.log({} as { persisted: Persisted })
```

**Signature**

```ts
type PersistedFor<FieldMap> = {
  readonly [K in keyof FieldMap]: PersistDescriptorForInput<FieldMap[K]>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L555)

Since v0.0.0

## PersistedMap (type alias)

Any persisted descriptor map.

**Example**

```ts
import type { PersistedMap } from "@beep/schema/EntitySchema"

const persisted: PersistedMap = {
  name: { storageKind: "text", valueStrategy: "provided" }
}
console.log(persisted.name?.storageKind)
```

**Signature**

```ts
type PersistedMap = Readonly<Record<string, PersistDescriptor>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L575)

Since v0.0.0

## StorageKind (type alias)

Runtime type for `StorageKind`.

**Example**

```ts
import type { StorageKind } from "@beep/schema/EntitySchema"

const kind: StorageKind = "text"
console.log(kind)
```

**Signature**

```ts
type StorageKind = typeof StorageKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L56)

Since v0.0.0

## ValueStrategy (type alias)

Runtime type for `ValueStrategy`.

**Example**

```ts
import type { ValueStrategy } from "@beep/schema/EntitySchema"

const strategy: ValueStrategy = "provided"
console.log(strategy)
```

**Signature**

```ts
type ValueStrategy = typeof ValueStrategy.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L100)

Since v0.0.0

# schemas

## EncodedAbsenceKind

Encoded absence classification for a field.

**Example**

```ts
import { EncodedAbsenceKind } from "@beep/schema/EntitySchema"

console.log(EncodedAbsenceKind.ast)
```

**Signature**

```ts
declare const EncodedAbsenceKind: AnnotatedSchema<LiteralKit<readonly ["required", "nullable", "undefined", "nullish", "optionalKey", "optionalNullable", "optionalUndefined", "optionalNullish", "ambiguous"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L231)

Since v0.0.0

## IndexHint

Storage-neutral index hint values and schema.

**Example**

```ts
import { IndexHint } from "@beep/schema/EntitySchema"

console.log(IndexHint.unique)
```

**Signature**

```ts
declare const IndexHint: { readonly members: readonly [S.Struct<{ readonly kind: S.tag<"btree">; }> & { readonly Type: { readonly kind: "btree"; }; }, S.Struct<{ readonly kind: S.tag<"gin">; }> & { readonly Type: { readonly kind: "gin"; }; }, S.Struct<{ readonly kind: S.tag<"hash">; }> & { readonly Type: { readonly kind: "hash"; }; }, S.Struct<{ readonly kind: S.tag<"lookup">; }> & { readonly Type: { readonly kind: "lookup"; }; }, S.Struct<{ readonly kind: S.tag<"unique">; }> & { readonly Type: { readonly kind: "unique"; }; }]; mapMembers: <To extends ReadonlyArray<S.Top>>(f: (members: readonly [S.Struct<{ readonly kind: S.tag<"btree">; }> & { readonly Type: { readonly kind: "btree"; }; }, S.Struct<{ readonly kind: S.tag<"gin">; }> & { readonly Type: { readonly kind: "gin"; }; }, S.Struct<{ readonly kind: S.tag<"hash">; }> & { readonly Type: { readonly kind: "hash"; }; }, S.Struct<{ readonly kind: S.tag<"lookup">; }> & { readonly Type: { readonly kind: "lookup"; }; }, S.Struct<{ readonly kind: S.tag<"unique">; }> & { readonly Type: { readonly kind: "unique"; }; }]) => To, options?: { readonly unsafePreserveChecks?: boolean | undefined; } | undefined) => S.Union<{ [K in keyof Readonly<To>]: Readonly<To>[K]; }>; readonly Rebuild: S.Union<readonly [S.Struct<{ readonly kind: S.tag<"btree">; }> & { readonly Type: { readonly kind: "btree"; }; }, S.Struct<{ readonly kind: S.tag<"gin">; }> & { readonly Type: { readonly kind: "gin"; }; }, S.Struct<{ readonly kind: S.tag<"hash">; }> & { readonly Type: { readonly kind: "hash"; }; }, S.Struct<{ readonly kind: S.tag<"lookup">; }> & { readonly Type: { readonly kind: "lookup"; }; }, S.Struct<{ readonly kind: S.tag<"unique">; }> & { readonly Type: { readonly kind: "unique"; }; }]>; readonly Iso: { readonly kind: "btree"; } | { readonly kind: "gin"; } | { readonly kind: "hash"; } | { readonly kind: "lookup"; } | { readonly kind: "unique"; }; readonly ast: Union<Objects>; readonly "~type.parameters": readonly []; readonly Type: ({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; }); readonly Encoded: { readonly kind: "btree"; } | { readonly kind: "gin"; } | { readonly kind: "hash"; } | { readonly kind: "lookup"; } | { readonly kind: "unique"; }; readonly DecodingServices: never; readonly EncodingServices: never; readonly "~type.make.in": { readonly kind?: "btree" | undefined; } | { readonly kind?: "gin" | undefined; } | { readonly kind?: "hash" | undefined; } | { readonly kind?: "lookup" | undefined; } | { readonly kind?: "unique" | undefined; }; readonly "~type.make": { readonly kind?: "btree" | undefined; } | { readonly kind?: "gin" | undefined; } | { readonly kind?: "hash" | undefined; } | { readonly kind?: "lookup" | undefined; } | { readonly kind?: "unique" | undefined; }; readonly "~type.constructor.default": "no-default"; readonly "~type.mutability": "readonly"; readonly "~type.optionality": "required"; readonly "~encoded.mutability": "readonly"; readonly "~encoded.optionality": "required"; annotate: (annotations: S.Annotations.Bottom<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; }), readonly []>) => S.Union<readonly [S.Struct<{ readonly kind: S.tag<"btree">; }> & { readonly Type: { readonly kind: "btree"; }; }, S.Struct<{ readonly kind: S.tag<"gin">; }> & { readonly Type: { readonly kind: "gin"; }; }, S.Struct<{ readonly kind: S.tag<"hash">; }> & { readonly Type: { readonly kind: "hash"; }; }, S.Struct<{ readonly kind: S.tag<"lookup">; }> & { readonly Type: { readonly kind: "lookup"; }; }, S.Struct<{ readonly kind: S.tag<"unique">; }> & { readonly Type: { readonly kind: "unique"; }; }]>; annotateKey: (annotations: S.Annotations.Key<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })>) => S.Union<readonly [S.Struct<{ readonly kind: S.tag<"btree">; }> & { readonly Type: { readonly kind: "btree"; }; }, S.Struct<{ readonly kind: S.tag<"gin">; }> & { readonly Type: { readonly kind: "gin"; }; }, S.Struct<{ readonly kind: S.tag<"hash">; }> & { readonly Type: { readonly kind: "hash"; }; }, S.Struct<{ readonly kind: S.tag<"lookup">; }> & { readonly Type: { readonly kind: "lookup"; }; }, S.Struct<{ readonly kind: S.tag<"unique">; }> & { readonly Type: { readonly kind: "unique"; }; }]>; check: (checks_0: Check<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })>, ...checks: Array<Check<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })>>) => S.Union<readonly [S.Struct<{ readonly kind: S.tag<"btree">; }> & { readonly Type: { readonly kind: "btree"; }; }, S.Struct<{ readonly kind: S.tag<"gin">; }> & { readonly Type: { readonly kind: "gin"; }; }, S.Struct<{ readonly kind: S.tag<"hash">; }> & { readonly Type: { readonly kind: "hash"; }; }, S.Struct<{ readonly kind: S.tag<"lookup">; }> & { readonly Type: { readonly kind: "lookup"; }; }, S.Struct<{ readonly kind: S.tag<"unique">; }> & { readonly Type: { readonly kind: "unique"; }; }]>; rebuild: (ast: Union<Objects>) => S.Union<readonly [S.Struct<{ readonly kind: S.tag<"btree">; }> & { readonly Type: { readonly kind: "btree"; }; }, S.Struct<{ readonly kind: S.tag<"gin">; }> & { readonly Type: { readonly kind: "gin"; }; }, S.Struct<{ readonly kind: S.tag<"hash">; }> & { readonly Type: { readonly kind: "hash"; }; }, S.Struct<{ readonly kind: S.tag<"lookup">; }> & { readonly Type: { readonly kind: "lookup"; }; }, S.Struct<{ readonly kind: S.tag<"unique">; }> & { readonly Type: { readonly kind: "unique"; }; }]>; make: (input: { readonly kind?: "btree" | undefined; } | { readonly kind?: "gin" | undefined; } | { readonly kind?: "hash" | undefined; } | { readonly kind?: "lookup" | undefined; } | { readonly kind?: "unique" | undefined; }, options?: S.MakeOptions) => ({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; }); makeOption: (input: { readonly kind?: "btree" | undefined; } | { readonly kind?: "gin" | undefined; } | { readonly kind?: "hash" | undefined; } | { readonly kind?: "lookup" | undefined; } | { readonly kind?: "unique" | undefined; }, options?: S.MakeOptions) => Option<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })>; makeEffect: (input: { readonly kind?: "btree" | undefined; } | { readonly kind?: "gin" | undefined; } | { readonly kind?: "hash" | undefined; } | { readonly kind?: "lookup" | undefined; } | { readonly kind?: "unique" | undefined; }, options?: S.MakeOptions) => Effect<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; }), S.SchemaError, never>; readonly "~effect/Schema/Schema": "~effect/Schema/Schema"; pipe: { <A>(this: A): A; <A, B = never>(this: A, ab: (_: A) => B): B; <A, B = never, C = never>(this: A, ab: (_: A) => B, bc: (_: B) => C): C; <A, B = never, C = never, D = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D): D; <A, B = never, C = never, D = never, E = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E): E; <A, B = never, C = never, D = never, E = never, F = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F): F; <A, B = never, C = never, D = never, E = never, F = never, G = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G): G; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H): H; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I): I; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J): J; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K): K; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L): L; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M): M; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N): N; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O): O; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P): P; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never, Q = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P, pq: (_: P) => Q): Q; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never, Q = never, R = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P, pq: (_: P) => Q, qr: (_: Q) => R): R; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never, Q = never, R = never, S = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P, pq: (_: P) => Q, qr: (_: Q) => R, rs: (_: R) => S): S; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never, Q = never, R = never, S = never, T = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P, pq: (_: P) => Q, qr: (_: Q) => R, rs: (_: R) => S, st: (_: S) => T): T; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never, Q = never, R = never, S = never, T = never, U = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P, pq: (_: P) => Q, qr: (_: Q) => R, rs: (_: R) => S, st: (_: S) => T, tu: (_: T) => U): U; <A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never, Q = never, R = never, S = never, T = never, U = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P, pq: (_: P) => Q, qr: (_: Q) => R, rs: (_: R) => S, st: (_: S) => T, tu: (_: T) => U): U; }; readonly cases: { btree: S.Struct<{ readonly kind: S.tag<"btree">; }> & { readonly Type: { readonly kind: "btree"; }; }; gin: S.Struct<{ readonly kind: S.tag<"gin">; }> & { readonly Type: { readonly kind: "gin"; }; }; hash: S.Struct<{ readonly kind: S.tag<"hash">; }> & { readonly Type: { readonly kind: "hash"; }; }; lookup: S.Struct<{ readonly kind: S.tag<"lookup">; }> & { readonly Type: { readonly kind: "lookup"; }; }; unique: S.Struct<{ readonly kind: S.tag<"unique">; }> & { readonly Type: { readonly kind: "unique"; }; }; }; readonly match: { <Cases extends { btree: (value: { readonly kind: "btree"; } & { readonly kind: "btree"; }) => any; gin: (value: { readonly kind: "gin"; } & { readonly kind: "gin"; }) => any; hash: (value: { readonly kind: "hash"; } & { readonly kind: "hash"; }) => any; lookup: (value: { readonly kind: "lookup"; } & { readonly kind: "lookup"; }) => any; unique: (value: { readonly kind: "unique"; } & { readonly kind: "unique"; }) => any; }>(value: ({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; }), cases: Cases): Cases[keyof Cases] extends (value: any) => infer R ? Unify<R> : never; <Cases extends { btree: (value: { readonly kind: "btree"; } & { readonly kind: "btree"; }) => any; gin: (value: { readonly kind: "gin"; } & { readonly kind: "gin"; }) => any; hash: (value: { readonly kind: "hash"; } & { readonly kind: "hash"; }) => any; lookup: (value: { readonly kind: "lookup"; } & { readonly kind: "lookup"; }) => any; unique: (value: { readonly kind: "unique"; } & { readonly kind: "unique"; }) => any; }>(cases: Cases): (value: ({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })) => Cases[keyof Cases] extends (value: any) => infer R ? Unify<R> : never; }; readonly isAnyOf: <const Keys>(keys: ReadonlyArray<Keys>) => (value: ({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })) => value is never; readonly guards: { btree: (u: unknown) => u is { readonly kind: "btree"; } & { readonly kind: "btree"; }; gin: (u: unknown) => u is { readonly kind: "gin"; } & { readonly kind: "gin"; }; hash: (u: unknown) => u is { readonly kind: "hash"; } & { readonly kind: "hash"; }; lookup: (u: unknown) => u is { readonly kind: "lookup"; } & { readonly kind: "lookup"; }; unique: (u: unknown) => u is { readonly kind: "unique"; } & { readonly kind: "unique"; }; }; btree: { readonly kind: "btree"; }; gin: { readonly kind: "gin"; }; hash: { readonly kind: "hash"; }; lookup: { readonly kind: "lookup"; }; unique: { readonly kind: "unique"; }; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L193)

Since v0.0.0

## IndexHintKind

Storage-neutral index hint kind.

**Example**

```ts
import { IndexHintKind } from "@beep/schema/EntitySchema"

console.log(IndexHintKind.ast)
```

**Signature**

```ts
declare const IndexHintKind: AnnotatedSchema<LiteralKit<readonly ["btree", "gin", "hash", "lookup", "unique"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L146)

Since v0.0.0

## PersistDescriptor

Schema-backed discriminated persistence descriptor.

**Example**

```ts
import { PersistDescriptor } from "@beep/schema/EntitySchema"

console.log(PersistDescriptor.cases.text.ast)
```

**Signature**

```ts
declare const PersistDescriptor: S.Decoder<PersistDescriptor.Any, never> & PersistDescriptorStatics
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L414)

Since v0.0.0

## StorageKind

Physical storage kind projected by table adapters.

**Example**

```ts
import { StorageKind } from "@beep/schema/EntitySchema"

console.log(StorageKind.ast)
```

**Signature**

```ts
declare const StorageKind: AnnotatedSchema<LiteralKit<readonly ["blob", "bool", "entityId", "int", "jsonb", "literal", "text", "timestampDate", "timestampMillis"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L26)

Since v0.0.0

## ValueStrategy

Lifecycle strategy for a persisted field.

**Example**

```ts
import { ValueStrategy } from "@beep/schema/EntitySchema"

console.log(ValueStrategy.ast)
```

**Signature**

```ts
declare const ValueStrategy: AnnotatedSchema<LiteralKit<readonly ["computedByService", "defaultedOnInsert", "derived", "generatedOnInsert", "incrementedOnWrite", "provided", "providedByContext", "updatedOnWrite"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.persist.ts#L71)

Since v0.0.0