/**
 * @beep/identity
 *
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
 * @since 0.0.0
 * @category CrossCutting
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
 * @since 0.0.0
 * @category CrossCutting
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
   *
   * @returns {string}
   */
  override get message(): string {
    return "Identity template tags must use a single literal segment.";
  }
}

/**
 * @since 0.0.0
 * @category Configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
 */
export type ModuleSegmentValue<S extends TString.NonEmpty> =
  InvalidModulePrefix<S> extends true ? never : HasInvalidModuleChar<S> extends true ? never : SegmentValue<S>;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ModuleAccessor<S extends TString.NonEmpty> = `${PascalCaseValue<ModuleSegmentValue<S>>}Id`;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type TaggedAccessor<S extends TString.NonEmpty> = `$${ModuleAccessor<S>}`;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type IdentityString<Value extends string> = Value & {
  readonly __brand: unique symbol;
};

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type IdentitySymbol<Value extends string> = symbol & {
  readonly description: Value;
};

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type SchemaAnnotationExtras<
  SchemaType,
  TypeParameters extends ReadonlyArray<S.Top> = readonly [],
> = S.Annotations.Bottom<SchemaType, TypeParameters>;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type KeyAnnotationExtras<SchemaType> = S.Annotations.Key<SchemaType>;

/**
 * Mirrors the raw HTTP encoding annotation shape used by Effect's HttpApiSchema.
 *
 * The installed `effect@4.0.0-beta.28` runtime supports `~httpApiEncoding`, but
 * its published `.d.ts` does not currently export the upstream `Encoding` alias.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
 */
export type HttpAnnotationExtras<
  SchemaType,
  TypeParameters extends ReadonlyArray<S.Top> = readonly [],
> = SchemaAnnotationExtras<SchemaType, TypeParameters> & {
  readonly httpApiStatus?: number | undefined;
  readonly "~httpApiEncoding"?: HttpApiEncoding | undefined;
};

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type IdentityAnyAnnotationExtras<
  SchemaType,
  TypeParameters extends ReadonlyArray<S.Top> = readonly [],
> = KeyAnnotationExtras<SchemaType> & HttpAnnotationExtras<SchemaType, TypeParameters>;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type IdentityAnnotation<Value extends string, Identifier extends string> = S.Annotations.Annotations & {
  readonly identifier: Identifier;
  readonly schemaId: IdentitySymbol<Value>;
  readonly title: TitleFromIdentifier<Identifier>;
};

type IdentityAnnotationMetadataKeys = "identifier" | "schemaId" | "title";

/**
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
 */
export type TaggedModuleRecord<Value extends string, Segments extends ReadonlyArray<TString.NonEmpty>> = {
  readonly [K in Segments[number] as TaggedAccessor<K>]: IdentityComposer<`${Value}/${ModuleSegmentValue<K>}`>;
};

/**
 * @since 0.0.0
 * @category DomainModel
 */
export interface IdentityComposer<Value extends string> {
  /**
   * @template Next,Extras
   * @param {SegmentValue<Next>} identifier
   * @param {IdentityAnyAnnotationExtras<unknown> | undefined} extras
   * @returns {IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, Extras>}
   */
  annote<
    const Next extends TString.NonEmpty = TString.NonEmpty,
    const Extras extends IdentityAnyAnnotationExtras<unknown> = {},
  >(
    identifier: SegmentValue<Next>,
    extras?: undefined | Extras
  ): IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, Extras>;

  /**
   * @template Schema,Next
   * @param {SegmentValue<Next>} identifier
   * @param {HttpAnnotationExtras<Schema["Type"]> | undefined} extras
   * @returns {(self: Schema) => Schema["~rebuild.out"]}
   */
  annoteHttp<Schema extends S.Top, const Next extends TString.NonEmpty = TString.NonEmpty>(
    identifier: SegmentValue<Next>,
    extras?: undefined | HttpAnnotationExtras<Schema["Type"]>
  ): (self: Schema) => Schema["~rebuild.out"];

  /**
   * @template Parent
   * @returns {(identifier: TString.NonEmpty, extras?: KeyAnnotationExtras<unknown>) => (self: Schema) => Schema["~rebuild.out"]}
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
   * @param {TString.NonEmpty} identifier
   * @param {KeyAnnotationExtras<unknown> | undefined} extras
   * @returns {(self: Schema) => Schema["~rebuild.out"]}
   */
  annoteKey(
    identifier: TString.NonEmpty,
    extras?: undefined | KeyAnnotationExtras<unknown>
  ): <Schema extends S.Top>(self: Schema) => Schema["~rebuild.out"];

  /**
   * @template Schema,Next
   * @param {SegmentValue<Next>} identifier
   * @param {Schema["~annotate.in"] | undefined} extras
   * @returns {(self: Schema) => Schema["~rebuild.out"]}
   */
  annoteSchema<Schema extends S.Top, const Next extends TString.NonEmpty = TString.NonEmpty>(
    identifier: SegmentValue<Next>,
    extras?: undefined | Schema["~annotate.in"]
  ): (self: Schema) => Schema["~rebuild.out"];

  /**
   *
   * @param {ModuleSegmentValue<NonEmpty>} segments
   * @returns {TaggedModuleRecord<Value, Segments>}
   */
  compose<
    const Segments extends readonly [ModuleSegmentValue<TString.NonEmpty>, ...ModuleSegmentValue<TString.NonEmpty>[]],
  >(...segments: Segments): TaggedModuleRecord<Value, Segments>;

  /**
   * @template Next
   * @param {SegmentValue<Next>} segment
   * @returns {IdentityComposer<`${Value}/${SegmentValue<Next>}`>}
   */
  create<const Next extends TString.NonEmpty>(
    segment: SegmentValue<Next>
  ): IdentityComposer<`${Value}/${SegmentValue<Next>}`>;
  readonly identifier: IdentityString<Value>;

  /**
   * @template Next
   * @param {SegmentValue<Next>} segment
   * @returns {IdentityString<`${Value}/${SegmentValue<Next>}`>}
   */
  make<const Next extends TString.NonEmpty>(
    segment: SegmentValue<Next>
  ): IdentityString<`${Value}/${SegmentValue<Next>}`>;

  /**
   *
   * @returns {IdentityString<Value>}
   */
  string(): IdentityString<Value>;

  /**
   *
   * @returns {IdentitySymbol<Value>}
   */
  symbol(): IdentitySymbol<Value>;
  readonly value: IdentityString<Value>;

  /**
   *
   * @param {TemplateStringsArray} strings
   * @param values
   * @returns {IdentityString<`${Value}/${string}`>}
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
  ) => {
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
  ) => {
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
 * @since 0.0.0
 * @category DomainModel
 * @template Base
 * @param {Base} base - The base identity string
 * @returns {{readonly [K in `$${PascalCaseValue<ModuleSegmentValue<NormalizedBase<Base>>>}Id`]: IdentityComposer<BaseIdentity<Base>>}}
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
