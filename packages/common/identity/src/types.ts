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
 * type PasskeyId = Identity.IdentityString<"@beep/iam-client/clients/passkey">;
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
 * type RepoSymbol = Identity.IdentitySymbol<"@beep/iam-server/repos/UserRepo">;
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

/**
 * Non-recursive PascalCase transformation with explicit pattern overloads.
 * Handles up to 4 hyphen/underscore-separated segments with literal type preservation.
 * Falls back to `string` for more complex patterns to avoid TypeScript recursion limits.
 *
 * @internal
 */
type PascalCaseValue<Value extends string> =
  // 4 hyphen segments: a-b-c-d
  Value extends `${infer A}-${infer B}-${infer C}-${infer D}`
    ? `${PascalCaseWord<A>}${PascalCaseWord<B>}${PascalCaseWord<C>}${PascalCaseWord<D>}`
    : // 3 hyphen segments: a-b-c
      Value extends `${infer A}-${infer B}-${infer C}`
      ? `${PascalCaseWord<A>}${PascalCaseWord<B>}${PascalCaseWord<C>}`
      : // 2 hyphen segments: a-b
        Value extends `${infer A}-${infer B}`
        ? `${PascalCaseWord<A>}${PascalCaseWord<B>}`
        : // 4 underscore segments: a_b_c_d
          Value extends `${infer A}_${infer B}_${infer C}_${infer D}`
          ? `${PascalCaseWord<A>}${PascalCaseWord<B>}${PascalCaseWord<C>}${PascalCaseWord<D>}`
          : // 3 underscore segments: a_b_c
            Value extends `${infer A}_${infer B}_${infer C}`
            ? `${PascalCaseWord<A>}${PascalCaseWord<B>}${PascalCaseWord<C>}`
            : // 2 underscore segments: a_b
              Value extends `${infer A}_${infer B}`
              ? `${PascalCaseWord<A>}${PascalCaseWord<B>}`
              : // Single word
                PascalCaseWord<Value>;

/**
 * Pattern that matches invalid module segment prefixes (digit, hyphen, or underscore).
 *
 * @internal
 */
type InvalidModulePrefix<S extends string> = S extends `${Digit}${string}` | `-${string}` | `_${string}` ? true : false;

/**
 * Pattern that matches segments containing invalid module characters.
 *
 * @internal
 */
type HasInvalidModuleChar<S extends string> = S extends `${string}${InvalidModuleChar}${string}` ? true : false;

/**
 * A string type that represents a valid module segment value. Module segments cannot start with digits, hyphens, or underscores, and cannot contain invalid module characters.
 *
 * Uses a flattened conditional structure to reduce TypeScript instantiation depth.
 *
 * @category Types/Validation
 * @example
 * ```typescript
 * import type { ModuleSegmentValue } from "@beep/effect-schema"
 * import * as S from "@effect/schema/Schema"
 *
 * // Valid module segment values
 * type Valid1 = ModuleSegmentValue<"user"> // "user"
 * type Valid2 = ModuleSegmentValue<"userService"> // "userService"
 *
 * // Invalid module segment values (resolve to never)
 * type Invalid1 = ModuleSegmentValue<"1user"> // never
 * type Invalid2 = ModuleSegmentValue<"-user"> // never
 * type Invalid3 = ModuleSegmentValue<"_user"> // never
 * ```
 * @since 0.1.0
 */
export type ModuleSegmentValue<S extends StringTypes.NonEmptyString> =
  InvalidModulePrefix<S> extends true ? never : HasInvalidModuleChar<S> extends true ? never : SegmentValue<S>;

/**
 * A string literal type that transforms a module name into a PascalCase identifier with "Id" suffix.
 *
 * Takes a non-empty string representing a module name and converts it to a module accessor format.
 * The resulting type follows the pattern of PascalCase module name with "Id" appended.
 *
 * @category Types/Module
 * @example
 * ```typescript
 * import type { ModuleAccessor } from "@beep/core"
 * import * as Effect from "effect/Effect"
 * import * as F from "effect/Function"
 *
 * type UserModuleId = ModuleAccessor<"user-service">  // "UserServiceId"
 * type OrderId = ModuleAccessor<"order">              // "OrderId"
 *
 * const accessModule = <T extends string>(id: ModuleAccessor<T>) =>
 *   Effect.gen(function* () {
 *     return yield* Effect.succeed(`Accessing module: ${id}`)
 *   })
 * ```
 * @since 0.1.0
 */
export type ModuleAccessor<S extends StringTypes.NonEmptyString> = `${PascalCaseValue<ModuleSegmentValue<S>>}Id`;

/**
 * Builds a record type where each segment creates a module accessor property.
 * Each property follows the pattern `{PascalCaseSegment}Id` and maps to an `IdentityComposer`
 * for the corresponding module path.
 *
 * Uses a mapped type with key remapping to avoid recursive type instantiation,
 * enabling scalability to 50+ segments without TypeScript depth errors.
 *
 * @category Types/Module
 * @example
 * ```typescript
 * import type { ModuleRecord } from "@beep/effect"
 * import type { NonEmptyString } from "@beep/string-types"
 *
 * // Creates: { UserId: IdentityComposer<"user/user">, PostId: IdentityComposer<"user/post"> }
 * type UserModules = ModuleRecord<"user", readonly [NonEmptyString<"user">, NonEmptyString<"post">]>
 * ```
 * @since 0.1.0
 */
export type ModuleRecord<Value extends string, Segments extends ReadonlyArray<StringTypes.NonEmptyString>> = {
  readonly [K in Segments[number] as ModuleAccessor<K>]: IdentityComposer<`${Value}/${ModuleSegmentValue<K>}`>;
};

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
