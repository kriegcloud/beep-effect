/**
 * @beep/identity
 *
 * @since 0.0.0
 */

import type { TString } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as String from "effect/String";

const BEEP_NAMESPACE = "@beep" as const;
const MODULE_CHARACTERS = /^[A-Za-z0-9_-]+$/;
const MODULE_LEADING_ALPHA = /^[A-Za-z]/;
const BASE_CHARACTERS = /^[A-Za-z0-9](?:[A-Za-z0-9_-]*[A-Za-z0-9])?$/;

/**
 * @since 0.0.0
 * @category constants
 */
export const VERSION = "0.0.0" as const;

/**
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
 * @category models
 */
export type ModuleSegmentValue<S extends TString.NonEmpty> =
  InvalidModulePrefix<S> extends true ? never : HasInvalidModuleChar<S> extends true ? never : SegmentValue<S>;

/**
 * @since 0.0.0
 * @category models
 */
export type ModuleAccessor<S extends TString.NonEmpty> = `${PascalCaseValue<ModuleSegmentValue<S>>}Id`;

/**
 * @since 0.0.0
 * @category models
 */
export type TaggedAccessor<S extends TString.NonEmpty> = `$${ModuleAccessor<S>}`;

/**
 * @since 0.0.0
 * @category models
 */
export type IdentityString<Value extends string> = Value & {
  readonly __brand: unique symbol;
};

/**
 * @since 0.0.0
 * @category models
 */
export type IdentitySymbol<Value extends string> = symbol & {
  readonly description: Value;
};

/**
 * @since 0.0.0
 * @category models
 */
export type SchemaAnnotationExtras<SchemaType> = S.Annotations.Documentation<SchemaType>;

/**
 * @since 0.0.0
 * @category models
 */
export interface IdentityAnnotation<Value extends string, Identifier extends string>
  extends S.Annotations.Documentation<unknown> {
  readonly schemaId: IdentitySymbol<Value>;
  readonly identifier: Identifier;
  readonly title: string;
}

/**
 * @since 0.0.0
 * @category models
 */
export type IdentityAnnotationResult<Value extends string, Identifier extends string, SchemaType> = IdentityAnnotation<
  Value,
  Identifier
> &
  SchemaAnnotationExtras<SchemaType>;

/**
 * @since 0.0.0
 * @category models
 */
export interface IdentityComposer<Value extends string> {
  (strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>): IdentityString<`${Value}/${string}`>;
  readonly value: IdentityString<Value>;
  readonly identifier: IdentityString<Value>;
  compose<const Next extends TString.NonEmpty>(
    segment: ModuleSegmentValue<Next>
  ): IdentityComposer<`${Value}/${ModuleSegmentValue<Next>}`>;
  create<const Next extends TString.NonEmpty>(
    segment: ModuleSegmentValue<Next>
  ): IdentityComposer<`${Value}/${ModuleSegmentValue<Next>}`>;
  make<const Next extends TString.NonEmpty>(
    segment: SegmentValue<Next>
  ): IdentityString<`${Value}/${SegmentValue<Next>}`>;
  string(): IdentityString<Value>;
  symbol(): IdentitySymbol<Value>;
  annotate<SchemaType = unknown, const Next extends TString.NonEmpty = TString.NonEmpty>(
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
    S.makeFilter((segment: string) => String.isNonEmpty(segment), {
      identifier: "@beep/identity/check/non-empty-segment",
      message: "Identity segments cannot be empty.",
    }),
    S.makeFilter((segment: string) => !F.pipe(segment, String.startsWith("/")), {
      identifier: "@beep/identity/check/no-leading-slash",
      message: 'Identity segments cannot start with "/".',
    }),
    S.makeFilter((segment: string) => !F.pipe(segment, String.endsWith("/")), {
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
  S.makeFilter((base: string) => String.isNonEmpty(base), {
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

const toIdentityString = <Value extends string>(value: Value): IdentityString<Value> => value as IdentityString<Value>;

const toIdentitySymbol = <Value extends string>(value: Value): IdentitySymbol<Value> =>
  Symbol.for(value) as IdentitySymbol<Value>;

const toTitle = <const Identifier extends TString.NonEmpty>(identifier: Identifier): string =>
  F.pipe(
    identifier,
    String.replace(/[_-]+/g, " "),
    String.trim,
    String.split(" "),
    A.filter(String.isNonEmpty),
    A.map((segment) => {
      const head = F.pipe(segment, String.slice(0, 1), String.toUpperCase);
      const tail = F.pipe(segment, String.slice(1));
      return `${head}${tail}`;
    }),
    A.join(" ")
  );

type ModulePascal<Segment extends TString.NonEmpty> =
  ModuleAccessor<Segment> extends `${infer Pascal}Id` ? Pascal : never;

const toPascalIdentifier = <const Segment extends TString.NonEmpty>(segment: Segment): ModulePascal<Segment> =>
  F.pipe(segment, toTitle, String.replace(/\s+/g, "")) as ModulePascal<Segment>;

const toTaggedKey = <const Segment extends TString.NonEmpty>(segment: Segment): TaggedAccessor<Segment> =>
  `$${toPascalIdentifier(segment)}Id` as TaggedAccessor<Segment>;

const validateSegment = <const Segment extends TString.NonEmpty>(segment: Segment): Segment =>
  decodeSegment(segment) as Segment;

const validateModuleSegment = <const Segment extends TString.NonEmpty>(segment: Segment): Segment =>
  decodeModuleSegment(segment) as Segment;

const normalizeBase = <const Base extends TString.NonEmpty>(base: Base): NormalizedBase<Base> => {
  const value = decodeString(base);

  const withoutNamespace = F.pipe(value, (segment) => {
    if (segment === BEEP_NAMESPACE) {
      return "beep";
    }
    if (F.pipe(segment, String.startsWith(`${BEEP_NAMESPACE}/`))) {
      return F.pipe(segment, String.slice(String.length(`${BEEP_NAMESPACE}/`)));
    }
    if (F.pipe(segment, String.startsWith(BEEP_NAMESPACE))) {
      return F.pipe(segment, String.slice(String.length(BEEP_NAMESPACE)));
    }
    return segment;
  });

  const withoutAtPrefix = F.pipe(withoutNamespace, (value) =>
    F.pipe(value, String.startsWith("@")) ? F.pipe(value, String.slice(1)) : value
  );

  return decodeBaseSegment(withoutAtPrefix) as NormalizedBase<Base>;
};

const createBaseIdentity = <const Base extends TString.NonEmpty>(base: NormalizedBase<Base>): BaseIdentity<Base> =>
  base === "beep" ? (BEEP_NAMESPACE as BaseIdentity<Base>) : (`${BEEP_NAMESPACE}/${base}` as BaseIdentity<Base>);

const createComposer = <const Value extends string>(value: Value): IdentityComposer<Value> => {
  const identityValue = toIdentityString(value);
  const composeNext = <const Next extends TString.NonEmpty>(
    segment: ModuleSegmentValue<Next>
  ): IdentityComposer<`${Value}/${ModuleSegmentValue<Next>}`> => {
    const next = validateModuleSegment(segment);
    const composed = `${value}/${next}` as `${Value}/${ModuleSegmentValue<Next>}`;
    return createComposer(composed);
  };

  const annotations = <SchemaType = unknown, const Next extends TString.NonEmpty = TString.NonEmpty>(
    identifier: SegmentValue<Next>,
    extras?: undefined | SchemaAnnotationExtras<SchemaType>
  ) => {
    const next = validateSegment(identifier);
    const composed = `${value}/${next}` as `${Value}/${SegmentValue<Next>}`;
    const annotation = {
      schemaId: toIdentitySymbol(composed),
      identifier: next,
      title: toTitle(next),
    } as IdentityAnnotation<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>>;

    if (extras === undefined) {
      return annotation as IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, SchemaType>;
    }

    return {
      ...annotation,
      ...extras,
    } as IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, SchemaType>;
  };

  const tag = ((strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>) => {
    if (values.length > 0) {
      throw new Error("Identity template tags do not allow interpolations.");
    }
    if (strings.length !== 1) {
      throw new Error("Identity template tags must use a single literal segment.");
    }
    const segment = validateModuleSegment(strings[0] as TString.NonEmpty);
    const composed = `${value}/${segment}` as `${Value}/${string}`;
    return toIdentityString(composed);
  }) as unknown as IdentityComposer<Value>;

  return Object.assign(tag, {
    value: identityValue,
    identifier: identityValue,
    compose: composeNext,
    create: composeNext,
    make: <const Next extends TString.NonEmpty>(segment: SegmentValue<Next>) => {
      const next = validateSegment(segment);
      const composed = `${value}/${next}` as `${Value}/${SegmentValue<Next>}`;
      return toIdentityString(composed);
    },
    string: () => identityValue,
    symbol: () => toIdentitySymbol(value),
    annotate: annotations,
  });
};

/**
 * @since 0.0.0
 * @category constructors
 */
export const make = <const Base extends TString.NonEmpty>(base: Base) => {
  const normalized = normalizeBase(base);
  const baseIdentity = createBaseIdentity(normalized);
  const composer = createComposer(baseIdentity);
  const key = toTaggedKey(normalized);

  return {
    [key]: composer,
  } as {
    readonly [K in typeof key]: IdentityComposer<BaseIdentity<Base>>;
  };
};
