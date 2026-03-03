/**
 * @beep/identity
 *
 * @since 0.0.0
 */

import type { TString } from "@beep/types";
import { Function as F, MutableHashSet, String as Str } from "effect";
import * as A from "effect/Array";
import * as R from "effect/Record";
import * as S from "effect/Schema";

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
export type SchemaAnnotationExtras<SchemaType> = S.Annotations.Documentation<SchemaType>;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export interface IdentityAnnotation<Value extends string, Identifier extends string>
  extends S.Annotations.Documentation<unknown> {
  readonly schemaId: IdentitySymbol<Value>;
  readonly identifier: Identifier;
  readonly title: string;
}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type IdentityAnnotationResult<Value extends string, Identifier extends string, SchemaType> = IdentityAnnotation<
  Value,
  Identifier
> &
  SchemaAnnotationExtras<SchemaType>;

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
  readonly value: IdentityString<Value>;
  readonly identifier: IdentityString<Value>;
  readonly identityRegistry: MutableHashSet.MutableHashSet<string>;

  /**
   *
   * @param {TemplateStringsArray} strings
   * @param values
   * @returns {IdentityString<`${Value}/${string}`>}
   */
  (strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>): IdentityString<`${Value}/${string}`>;

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

  /**
   * @template Next,SchemaType
   * @param {SegmentValue<Next>} identifier
   * @param {SchemaAnnotationExtras<SchemaType> | undefined} extras
   * @returns {IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, SchemaType>}
   */
  annote<SchemaType = unknown, const Next extends TString.NonEmpty = TString.NonEmpty>(
    identifier: SegmentValue<Next>,
    extras?: undefined | SchemaAnnotationExtras<SchemaType>
  ): IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, SchemaType>;
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
    S.makeFilter((segment: string) => !F.pipe(segment, Str.startsWith("/")), {
      identifier: "@beep/identity/check/no-leading-slash",
      message: 'Identity segments cannot start with "/".',
    }),
    S.makeFilter((segment: string) => !F.pipe(segment, Str.endsWith("/")), {
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
 * @returns {string}
 */
const toTitle = <const Identifier extends TString.NonEmpty>(identifier: Identifier): string =>
  F.pipe(
    identifier,
    Str.replace(/[_-]+/g, " "),
    Str.trim,
    Str.split(" "),
    A.filter(Str.isNonEmpty),
    A.map((segment) => {
      const head = F.pipe(segment, Str.slice(0, 1), Str.toUpperCase);
      const tail = F.pipe(segment, Str.slice(1));
      return `${head}${tail}`;
    }),
    A.join(" ")
  );

type ModulePascal<Segment extends TString.NonEmpty> =
  ModuleAccessor<Segment> extends `${infer Pascal}Id` ? Pascal : never;

/**
 * @template Segment
 * @param {Segment} segment - A segment to convert to PascalCase
 * @returns {ModulePascal<Segment>}
 */
const toPascalIdentifier = <const Segment extends TString.NonEmpty>(segment: Segment): ModulePascal<Segment> =>
  F.pipe(segment, toTitle, Str.replace(/\s+/g, "")) as ModulePascal<Segment>;

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

  const withoutNamespace = F.pipe(value, (segment) => {
    if (segment === BEEP_NAMESPACE) {
      return "beep";
    }
    if (F.pipe(segment, Str.startsWith(`${BEEP_NAMESPACE}/`))) {
      return F.pipe(segment, Str.slice(Str.length(`${BEEP_NAMESPACE}/`)));
    }
    if (F.pipe(segment, Str.startsWith(BEEP_NAMESPACE))) {
      return F.pipe(segment, Str.slice(Str.length(BEEP_NAMESPACE)));
    }
    return segment;
  });

  const withoutAtPrefix = F.pipe(withoutNamespace, (value) =>
    F.pipe(value, Str.startsWith("@")) ? F.pipe(value, Str.slice(1)) : value
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

type Registry = MutableHashSet.MutableHashSet<string>;

/**
 *
 * @param {Registry} registry
 * @param {string} identity
 * @returns void
 */
const registerIdentity = (registry: Registry, identity: string): void => {
  MutableHashSet.add(registry, identity);
};

/**
 *
 * @param {Value} value
 * @param {Registry} registry
 * @returns {IdentityComposer<Value>}
 */
const createComposer = <const Value extends string>(value: Value, registry: Registry): IdentityComposer<Value> => {
  registerIdentity(registry, value);

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
    return createComposer(composed, registry);
  };

  /**
   * @template Next,SchemaType
   * @param {SegmentValue<Next>} identifier
   * @param {SchemaAnnotationExtras<SchemaType> | undefined} extras
   * @returns {IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, SchemaType>}
   */
  const annote = <SchemaType = unknown, const Next extends TString.NonEmpty = TString.NonEmpty>(
    identifier: SegmentValue<Next>,
    extras?: undefined | SchemaAnnotationExtras<SchemaType>
  ): IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, SchemaType> => {
    const next = validateSegment(identifier);
    const composed = `${value}/${next}` as `${Value}/${SegmentValue<Next>}`;
    registerIdentity(registry, `${composed}#annotation`);
    const annotation = {
      schemaId: toIdentitySymbol(composed),
      identifier: next,
      title: toTitle(next),
    } satisfies IdentityAnnotation<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>>;

    if (extras === undefined) {
      return annotation;
    }

    return {
      ...extras,
      schemaId: annotation.schemaId,
      identifier: annotation.identifier,
      title: annotation.title,
    };
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
      registerIdentity(registry, composed);
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
          const entries = F.pipe(
            segments,
            A.map((segment) => {
              const ensured = validateModuleSegment(segment);
              const composed = `${value}/${ensured}` as `${Value}/${ModuleSegmentValue<TString.NonEmpty>}`;
              const nestedComposer = createComposer(composed, registry);
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
          registerIdentity(registry, composed);
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
      identityRegistry: {
        value: registry,
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
export const make = <const Base extends TString.NonEmpty>(base: Base): MakeReturn<Base> => {
  const registry = MutableHashSet.empty<string>();
  const normalized = normalizeBase(base);
  const baseIdentity = createBaseIdentity(normalized);
  const composer = createComposer(baseIdentity, registry);
  const key = toTaggedKey(normalized);

  return F.coerceUnsafe<
    {
      [x: string]: IdentityComposer<BaseIdentity<Base>>;
    },
    MakeReturn<Base>
  >({
    [key]: composer,
  });
};
