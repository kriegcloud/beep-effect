/**
 * Hierarchical identity system for the `@beep` namespace.
 *
 * Provides composable, type-safe identity strings and symbols for schema
 * annotations, error tagging, and service identification throughout the
 * Effect codebase. Identities follow a `@beep/{package}/{path}` convention
 * and are validated at construction time.
 *
 * @example
 * ```typescript
 * import { make } from "@beep/identity"
 *
 * // Create a package-level identity composer
 * const { $MyPkgId } = make("my-pkg")
 *
 * // Derive child identifiers for schemas and services
 * const userId = $MyPkgId.make("UserId")
 * const sym = $MyPkgId.symbol()
 *
 * void userId // "@beep/my-pkg/UserId"
 * void sym // Symbol.for("@beep/my-pkg")
 * ```
 *
 * @module @beep/identity/Id
 * @since 0.0.0
 */

import type { TString } from "@beep/types";
import { Function as Fn, flow, pipe } from "effect";
import * as A from "effect/Array";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as Multipart_ from "effect/unstable/http/Multipart";
import type { Get, Paths } from "type-fest";

const BEEP_NAMESPACE = "@beep" as const;
const MODULE_CHARACTERS = /^[A-Za-z0-9_-]+$/;
const MODULE_LEADING_ALPHA = /^[A-Za-z]/;
const BASE_CHARACTERS = /^[A-Za-z0-9](?:[A-Za-z0-9_-]*[A-Za-z0-9])?$/;

/**
 * Error thrown when an identity template tag receives interpolation values.
 *
 * Identity template tags must be called with a single static string literal,
 * e.g. `` $I`Segment` ``. Passing `${variable}` expressions is forbidden
 * because identity strings must be statically deterministic.
 *
 * @example
 * ```typescript
 * import { make, IdentityInterpolationError } from "@beep/identity"
 *
 * const { $MyPkgId } = make("my-pkg")
 *
 * try {
 *   // Template tag with no interpolations succeeds
 *   const id = $MyPkgId`UserService`
 *   void id
 * } catch (error) {
 *   if (error instanceof IdentityInterpolationError) {
 *     console.log(error.message)
 *   }
 * }
 * ```
 *
 * @since 0.0.0
 * @category error handling
 */
export class IdentityInterpolationError extends S.TaggedErrorClass<IdentityInterpolationError>(
  "@beep/identity/errors/IdentityInterpolationError"
)(
  "IdentityInterpolationError",
  {},
  {
    title: "Identity Interpolation Error",
    description: "Identity template tags do not allow interpolations.",
  }
) {
  override get message() {
    return "Identity template tags do not allow interpolations.";
  }
}

/**
 * Error thrown when an identity template tag receives more or fewer than one literal segment.
 *
 * Template tags must be called with exactly one static string, e.g. `` $I`Segment` ``.
 *
 * @example
 * ```typescript
 * import { IdentitySegmentCountError } from "@beep/identity"
 *
 * const error = new IdentitySegmentCountError()
 * console.log(error.message) // "Identity template tags must use a single literal segment."
 * ```
 *
 * @since 0.0.0
 * @category error handling
 */
export class IdentitySegmentCountError extends S.TaggedErrorClass<IdentitySegmentCountError>(
  "@beep/identity/errors/IdentitySegmentCountError"
)(
  "IdentitySegmentCountError",
  {},
  {
    title: "Identity Segment Count Error",
    description: "Identity template tags must use a single literal segment.",
  }
) {
  /**
   * Human-readable error message.
   *
   * @since 0.0.0
   * @category getters
   */
  override get message(): string {
    return "Identity template tags must use a single literal segment.";
  }
}

/**
 * Current version of the `@beep/identity` package.
 *
 * @example
 * ```typescript
 * import { VERSION } from "@beep/identity"
 *
 * console.log(VERSION) // "0.0.0"
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * Type-level constraint ensuring an identity segment does not start or end with a slash.
 *
 * Resolves to `never` when the segment starts or ends with `/`, preventing
 * invalid identity paths at compile time.
 *
 * @since 0.0.0
 * @category models
 */
export type SegmentValue<S extends TString.NonEmpty> = S extends `/${string}`
  ? never
  : S extends `${string}/`
    ? never
    : S;

type InvalidModuleChar =
  | "/"
  | "\\"
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

type TitleWord<Word extends string> = Capitalize<Word>;

type NormalizeTitleSeparators<Value extends string> = Value extends `${infer Head}_${infer Tail}`
  ? `${NormalizeTitleSeparators<Head>} ${NormalizeTitleSeparators<Tail>}`
  : Value extends `${infer Head}-${infer Tail}`
    ? `${NormalizeTitleSeparators<Head>} ${NormalizeTitleSeparators<Tail>}`
    : Value;

type TrimTitleSpaces<Value extends string> = Value extends ` ${infer Rest}`
  ? TrimTitleSpaces<Rest>
  : Value extends `${infer Rest} `
    ? TrimTitleSpaces<Rest>
    : Value;

type SplitTitleWords<Value extends string> = Value extends `${infer Head} ${infer Tail}`
  ? Head extends ""
    ? SplitTitleWords<Tail>
    : readonly [Head, ...SplitTitleWords<Tail>]
  : Value extends ""
    ? readonly []
    : readonly [Value];

type JoinTitleWords<Words extends ReadonlyArray<string>> = Words extends readonly [infer Head extends string]
  ? TitleWord<Head>
  : Words extends readonly [infer Head extends string, ...infer Tail extends ReadonlyArray<string>]
    ? `${TitleWord<Head>} ${JoinTitleWords<Tail>}`
    : "";

/**
 * Derive a human-readable title from a kebab-case or snake_case identifier.
 *
 * Converts `"my-service"` to `"My Service"` and `"user_account"` to `"User Account"`.
 *
 * @since 0.0.0
 * @category models
 */
export type TitleFromIdentifier<Identifier extends string> = JoinTitleWords<
  SplitTitleWords<TrimTitleSpaces<NormalizeTitleSeparators<Identifier>>>
>;

type PascalCaseValue<Value extends string> = Value extends `${infer A}-${infer B}-${infer C}-${infer D}`
  ? `${PascalCaseWord<A>}${PascalCaseWord<B>}${PascalCaseWord<C>}${PascalCaseWord<D>}`
  : Value extends `${infer A}-${infer B}-${infer C}`
    ? `${PascalCaseWord<A>}${PascalCaseWord<B>}${PascalCaseWord<C>}`
    : Value extends `${infer A}-${infer B}`
      ? `${PascalCaseWord<A>}${PascalCaseWord<B>}`
      : Value extends `${infer A}_${infer B}_${infer C}_${infer D}`
        ? `${PascalCaseWord<A>}${PascalCaseWord<B>}${PascalCaseWord<C>}${PascalCaseWord<D>}`
        : Value extends `${infer A}_${infer B}_${infer C}`
          ? `${PascalCaseWord<A>}${PascalCaseWord<B>}${PascalCaseWord<C>}`
          : Value extends `${infer A}_${infer B}`
            ? `${PascalCaseWord<A>}${PascalCaseWord<B>}`
            : PascalCaseWord<Value>;

type InvalidModulePrefix<S extends string> = S extends `${Digit}${string}` | `-${string}` | `_${string}` ? true : false;

type HasInvalidModuleChar<S extends string> = S extends `${string}${InvalidModuleChar}${string}` ? true : false;

/**
 * Type-level constraint for module-safe identity segments.
 *
 * In addition to the basic {@link SegmentValue} rules, module segments must start
 * with an alphabetic character and contain only alphanumerics, hyphens, or underscores.
 * Resolves to `never` when violated.
 *
 * @since 0.0.0
 * @category models
 */
export type ModuleSegmentValue<S extends TString.NonEmpty> =
  InvalidModulePrefix<S> extends true ? never : HasInvalidModuleChar<S> extends true ? never : SegmentValue<S>;

/**
 * Derive a PascalCase accessor name suffixed with `Id` from a module segment.
 *
 * `"my-service"` becomes `"MyServiceId"`.
 *
 * @since 0.0.0
 * @category models
 */
export type ModuleAccessor<S extends TString.NonEmpty> = `${PascalCaseValue<ModuleSegmentValue<S>>}Id`;

/**
 * Derive a `$`-prefixed PascalCase accessor key from a module segment.
 *
 * `"my-service"` becomes `"$MyServiceId"`.
 *
 * @since 0.0.0
 * @category models
 */
export type TaggedAccessor<S extends TString.NonEmpty> = `$${ModuleAccessor<S>}`;

/**
 * Branded string type for identity values, preventing accidental use of raw strings.
 *
 * @since 0.0.0
 * @category models
 */
export type IdentityString<Value extends string> = Value & {
  readonly __brand: unique symbol;
};

/**
 * Branded symbol type for identity values, created via `Symbol.for` for interning.
 *
 * @since 0.0.0
 * @category models
 */
export type IdentitySymbol<Value extends string> = symbol & {
  readonly description: Value;
};

/**
 * Additional schema annotation fields that identity annotation helpers accept.
 *
 * Mirrors `S.Annotations.Bottom` so callers can supply `description`, `documentation`,
 * and other Effect Schema annotation keys alongside identity metadata.
 *
 * @since 0.0.0
 * @category models
 */
export type SchemaAnnotationExtras<
  SchemaType,
  TypeParameters extends ReadonlyArray<S.Top> = readonly [],
> = S.Annotations.Bottom<SchemaType, TypeParameters>;

/**
 * Annotation fields accepted by `annoteKey`, mirroring `S.Annotations.Key`.
 *
 * @since 0.0.0
 * @category models
 */
export type KeyAnnotationExtras<SchemaType> = S.Annotations.Key<SchemaType>;

/**
 * Mirrors the raw HTTP encoding annotation shape used by Effect's HttpApiSchema.
 *
 * The installed `effect@4.0.0-beta.28` runtime supports `~httpApiEncoding`, but
 * its published `.d.ts` does not currently export the upstream `Encoding` alias.
 *
 * @since 0.0.0
 * @category models
 */
export type HttpApiEncoding =
  | {
      readonly _tag: "Multipart";
      readonly mode: "buffered" | "stream";
      readonly contentType: string;
      readonly limits?: Multipart_.withLimits.Options | undefined;
    }
  | {
      readonly _tag: "Json" | "FormUrlEncoded" | "Uint8Array" | "Text";
      readonly contentType: string;
    };

/**
 * Annotation fields accepted by `annoteHttp`, extending schema extras with HTTP API metadata.
 *
 * Supports optional `httpApiStatus` and `~httpApiEncoding` for Effect HTTP API annotations.
 *
 * @since 0.0.0
 * @category models
 */
export type HttpAnnotationExtras<
  SchemaType,
  TypeParameters extends ReadonlyArray<S.Top> = readonly [],
> = SchemaAnnotationExtras<SchemaType, TypeParameters> & {
  readonly httpApiStatus?: number | undefined;
  readonly "~httpApiEncoding"?: HttpApiEncoding | undefined;
};

/**
 * Union of all annotation extras accepted by the `annote` family of helpers.
 *
 * Combines key-level and HTTP-level annotation fields into a single constraint.
 *
 * @since 0.0.0
 * @category models
 */
export type IdentityAnyAnnotationExtras<
  SchemaType,
  TypeParameters extends ReadonlyArray<S.Top> = readonly [],
> = KeyAnnotationExtras<SchemaType> & HttpAnnotationExtras<SchemaType, TypeParameters>;

/**
 * Fully resolved identity annotation record applied to Effect schemas.
 *
 * Contains an `identifier` string, an interned `schemaId` symbol, and a
 * human-readable `title` derived from the identifier.
 *
 * @since 0.0.0
 * @category models
 */
export type IdentityAnnotation<Value extends string, Identifier extends string> = S.Annotations.Annotations & {
  readonly identifier: Identifier;
  readonly schemaId: IdentitySymbol<Value>;
  readonly title: TitleFromIdentifier<Identifier>;
};

type IdentityAnnotationMetadataKeys = "identifier" | "schemaId" | "title";

/**
 * Result of calling `annote` -- the identity annotation merged with any caller-supplied extras,
 * with identity metadata keys taking precedence.
 *
 * @since 0.0.0
 * @category models
 */
export type IdentityAnnotationResult<
  Value extends string,
  Identifier extends string,
  Extras extends object = {},
> = IdentityAnnotation<Value, Identifier> & Omit<Extras, IdentityAnnotationMetadataKeys>;

type SchemaPath<Struct extends object> = Extract<Paths<Struct>, string>;

type KeyIdentifierPath<Identifier extends string> = Identifier extends `${string}.${infer Rest}` ? Rest : Identifier;

type StrictKeyIdentifier<Struct extends object, Identifier extends TString.NonEmpty> =
  KeyIdentifierPath<SegmentValue<Identifier>> extends SchemaPath<Struct> ? SegmentValue<Identifier> : never;

type KeyIdentifierValue<Struct extends object, Identifier extends string> = Get<Struct, KeyIdentifierPath<Identifier>>;

/**
 * Record mapping `$`-prefixed accessor keys to child {@link IdentityComposer} instances,
 * produced by calling `compose` with one or more module segment names.
 *
 * @since 0.0.0
 * @category models
 */
export type TaggedModuleRecord<Value extends string, Segments extends ReadonlyArray<TString.NonEmpty>> = {
  readonly [K in Segments[number] as TaggedAccessor<K>]: IdentityComposer<`${Value}/${ModuleSegmentValue<K>}`>;
};

/**
 * Composable identity builder for constructing hierarchical `@beep/` identity paths.
 *
 * An `IdentityComposer` holds a current identity path and provides methods to:
 * - Extend the path with child segments (`create`, `make`, template tag)
 * - Produce annotation records for Effect schemas (`annote`, `annoteSchema`, `annoteHttp`, `annoteKey`)
 * - Batch-create named child composers (`compose`)
 *
 * @example
 * ```typescript
 * import { make } from "@beep/identity"
 *
 * // Create a root composer for "my-pkg"
 * const { $MyPkgId } = make("my-pkg")
 *
 * // Template tag: derive a child identity string
 * const serviceId = $MyPkgId`UserService`
 * void serviceId // "@beep/my-pkg/UserService"
 *
 * // make: one-shot string creation
 * const modelId = $MyPkgId.make("UserModel")
 * void modelId // "@beep/my-pkg/UserModel"
 *
 * // create: derive a child composer for further nesting
 * const sub = $MyPkgId.create("domain")
 * const nested = sub.make("Entity")
 * void nested // "@beep/my-pkg/domain/Entity"
 *
 * // compose: batch-create tagged child composers
 * const modules = $MyPkgId.compose("auth", "billing")
 * const authId = modules.$AuthId.make("Session")
 * void authId // "@beep/my-pkg/auth/Session"
 *
 * // annote: produce an annotation record for Effect schemas
 * const annotation = $MyPkgId.annote("UserSchema", {
 *   description: "User domain model",
 * })
 * void annotation.identifier // "UserSchema"
 * void annotation.title // "UserSchema"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
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
   * void ann.identifier // "UserCreated"
   * void ann.title // "UserCreated"
   * void ann.description // "A user was created."
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
  ): (self: Schema) => Schema["~rebuild.out"];

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
  ) => (self: Schema) => Schema["~rebuild.out"];

  /**
   * Produce a key annotation function for an untyped parent.
   *
   * @since 0.0.0
   * @category combinators
   */
  annoteKey(
    identifier: TString.NonEmpty,
    extras?: undefined | KeyAnnotationExtras<unknown>
  ): <Schema extends S.Top>(self: Schema) => Schema["~rebuild.out"];

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
    extras?: undefined | Schema["~annotate.in"]
  ): (self: Schema) => Schema["~rebuild.out"];

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
   * void authId // "@beep/my-pkg/auth/Session"
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
   * void entityId // "@beep/my-pkg/domain/Entity"
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
   * void id // "@beep/my-pkg/UserModel"
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
   * void id // "@beep/my-pkg/UserService"
   * ```
   *
   * @since 0.0.0
   * @category constructors
   */
  (strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>): IdentityString<`${Value}/${string}`>;
}

type NormalizedBase<Base extends TString.NonEmpty> = Base extends `@beep/${infer Rest extends TString.NonEmpty}`
  ? Rest
  : Base extends "@beep"
    ? "beep"
    : Base extends `@${infer Rest extends TString.NonEmpty}`
      ? Rest
      : Base;

type BaseIdentity<Base extends TString.NonEmpty> =
  NormalizedBase<Base> extends "beep" ? typeof BEEP_NAMESPACE : `${typeof BEEP_NAMESPACE}/${NormalizedBase<Base>}`;

const SegmentCheck = S.makeFilterGroup(
  [
    S.makeFilter((segment: string) => Str.isNonEmpty(segment), {
      identifier: "@beep/identity/check/non-empty-segment",
      message: "Identity segments cannot be empty.",
    }),
    S.makeFilter((segment: string) => !pipe(segment, Str.startsWith("/")), {
      identifier: "@beep/identity/check/no-leading-slash",
      message: 'Identity segments cannot start with "/".',
    }),
    S.makeFilter((segment: string) => !pipe(segment, Str.endsWith("/")), {
      identifier: "@beep/identity/check/no-trailing-slash",
      message: 'Identity segments cannot end with "/".',
    }),
  ],
  {
    title: "Identity Segment",
    description: "Identity segments are non-empty and do not start or end with a slash.",
  }
);

const SegmentSchema = S.String.check(SegmentCheck);

const ModuleSegmentCheck = S.makeFilterGroup(
  [
    S.makeFilter((segment: string) => MODULE_CHARACTERS.test(segment), {
      identifier: "@beep/identity/check/module-characters",
      message: "Module segments must contain only alphanumeric characters, hyphens, or underscores.",
    }),
    S.makeFilter((segment: string) => MODULE_LEADING_ALPHA.test(segment), {
      identifier: "@beep/identity/check/module-leading-alpha",
      message: "Module segments must start with an alphabetic character to create valid accessors.",
    }),
  ],
  {
    title: "Identity Module Segment",
    description: "Module segments are identity segments that are safe for generated module accessor names.",
  }
);

const ModuleSegmentSchema = SegmentSchema.check(ModuleSegmentCheck);

const BaseSegmentSchema = S.String.check(
  S.makeFilter((base: string) => Str.isNonEmpty(base), {
    identifier: "@beep/identity/check/non-empty-base",
    message: "Identity bases cannot be empty.",
  }),
  S.makeFilter((base: string) => BASE_CHARACTERS.test(base), {
    identifier: "@beep/identity/check/base-characters",
    message: "Identity bases must use alphanumeric, hyphen, or underscore characters and start/end with alphanumeric.",
  })
);

const decodeString = S.decodeUnknownSync(S.String);
const decodeSegment = S.decodeUnknownSync(SegmentSchema);
const decodeModuleSegment = S.decodeUnknownSync(ModuleSegmentSchema);
const decodeBaseSegment = S.decodeUnknownSync(BaseSegmentSchema);

/**
 *
 * @param {Value} value
 * @returns {IdentityString<Value>}
 */
const toIdentityString = <Value extends string>(value: Value): IdentityString<Value> => value as IdentityString<Value>;

/**
 *
 * @param value
 */
const toIdentitySymbol = <Value extends string>(value: Value): IdentitySymbol<Value> =>
  Symbol.for(value) as IdentitySymbol<Value>;

/**
 *
 * @param {Identifier} identifier
 * @returns {TitleFromIdentifier<Identifier>}
 */
const toTitle = <const Identifier extends TString.NonEmpty>(identifier: Identifier): TitleFromIdentifier<Identifier> =>
  pipe(
    identifier,
    Str.replace(/[_-]+/g, " "),
    Str.trim,
    Str.split(" "),
    A.filter(Str.isNonEmpty),
    A.map((segment) => {
      const head = pipe(segment, Str.slice(0, 1), Str.toUpperCase);
      const tail = pipe(segment, Str.slice(1));
      return `${head}${tail}`;
    }),
    A.join(" ")
  ) as TitleFromIdentifier<Identifier>;

type ModulePascal<Segment extends TString.NonEmpty> =
  ModuleAccessor<Segment> extends `${infer Pascal}Id` ? Pascal : never;

/**
 * @template Segment
 * @param {Segment} segment - A segment to convert to PascalCase
 * @returns {ModulePascal<Segment>}
 */
const toPascalIdentifier = <const Segment extends TString.NonEmpty>(segment: Segment): ModulePascal<Segment> =>
  pipe(segment, toTitle, Str.replace(/\s+/g, "")) as ModulePascal<Segment>;

/**
 * @template Segment
 * @param {Segment} segment - A segment to convert to a tagged accessor key
 * @returns {TaggedAccessor<Segment>}
 */
const toTaggedKey = <const Segment extends TString.NonEmpty>(segment: Segment): TaggedAccessor<Segment> =>
  `$${toPascalIdentifier(segment)}Id` as TaggedAccessor<Segment>;
/**
 * @template Segment
 * @param {Segment} segment - A segment to validate and return as-is
 * @returns {Segment}
 */
const validateSegment = <const Segment extends TString.NonEmpty>(segment: Segment): Segment => {
  decodeSegment(segment);
  return segment;
};

/**
 * @template Segment
 * @param {Segment} segment - A segment to validate and return as-is
 * @returns {Segment}
 */
const validateModuleSegment = <const Segment extends TString.NonEmpty>(segment: Segment): Segment => {
  decodeModuleSegment(segment);
  return segment;
};

/**
 * @template Base
 * @param {Base} base - A base string to normalize
 * @returns {NormalizedBase<Base>}
 */
const normalizeBase = <const Base extends TString.NonEmpty>(base: Base): NormalizedBase<Base> => {
  const value = decodeString(base);

  const withoutNamespace = pipe(value, (segment) => {
    if (segment === BEEP_NAMESPACE) {
      return "beep";
    }
    if (pipe(segment, Str.startsWith(`${BEEP_NAMESPACE}/`))) {
      return pipe(segment, Str.slice(Str.length(`${BEEP_NAMESPACE}/`)));
    }
    if (pipe(segment, Str.startsWith(BEEP_NAMESPACE))) {
      return pipe(segment, Str.slice(Str.length(BEEP_NAMESPACE)));
    }
    return segment;
  });

  const withoutAtPrefix = pipe(withoutNamespace, (value) =>
    pipe(value, Str.startsWith("@")) ? pipe(value, Str.slice(1)) : value
  );

  return decodeBaseSegment(withoutAtPrefix) as NormalizedBase<Base>;
};

/**
 * @template Base
 * @param {NormalizedBase<Base>} base - A normalized base string to create an identity from
 * @returns {BaseIdentity<Base>}
 */
const createBaseIdentity = <const Base extends TString.NonEmpty>(base: NormalizedBase<Base>): BaseIdentity<Base> =>
  base === "beep" ? (BEEP_NAMESPACE as BaseIdentity<Base>) : (`${BEEP_NAMESPACE}/${base}` as BaseIdentity<Base>);

/**
 *
 * @param {Value} value
 * @returns {IdentityComposer<Value>}
 */
const createComposer = <const Value extends string>(value: Value): IdentityComposer<Value> => {
  const identityValue = toIdentityString(value);

  /**
   * @template Next
   * @param {SegmentValue<Next>} segment
   * @returns {IdentityComposer<`${Value}/${SegmentValue<Next>}`>}
   */
  const composeNext = <const Next extends TString.NonEmpty>(
    segment: SegmentValue<Next>
  ): IdentityComposer<`${Value}/${SegmentValue<Next>}`> => {
    const next = validateSegment(segment);
    const composed = `${value}/${next}` as `${Value}/${SegmentValue<Next>}`;
    return createComposer(composed);
  };

  /**
   * @template Next
   * @param {SegmentValue<Next>} identifier
   * @returns {IdentityAnnotation<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>>}
   */
  const identityAnnotation = <const Next extends TString.NonEmpty = TString.NonEmpty>(
    identifier: SegmentValue<Next>
  ): IdentityAnnotation<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>> => {
    const next = validateSegment(identifier);
    const composed = `${value}/${next}` as `${Value}/${SegmentValue<Next>}`;

    return {
      schemaId: toIdentitySymbol(composed),
      identifier: next,
      title: toTitle(next),
    } satisfies IdentityAnnotation<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>>;
  };

  /**
   * @template Next,Extras
   * @param {SegmentValue<Next>} identifier
   * @param {IdentityAnyAnnotationExtras<unknown> | undefined} extras
   * @returns {IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, Extras>}
   */
  const annote = <
    const Next extends TString.NonEmpty = TString.NonEmpty,
    const Extras extends IdentityAnyAnnotationExtras<unknown> = {},
  >(
    identifier: SegmentValue<Next>,
    extras?: undefined | Extras
  ): IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, Extras> => {
    const annotation = identityAnnotation(identifier);
    if (extras === undefined) {
      return annotation as IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, Extras>;
    }

    return {
      ...extras,
      schemaId: annotation.schemaId,
      identifier: annotation.identifier,
      title: annotation.title,
    };
  };

  /**
   * @template Schema,Next
   * @param {SegmentValue<Next>} identifier
   * @param {Schema["~annotate.in"] | undefined} extras
   * @returns {(self: Schema) => Schema["~rebuild.out"]}
   */
  const annoteSchema = <Schema extends S.Top, const Next extends TString.NonEmpty = TString.NonEmpty>(
    identifier: SegmentValue<Next>,
    extras?: undefined | Schema["~annotate.in"]
  ): ((self: Schema) => Schema["~rebuild.out"]) => {
    const annotation = annote(identifier, extras);

    return (self: Schema): Schema["~rebuild.out"] => self.annotate(annotation);
  };

  function annoteKey<Parent extends object>(): <
    const Next extends TString.NonEmpty = TString.NonEmpty,
    Schema extends S.Top & { readonly Type: KeyIdentifierValue<Parent, SegmentValue<Next>> } = S.Top & {
      readonly Type: KeyIdentifierValue<Parent, SegmentValue<Next>>;
    },
  >(
    identifier: SegmentValue<Next> & StrictKeyIdentifier<Parent, Next>,
    extras?: undefined | KeyAnnotationExtras<KeyIdentifierValue<Parent, SegmentValue<Next>>>
  ) => (self: Schema) => Schema["~rebuild.out"];
  function annoteKey(
    identifier: TString.NonEmpty,
    extras?: undefined | KeyAnnotationExtras<unknown>
  ): <Schema extends S.Top>(self: Schema) => Schema["~rebuild.out"];
  function annoteKey(identifier?: TString.NonEmpty, extras?: undefined | KeyAnnotationExtras<unknown>): unknown {
    if (identifier === undefined) {
      return <const StrictNext extends TString.NonEmpty = TString.NonEmpty>(
        strictIdentifier: SegmentValue<StrictNext>,
        strictExtras?: undefined | KeyAnnotationExtras<unknown>
      ) => annoteKey(strictIdentifier, strictExtras);
    }

    const annotation = annote(identifier, extras);

    return <Schema extends S.Top>(self: Schema): Schema["~rebuild.out"] => self.annotateKey(annotation);
  }

  /**
   * @template Schema,Next
   * @param {SegmentValue<Next>} identifier
   * @param {HttpAnnotationExtras<Schema["Type"]> | undefined} extras
   * @returns {(self: Schema) => Schema["~rebuild.out"]}
   */
  const annoteHttp = <Schema extends S.Top, const Next extends TString.NonEmpty = TString.NonEmpty>(
    identifier: SegmentValue<Next>,
    extras?: undefined | HttpAnnotationExtras<Schema["Type"]>
  ): ((self: Schema) => Schema["~rebuild.out"]) => {
    const annotation = annote(identifier, extras);

    return (self: Schema): Schema["~rebuild.out"] => self.annotate(annotation);
  };

  return Object.defineProperties(
    (strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>) => {
      if (values.length > 0) {
        throw new IdentityInterpolationError();
      }
      if (strings.length !== 1) {
        throw new IdentitySegmentCountError();
      }
      const segment = decodeModuleSegment(strings[0]);
      const composed = `${value}/${segment}` as `${Value}/${string}`;
      return toIdentityString(composed);
    },
    {
      value: {
        value: identityValue,
        enumerable: true,
        writable: true,
        configurable: true,
      },
      identifier: {
        value: identityValue,
        enumerable: true,
        writable: true,
        configurable: true,
      },
      compose: {
        value: <
          const Segments extends readonly [
            ModuleSegmentValue<TString.NonEmpty>,
            ...ModuleSegmentValue<TString.NonEmpty>[],
          ],
        >(
          ...segments: Segments
        ) => {
          const entries = pipe(
            segments,
            A.map((segment) => {
              const ensured = validateModuleSegment(segment);
              const composed = `${value}/${ensured}` as `${Value}/${ModuleSegmentValue<TString.NonEmpty>}`;
              const nestedComposer = createComposer(composed);
              return [toTaggedKey(ensured), nestedComposer] as const;
            })
          );
          return R.fromEntries(entries) as unknown as TaggedModuleRecord<Value, Segments>;
        },
        enumerable: true,
        writable: true,
        configurable: true,
      },
      create: {
        value: composeNext,
        enumerable: true,
        writable: true,
        configurable: true,
      },
      make: {
        value: <const Next extends TString.NonEmpty>(segment: SegmentValue<Next>) => {
          const next = validateSegment(segment);
          const composed = `${value}/${next}` as `${Value}/${SegmentValue<Next>}`;
          return toIdentityString(composed);
        },
        enumerable: true,
        writable: true,
        configurable: true,
      },
      string: {
        value: () => identityValue,
        enumerable: true,
        writable: true,
        configurable: true,
      },
      symbol: {
        value: () => toIdentitySymbol(value),
        enumerable: true,
        writable: true,
        configurable: true,
      },
      annote: {
        value: annote,
        enumerable: true,
        writable: true,
        configurable: true,
      },
      annoteSchema: {
        value: annoteSchema,
        enumerable: true,
        writable: true,
        configurable: true,
      },
      annoteKey: {
        value: annoteKey,
        enumerable: true,
        writable: true,
        configurable: true,
      },
      annoteHttp: {
        value: annoteHttp,
        enumerable: true,
        writable: true,
        configurable: true,
      },
    }
  ) as IdentityComposer<Value>;
};

type MakeReturn<Base extends TString.NonEmpty> = {
  readonly [K in `$${PascalCaseValue<ModuleSegmentValue<NormalizedBase<Base>>>}Id`]: IdentityComposer<
    BaseIdentity<Base>
  >;
};

/**
 * Create a root identity composer for a `@beep` package namespace.
 *
 * Accepts a base string (with or without the `@beep/` prefix) and returns
 * a record containing a single `$`-prefixed PascalCase accessor mapped to
 * the root {@link IdentityComposer} for that package.
 *
 * @example
 * ```typescript
 * import { make } from "@beep/identity"
 *
 * // Bare name -- "@beep/" prefix is added automatically
 * const { $MyPkgId } = make("my-pkg")
 * const id = $MyPkgId.make("Service")
 * void id // "@beep/my-pkg/Service"
 * ```
 *
 * @example
 * ```typescript
 * import { make } from "@beep/identity"
 *
 * // Full scoped name works too
 * const { $UtilsId } = make("@beep/utils")
 * const sym = $UtilsId.symbol()
 * void sym // Symbol.for("@beep/utils")
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const make = flow(<const Base extends TString.NonEmpty>(base: Base): MakeReturn<Base> => {
  const normalized = normalizeBase(base);
  const baseIdentity = createBaseIdentity(normalized);
  const composer = createComposer(baseIdentity);
  const key = toTaggedKey(normalized);

  return Fn.cast<
    {
      [x: string]: IdentityComposer<BaseIdentity<Base>>;
    },
    MakeReturn<Base>
  >({
    [key]: composer,
  });
});
