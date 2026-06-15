---
title: Id.ts
nav_order: 1
parent: "@beep/identity"
---

## Id.ts overview

Hierarchical identity system for the `@beep` namespace.

Provides composable, type-safe identity strings and symbols for schema
annotations, error tagging, and service identification throughout the
Effect codebase. Identities follow a `@beep/{package}/{path}` convention
and are validated at construction time.

**Example**

```ts
```typescript
import { make } from "@beep/identity"

// Create a package-level identity composer
const { $MyPkgId } = make("my-pkg")

// Derive child identifiers for schemas and services
const userId = $MyPkgId.make("UserId")
const sym = $MyPkgId.symbol()

console.log(userId)// "@beep/my-pkg/UserId"
console.log(sym)// Symbol.for("@beep/my-pkg")
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [make](#make)
- [error-handling](#error-handling)
  - [IdentityInterpolationError (class)](#identityinterpolationerror-class)
  - [IdentitySegmentCountError (class)](#identitysegmentcounterror-class)
- [models](#models)
  - [HttpAnnotationExtras (type alias)](#httpannotationextras-type-alias)
  - [HttpApiEncoding (type alias)](#httpapiencoding-type-alias)
  - [IdentityAnnotation (type alias)](#identityannotation-type-alias)
  - [IdentityAnnotationResult (type alias)](#identityannotationresult-type-alias)
  - [IdentityAnyAnnotationExtras (type alias)](#identityanyannotationextras-type-alias)
  - [IdentityComposer (interface)](#identitycomposer-interface)
  - [IdentityString (type alias)](#identitystring-type-alias)
  - [IdentitySymbol (type alias)](#identitysymbol-type-alias)
  - [KeyAnnotationExtras (type alias)](#keyannotationextras-type-alias)
  - [ModuleAccessor (type alias)](#moduleaccessor-type-alias)
  - [ModuleSegmentValue (type alias)](#modulesegmentvalue-type-alias)
  - [SchemaAnnotationExtras (type alias)](#schemaannotationextras-type-alias)
  - [SegmentValue (type alias)](#segmentvalue-type-alias)
  - [TaggedAccessor (type alias)](#taggedaccessor-type-alias)
  - [TaggedModuleRecord (type alias)](#taggedmodulerecord-type-alias)
  - [TitleFromIdentifier (type alias)](#titlefromidentifier-type-alias)
---

# configuration

## VERSION

Current version of the `@beep/identity` package.

**Example**

```ts
```typescript
import { VERSION } from "@beep/identity"

console.log(VERSION) // "0.0.0"
```
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L181)

Since v0.0.0

# constructors

## make

Create a root identity composer for a `@beep` package namespace.

Accepts a base string (with or without the `@beep/` prefix) and returns
a record containing a single `$`-prefixed PascalCase accessor mapped to
the root `IdentityComposer` for that package.

**Example**

```ts
```typescript
import { make } from "@beep/identity"

// Bare name -- "@beep/" prefix is added automatically
const { $MyPkgId } = make("my-pkg")
const id = $MyPkgId.make("Service")
console.log(id)// "@beep/my-pkg/Service"
```
```

**Example**

```ts
```typescript
import { make } from "@beep/identity"

// Full scoped name works too
const { $UtilsId } = make("@beep/utils")
const sym = $UtilsId.symbol()
console.log(sym)// Symbol.for("@beep/utils")
```
```

**Signature**

```ts
declare const make: <const Base extends TString.NonEmpty>(base: Base) => MakeReturn<Base>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L1212)

Since v0.0.0

# error-handling

## IdentityInterpolationError (class)

Error thrown when an identity template tag receives interpolation values.

Identity template tags must be called with a single static string literal,
for example by calling the `$I` template tag with a static segment.
Passing interpolated expressions is forbidden because identity strings
must be statically deterministic.

**Example**

```ts
```typescript
import { make, IdentityInterpolationError } from "@beep/identity"

const { $MyPkgId } = make("my-pkg")

try {
  $MyPkgId`User${"Name"}`
} catch (error) {
  console.log(error instanceof IdentityInterpolationError)
}
```
```

**Signature**

```ts
declare class IdentityInterpolationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L116)

Since v0.0.0

## IdentitySegmentCountError (class)

Error thrown when an identity template tag receives more or fewer than one literal segment.

Template tags must be called with exactly one static string segment.

**Example**

```ts
```typescript
import { IdentitySegmentCountError } from "@beep/identity"

const error = IdentitySegmentCountError.make()
console.log(error.message) // "Identity template tags must use a single literal segment."
```
```

**Signature**

```ts
declare class IdentitySegmentCountError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L147)

Since v0.0.0

# models

## HttpAnnotationExtras (type alias)

Annotation fields accepted by `annoteHttp`, extending schema extras with HTTP API metadata.

Supports optional `httpApiStatus` and `~httpApiEncoding` for Effect HTTP API annotations.

**Example**

```ts
```typescript
import type { HttpAnnotationExtras } from "@beep/identity"

type Extras = HttpAnnotationExtras<string>
```
```

**Signature**

```ts
type HttpAnnotationExtras<SchemaType, TypeParameters> = SchemaAnnotationExtras<SchemaType, TypeParameters> & {
  readonly httpApiStatus?: number | undefined;
  readonly "~httpApiEncoding"?: HttpApiEncoding | undefined;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L478)

Since v0.0.0

## HttpApiEncoding (type alias)

Mirrors the raw HTTP encoding annotation shape used by Effect's HttpApiSchema.

The installed `effect@4.0.0-beta.28` runtime supports `~httpApiEncoding`, but
its published `.d.ts` does not currently export the upstream `Encoding` alias.

**Example**

```ts
```typescript
import type { HttpApiEncoding } from "@beep/identity"

const enc: HttpApiEncoding = { _tag: "Json", contentType: "application/json" }
```
```

**Signature**

```ts
type HttpApiEncoding = | {
      readonly _tag: "Multipart";
      readonly mode: "buffered" | "stream";
      readonly contentType: string;
      readonly limits?: Multipart_.withLimits.Options | undefined;
    }
  | {
      readonly _tag: "Json" | "FormUrlEncoded" | "Uint8Array" | "Text";
      readonly contentType: string;
    }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L451)

Since v0.0.0

## IdentityAnnotation (type alias)

Fully resolved identity annotation record applied to Effect schemas.

Contains an `identifier` string, an interned `schemaId` symbol, and a
human-readable `title` derived from the identifier.

**Example**

```ts
```typescript
import type { IdentityAnnotation } from "@beep/identity"

type Ann = IdentityAnnotation<"@beep/utils/User", "User">
```
```

**Signature**

```ts
type IdentityAnnotation<Value, Identifier> = S.Annotations.Annotations & {
  readonly identifier: Identifier;
  readonly schemaId: IdentitySymbol<Value>;
  readonly title: TitleFromIdentifier<Identifier>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L522)

Since v0.0.0

## IdentityAnnotationResult (type alias)

Result of calling `annote` -- the identity annotation merged with any caller-supplied extras,
with identity metadata keys taking precedence.

**Example**

```ts
```typescript
import type { IdentityAnnotationResult } from "@beep/identity"

type Result = IdentityAnnotationResult<"@beep/utils/User", "User">
```
```

**Signature**

```ts
type IdentityAnnotationResult<Value, Identifier, Extras> = IdentityAnnotation<Value, Identifier> & Omit<Extras, IdentityAnnotationMetadataKeys>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L544)

Since v0.0.0

## IdentityAnyAnnotationExtras (type alias)

Union of all annotation extras accepted by the `annote` family of helpers.

Combines key-level and HTTP-level annotation fields into a single constraint.

**Example**

```ts
```typescript
import type { IdentityAnyAnnotationExtras } from "@beep/identity"

type Extras = IdentityAnyAnnotationExtras<string>
```
```

**Signature**

```ts
type IdentityAnyAnnotationExtras<SchemaType, TypeParameters> = KeyAnnotationExtras<SchemaType> & HttpAnnotationExtras<SchemaType, TypeParameters>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L501)

Since v0.0.0

## IdentityComposer (interface)

Composable identity builder for constructing hierarchical `@beep/` identity paths.

An `IdentityComposer` holds a current identity path and provides methods to:
- Extend the path with child segments (`create`, `make`, template tag)
- Produce annotation records for Effect schemas (`annote`, `annoteSchema`, `annoteHttp`, `annoteKey`)
- Batch-create named child composers (`compose`)

**Example**

```ts
```typescript
import { make } from "@beep/identity"

// Create a root composer for "my-pkg"
const { $MyPkgId } = make("my-pkg")

// Template tag: derive a child identity string
const serviceId = $MyPkgId`UserService`
console.log(serviceId)// "@beep/my-pkg/UserService"

// make: one-shot string creation
const modelId = $MyPkgId.make("UserModel")
console.log(modelId)// "@beep/my-pkg/UserModel"

// create: derive a child composer for further nesting
const sub = $MyPkgId.create("domain")
const nested = sub.make("Entity")
console.log(nested)// "@beep/my-pkg/domain/Entity"

// compose: batch-create tagged child composers
const modules = $MyPkgId.compose("auth", "billing")
const authId = modules.$AuthId.make("Session")
console.log(authId)// "@beep/my-pkg/auth/Session"

// annote: produce an annotation record for Effect schemas
const annotation = $MyPkgId.annote("UserSchema", {

})
console.log(annotation.identifier)// "UserSchema"
console.log(annotation.title)// "UserSchema"
```
```

**Signature**

```ts
export interface IdentityComposer<Value extends string> {
  /**
   * Produce an identity annotation record for an Effect schema.
   *
   * Returns an object containing `schemaId`, `identifier`, `title`, and any
   * caller-supplied extras. Use this with `S.Class`, `S.TaggedErrorClass`, or
   * similar constructors that accept an annotation record.
   *
   * @example
   * ```typescript
   * import { make } from "@beep/identity"
   *
   * const { $MyPkgId } = make("my-pkg")
   * const ann = $MyPkgId.annote("UserCreated", { description: "A user was created." })
   *
   * console.log(ann.identifier)// "UserCreated"
   * console.log(ann.title)// "UserCreated"
   * console.log(ann.description)// "A user was created."
   * ```
   *
   * @since 0.0.0
   * @category combinators
   */
  annote<
    const Next extends TString.NonEmpty = TString.NonEmpty,
    const Extras extends IdentityAnyAnnotationExtras<unknown> = {},
  >(
    identifier: SegmentValue<Next>,
    extras?: undefined | Extras
  ): IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, Extras>;

  /**
   * Produce a schema annotation function with HTTP API metadata.
   *
   * Returns a function that annotates an Effect schema with identity metadata
   * plus optional `httpApiStatus` and encoding fields.
   *
   * @since 0.0.0
   * @category combinators
   */
  annoteHttp<Schema extends S.Top, const Next extends TString.NonEmpty = TString.NonEmpty>(
    identifier: SegmentValue<Next>,
    extras?: undefined | HttpAnnotationExtras<Schema["Type"]>
  ): (self: Schema) => AnnotatedSchema<Schema>;

  /**
   * Produce a type-safe key annotation function scoped to a parent struct.
   *
   * When called with zero arguments, returns a curried builder that constrains
   * the identifier to valid paths within `Parent`.
   *
   * @since 0.0.0
   * @category combinators
   */
  annoteKey<Parent extends object>(): <
    const Next extends TString.NonEmpty = TString.NonEmpty,
    Schema extends S.Top & { readonly Type: KeyIdentifierValue<Parent, SegmentValue<Next>> } = S.Top & {
      readonly Type: KeyIdentifierValue<Parent, SegmentValue<Next>>;
    },
  >(
    identifier: SegmentValue<Next> & StrictKeyIdentifier<Parent, Next>,
    extras?: undefined | KeyAnnotationExtras<KeyIdentifierValue<Parent, SegmentValue<Next>>>
  ) => (self: Schema) => Schema["Rebuild"];

  /**
   * Produce a key annotation function for an untyped parent.
   *
   * @since 0.0.0
   * @category combinators
   */
  annoteKey(
    identifier: TString.NonEmpty,
    extras?: undefined | KeyAnnotationExtras<unknown>
  ): <Schema extends S.Top>(self: Schema) => Schema["Rebuild"];

  /**
   * Produce a generic schema annotation function.
   *
   * Returns a function that calls `self.annotate(...)` with identity metadata
   * merged with any caller-supplied extras.
   *
   * @since 0.0.0
   * @category combinators
   */
  annoteSchema<Schema extends S.Top, const Next extends TString.NonEmpty = TString.NonEmpty>(
    identifier: SegmentValue<Next>,
    extras?: undefined | S.Annotations.Bottom<Schema["Type"], Schema["~type.parameters"]>
  ): (self: Schema) => AnnotatedSchema<Schema>;

  /**
   * Batch-create child {@link IdentityComposer} instances for multiple module segments.
   *
   * Returns a record whose keys are `$`-prefixed PascalCase accessors (e.g. `$AuthId`)
   * mapped to child composers rooted at `{Value}/{segment}`.
   *
   * @example
   * ```typescript
   * import { make } from "@beep/identity"
   *
   * const { $MyPkgId } = make("my-pkg")
   * const modules = $MyPkgId.compose("auth", "billing")
   *
   * const authId = modules.$AuthId.make("Session")
   * console.log(authId)// "@beep/my-pkg/auth/Session"
   * ```
   *
   * @since 0.0.0
   * @category constructors
   */
  compose<
    const Segments extends readonly [ModuleSegmentValue<TString.NonEmpty>, ...ModuleSegmentValue<TString.NonEmpty>[]],
  >(...segments: Segments): TaggedModuleRecord<Value, Segments>;

  /**
   * Create a child {@link IdentityComposer} for further path extension.
   *
   * Unlike `make` (which returns a plain string), `create` returns a full
   * composer that supports further nesting, annotation, and composition.
   *
   * @example
   * ```typescript
   * import { make } from "@beep/identity"
   *
   * const { $MyPkgId } = make("my-pkg")
   * const sub = $MyPkgId.create("domain")
   * const entityId = sub.make("Entity")
   * console.log(entityId)// "@beep/my-pkg/domain/Entity"
   * ```
   *
   * @since 0.0.0
   * @category constructors
   */
  create<const Next extends TString.NonEmpty>(
    segment: SegmentValue<Next>
  ): IdentityComposer<`${Value}/${SegmentValue<Next>}`>;

  /**
   * The identity string for this composer's current path.
   *
   * @since 0.0.0
   * @category getters
   */
  readonly identifier: IdentityString<Value>;

  /**
   * Create a child identity string by appending one segment.
   *
   * @example
   * ```typescript
   * import { make } from "@beep/identity"
   *
   * const { $MyPkgId } = make("my-pkg")
   * const id = $MyPkgId.make("UserModel")
   * console.log(id)// "@beep/my-pkg/UserModel"
   * ```
   *
   * @since 0.0.0
   * @category constructors
   */
  make<const Next extends TString.NonEmpty>(
    segment: SegmentValue<Next>
  ): IdentityString<`${Value}/${SegmentValue<Next>}`>;

  /**
   * Return this composer's identity as a branded string.
   *
   * @since 0.0.0
   * @category getters
   */
  string(): IdentityString<Value>;

  /**
   * Return this composer's identity as an interned symbol via `Symbol.for`.
   *
   * @since 0.0.0
   * @category getters
   */
  symbol(): IdentitySymbol<Value>;

  /**
   * Alias for {@link identifier}.
   *
   * @since 0.0.0
   * @category getters
   */
  readonly value: IdentityString<Value>;

  /**
   * Template tag call signature for creating child identity strings.
   *
   * Must be called with a single static string literal and no interpolations.
   *
   * @example
   * ```typescript
   * import { make } from "@beep/identity"
   *
   * const { $MyPkgId } = make("my-pkg")
   * const id = $MyPkgId`UserService`
   * console.log(id)// "@beep/my-pkg/UserService"
   * ```
   *
   * @since 0.0.0
   * @category constructors
   */
  (strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>): IdentityString<`${Value}/${string}`>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L625)

Since v0.0.0

## IdentityString (type alias)

Branded string type for identity values, preventing accidental use of raw strings.

**Example**

```ts
```typescript
import type { IdentityString } from "@beep/identity"

declare const id: IdentityString<"@beep/utils/Service">
```
```

**Signature**

```ts
type IdentityString<Value> = Value & {
  readonly __brand: unique symbol;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L378)

Since v0.0.0

## IdentitySymbol (type alias)

Branded symbol type for identity values, created via `Symbol.for` for interning.

**Example**

```ts
```typescript
import type { IdentitySymbol } from "@beep/identity"

declare const sym: IdentitySymbol<"@beep/utils">
```
```

**Signature**

```ts
type IdentitySymbol<Value> = symbol & {
  readonly description: Value;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L395)

Since v0.0.0

## KeyAnnotationExtras (type alias)

Annotation fields accepted by `annoteKey`, mirroring `S.Annotations.Key`.

**Example**

```ts
```typescript
import type { KeyAnnotationExtras } from "@beep/identity"

type Extras = KeyAnnotationExtras<string>
```
```

**Signature**

```ts
type KeyAnnotationExtras<SchemaType> = S.Annotations.Key<SchemaType>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L433)

Since v0.0.0

## ModuleAccessor (type alias)

Derive a PascalCase accessor name suffixed with `Id` from a module segment.

`"my-service"` becomes `"MyServiceId"`.

**Example**

```ts
```typescript
import type { ModuleAccessor } from "@beep/identity"

type Acc = ModuleAccessor<"my-service"> // "MyServiceId"
```
```

**Signature**

```ts
type `${PascalCaseValue<ModuleSegmentValue<S>>}Id` = `${PascalCaseValue<ModuleSegmentValue<S>>}Id`
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L346)

Since v0.0.0

## ModuleSegmentValue (type alias)

Type-level constraint for module-safe identity segments.

In addition to the basic `SegmentValue` rules, module segments must start
with an alphabetic character and contain only alphanumerics, hyphens, or underscores.
Resolves to `never` when violated.

**Example**

```ts
```typescript
import type { ModuleSegmentValue } from "@beep/identity"

type Valid = ModuleSegmentValue<"auth">
type Invalid = ModuleSegmentValue<"1bad">
```
```

**Signature**

```ts
type ModuleSegmentValue<S> = InvalidModulePrefix<S> extends true ? never : HasInvalidModuleChar<S> extends true ? never : SegmentValue<S>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L328)

Since v0.0.0

## SchemaAnnotationExtras (type alias)

Additional schema annotation fields that identity annotation helpers accept.

Mirrors `S.Annotations.Bottom` so callers can supply `description`, `documentation`,
and other Effect Schema annotation keys alongside identity metadata.

**Example**

```ts
```typescript
import type { SchemaAnnotationExtras } from "@beep/identity"

type Extras = SchemaAnnotationExtras<string>
```
```

**Signature**

```ts
type SchemaAnnotationExtras<SchemaType, TypeParameters> = S.Annotations.Bottom<SchemaType, TypeParameters>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L415)

Since v0.0.0

## SegmentValue (type alias)

Type-level constraint ensuring an identity segment does not start or end with a slash.

Resolves to `never` when the segment starts or ends with `/`, preventing
invalid identity paths at compile time.

**Example**

```ts
```typescript
import type { SegmentValue } from "@beep/identity"

type Valid = SegmentValue<"UserService">
type Invalid = SegmentValue<"/leading">
```
```

**Signature**

```ts
type SegmentValue<S> = S extends `/${string}`
  ? never
  : S extends `${string}/`
    ? never
    : S
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L200)

Since v0.0.0

## TaggedAccessor (type alias)

Derive a `$`-prefixed PascalCase accessor key from a module segment.

`"my-service"` becomes `"$MyServiceId"`.

**Example**

```ts
```typescript
import type { TaggedAccessor } from "@beep/identity"

type Tag = TaggedAccessor<"my-service"> // "$MyServiceId"
```
```

**Signature**

```ts
type `$${PascalCaseValue<ModuleSegmentValue<S>>}Id` = `$${ModuleAccessor<S>}`
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L363)

Since v0.0.0

## TaggedModuleRecord (type alias)

Record mapping `$`-prefixed accessor keys to child `IdentityComposer` instances,
produced by calling `compose` with one or more module segment names.

**Example**

```ts
```typescript
import type { TaggedModuleRecord } from "@beep/identity"

type Modules = TaggedModuleRecord<"@beep/pkg", readonly ["auth", "billing"]>
```
```

**Signature**

```ts
type TaggedModuleRecord<Value, Segments> = {
  readonly [K in Segments[number] as TaggedAccessor<K>]: IdentityComposer<`${Value}/${ModuleSegmentValue<K>}`>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L577)

Since v0.0.0

## TitleFromIdentifier (type alias)

Derive a human-readable title from a kebab-case or snake_case identifier.

Converts `"my-service"` to `"My Service"` and `"user_account"` to `"User Account"`.

**Example**

```ts
```typescript
import type { TitleFromIdentifier } from "@beep/identity"

type Title = TitleFromIdentifier<"my-service"> // "My Service"
```
```

**Signature**

```ts
type TitleFromIdentifier<Identifier> = JoinTitleWords<
  SplitTitleWords<TrimTitleSpaces<NormalizeTitleSeparators<Identifier>>>
>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/Id.ts#L288)

Since v0.0.0