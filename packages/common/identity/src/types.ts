/**
 * Type helpers for the `@beep/identity` builders and schema annotations.
 *
 * @example
 * import type * as Identity from "@beep/identity/types";
 *
 * type SchemaSymbol = Identity.IdentitySymbol<"@beep/schema/entities/Tenant">;
 *
 * @category Identity/Types
 * @since 0.1.0
 */
import type { StringTypes } from "@beep/types";
import type * as Schema from "effect/Schema";
import type * as AST from "effect/SchemaAST";

/**
 * Valid namespace segment used when composing identity strings.
 *
 * Rejects the "/" character at the type-level, which keeps literal type safety intact
 * while still allowing dynamic `string` segments when necessary.
 *
 * @example
 * import type * as Identity from "@beep/identity/types";
 *
 * type SchemaSegment = Identity.Segment<"schema">;
 *
 * @example
 * // ❌ The following line fails to compile
 * // type InvalidSegment = Identity.Segment<"schema/v1">;
 *
 * @category Identity/Types
 * @since 0.1.0
 */
export type SegmentValue<S extends StringTypes.NonEmptyString> = S extends `/${string}`
  ? never
  : S extends `${string}/`
    ? never
    : S;

/**
 * Shorthand alias for `SegmentValue` so builders can stay ergonomic.
 *
 * @example
 * import type * as Identity from "@beep/identity/types";
 *
 * type SchemaSegment = Identity.Segment<"schema">;
 *
 * @category Identity/Types
 * @since 0.1.0
 */
export type Segment<S extends StringTypes.NonEmptyString = StringTypes.NonEmptyString> = SegmentValue<S>;

/**
 * Branded string that marks the value as an identity while preserving the literal.
 *
 * @example
 * import type * as Identity from "@beep/identity/types";
 *
 * type PasskeyId = Identity.IdentityString<"@beep/iam-sdk/clients/passkey">;
 *
 * @category Identity/Types
 * @since 0.1.0
 */
export type IdentityString<Value extends string> = Value & {
  readonly __brand: unique symbol;
};

/**
 * Symbol returned by the identity builder to keep TypeId/service tokens stable.
 *
 * @example
 * import type * as Identity from "@beep/identity/types";
 *
 * type RepoSymbol = Identity.IdentitySymbol<"@beep/iam-infra/repos/UserRepo">;
 *
 * @category Identity/Types
 * @since 0.1.0
 */
export type IdentitySymbol<Value extends string> = symbol & {
  readonly description: Value;
};

/**
 * Additional JSON Schema annotations that can be merged into identity metadata.
 *
 * @example
 * import type * as Identity from "@beep/identity/types";
 *
 * const extras: Identity.SchemaAnnotationExtras<{ readonly example: true }> = {};
 *
 * @category Identity/Annotations
 * @since 0.1.0
 */
export type SchemaAnnotationExtras<A> = Schema.Annotations.GenericSchema<A>;

/**
 * Identity annotations enriched with schema extras returned by `BeepId.annotations`.
 *
 * @example
 * import type * as Identity from "@beep/identity/types";
 * import * as Packages from "@beep/identity/packages";
 *
 * const extras: Identity.SchemaAnnotationExtras<{ readonly version: 1 }> = {};
 *
 * const annotatedSchema: Identity.IdentityAnnotationResult<
 *   "@beep/schema/annotations/PasskeyAddPayload",
 *   "PasskeyAddPayload",
 *   { readonly version: 1 }
 * > = Packages.SchemaId.compose("annotations").annotations("PasskeyAddPayload", extras);
 *
 * @category Identity/Annotations
 * @since 0.1.0
 */
export type IdentityAnnotationResult<Value extends string, Identifier extends string, SchemaType> = IdentityAnnotation<
  Value,
  Identifier
> &
  SchemaAnnotationExtras<SchemaType>;

type InvalidModuleChar =
  | "/"
  | "\\\\"
  | "."
  | ":"
  | ";"
  | ","
  | "'"
  | '"'
  | "["
  | "]"
  | "{"
  | "}"
  | "("
  | ")"
  | "@"
  | "#"
  | "$"
  | "%"
  | "^"
  | "&"
  | "*"
  | "+"
  | "="
  | "!"
  | "~"
  | "|"
  | "?"
  | "<"
  | ">"
  | " "
  | "\t"
  | "\n"
  | "\r";

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type PascalCaseWord<Word extends string> = Word extends "" ? "" : Capitalize<Lowercase<Word>>;

type PascalCaseValue<Value extends string> = Value extends `${infer Head}-${infer Tail}`
  ? `${PascalCaseWord<Head>}${PascalCaseValue<Tail>}`
  : Value extends `${infer Head}_${infer Tail}`
    ? `${PascalCaseWord<Head>}${PascalCaseValue<Tail>}`
    : PascalCaseWord<Value>;

export type ModuleSegmentValue<S extends StringTypes.NonEmptyString> = S extends `${Digit}${string}`
  ? never
  : S extends `-${string}`
    ? never
    : S extends `_${string}`
      ? never
      : S extends `${string}${InvalidModuleChar}${string}`
        ? never
        : SegmentValue<S>;

export type ModuleAccessor<S extends StringTypes.NonEmptyString> = `${PascalCaseValue<ModuleSegmentValue<S>>}Id`;

export type ModuleRecord<
  Value extends string,
  Segments extends ReadonlyArray<StringTypes.NonEmptyString>,
> = Segments extends readonly [
  infer Head extends StringTypes.NonEmptyString,
  ...infer Tail extends ReadonlyArray<StringTypes.NonEmptyString>,
]
  ? {
      readonly [Key in ModuleAccessor<Head>]: IdentityComposer<`${Value}/${ModuleSegmentValue<Head>}`>;
    } & ModuleRecord<Value, Tail>
  : {};

/**
 * Immutable builder returned by `BeepId` that keeps literal identity values intact.
 *
 * @example
 * import type * as Identity from "@beep/identity/types";
 * import * as BeepId from "@beep/identity/BeepId";
 *
 * const schemaComposer: Identity.IdentityComposer<"@beep/schema"> = BeepId.BeepId.package("schema");
 * const payloadId = schemaComposer.compose("annotations").make("PasskeyAddPayload");
 *
 * @category Identity/Builder
 * @since 0.1.0
 */
export interface IdentityComposer<Value extends string> {
  readonly value: IdentityString<Value>;
  readonly identifier: IdentityString<Value>;
  compose<Next extends StringTypes.NonEmptyString>(
    segment: SegmentValue<Next>
  ): IdentityComposer<`${Value}/${SegmentValue<Next>}`>;
  make<Next extends StringTypes.NonEmptyString>(
    segment: SegmentValue<Next>
  ): IdentityString<`${Value}/${SegmentValue<Next>}`>;
  string(): IdentityString<Value>;
  symbol(): IdentitySymbol<Value>;
  annotations<SchemaType = unknown, Next extends StringTypes.NonEmptyString = StringTypes.NonEmptyString>(
    identifier: SegmentValue<Next>,
    extras?: SchemaAnnotationExtras<SchemaType>
  ): IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, SchemaType>;
  module<
    const Segments extends readonly [
      ModuleSegmentValue<StringTypes.NonEmptyString>,
      ...ModuleSegmentValue<StringTypes.NonEmptyString>[],
    ],
  >(...segments: Segments): ModuleRecord<Value, Segments>;
}

/**
 * Tuple of namespace segments (`["schema", "annotations"]`).
 *
 * @example
 * import type * as Identity from "@beep/identity/types";
 *
 * type SchemaPath = Identity.SegmentTuple;
 *
 * @category Identity/Types
 * @since 0.1.0
 */
export type SegmentTuple = readonly [Segment, ...Segment[]];

type JoinSegments<Parts extends readonly [string, ...string[]]> = Parts extends readonly [infer Head extends string]
  ? Head
  : Parts extends readonly [infer Head extends string, ...infer Tail extends readonly [string, ...string[]]]
    ? `${Head}/${JoinSegments<Tail>}`
    : never;

/**
 * Final literal computed from the tuple passed to `BeepId.package`.
 *
 * @example
 * import type * as Identity from "@beep/identity/types";
 *
 * type SchemaAnnotations = Identity.PackagePath<["schema", "annotations"]>;
 *
 * @category Identity/Types
 * @since 0.1.0
 */
export type PackagePath<Segments extends SegmentTuple> = `@beep/${JoinSegments<Segments>}`;

/**
 * Base annotation object for schema/service descriptors.
 *
 * @example
 * import type * as Identity from "@beep/identity/types";
 * import * as Packages from "@beep/identity/packages";
 *
 * const annotation: Identity.IdentityAnnotation<"@beep/schema/Example", "Example"> = {
 *   ...Packages.SchemaId.annotations("Example"),
 * };
 *
 * @category Identity/Annotations
 * @since 0.1.0
 */
export interface IdentityAnnotation<Value extends string, Identifier extends string> extends AST.Annotations {
  readonly schemaId: IdentitySymbol<Value>;
  readonly identifier: Identifier;
  readonly title: string;
}
