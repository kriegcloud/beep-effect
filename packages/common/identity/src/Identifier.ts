/**
 * Identifier v2 — tagged template friendly identity composers with `$` accessors.
 *
 * @example
 * import * as Identifier from "@beep/identity/Identifier";
 *
 * const { $BeepId } = Identifier.make("beep");
 * const { $SchemaId } = $BeepId.compose("schema");
 * const serviceId = $SchemaId`TenantService`;
 *
 * @category Identity/Builder
 */
import type { StringTypes } from "@beep/types";
import * as A from "effect/Array";
import * as E from "effect/Either";
import * as F from "effect/Function";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  BaseSegment,
  InvalidBaseError,
  InvalidModuleSegmentError,
  InvalidSegmentError,
  ModuleCharacters,
  ModuleLeadingAlpha,
  Segment,
} from "./schema";
import type {
  IdentityAnnotation,
  IdentityAnnotationResult,
  IdentityString,
  IdentitySymbol,
  ModuleAccessor,
  ModuleSegmentValue,
  SchemaAnnotationExtras,
  SegmentValue,
} from "./types";

const BEEP_NAMESPACE = "@beep" as const;

const toIdentityString = <Value extends StringTypes.NonEmptyString>(value: Value): IdentityString<Value> =>
  value as IdentityString<Value>;

const toIdentitySymbol = <Value extends StringTypes.NonEmptyString>(value: Value): IdentitySymbol<Value> =>
  Symbol.for(value) as IdentitySymbol<Value>;

const toTitle = <const Title extends StringTypes.NonEmptyString>(identifier: Title): string =>
  F.pipe(
    identifier,
    Str.replace(/[_-]+/g, " "),
    Str.trim,
    Str.split(" "),
    A.filter(Str.isNonEmpty),
    A.map((segment) => {
      const head = F.pipe(segment, Str.slice(0, 1));
      const tail = F.pipe(segment, Str.slice(1));
      const capitalizedHead = F.pipe(head, Str.toUpperCase);
      return `${capitalizedHead}${tail}`;
    }),
    A.join(" ")
  );

type ModulePascal<Segment extends StringTypes.NonEmptyString> =
  ModuleAccessor<Segment> extends `${infer Pascal}Id` ? Pascal : never;

const toPascalIdentifier = <const Segment extends StringTypes.NonEmptyString>(
  segment: Segment
): ModulePascal<Segment> => F.pipe(segment, toTitle, Str.replace(/\s+/g, "")) as ModulePascal<Segment>;

const toTaggedKey = <const Segment extends StringTypes.NonEmptyString>(segment: Segment): TaggedAccessor<Segment> =>
  `$${toPascalIdentifier(segment)}Id` as TaggedAccessor<Segment>;

const ensureSegment = <const Value extends StringTypes.NonEmptyString>(segment: Value): Value => {
  if (!Str.isString(segment)) {
    throw new InvalidSegmentError({ value: String(segment), reason: "Identity segments must be strings." });
  }
  if (!F.pipe(segment, Str.isNonEmpty)) {
    throw new InvalidSegmentError({ value: segment, reason: "Identity segments cannot be empty." });
  }
  if (F.pipe(segment, Str.startsWith("/"))) {
    throw new InvalidSegmentError({ value: segment, reason: 'Identity segments cannot start with "/"' });
  }
  if (F.pipe(segment, Str.endsWith("/"))) {
    throw new InvalidSegmentError({ value: segment, reason: 'Identity segments cannot end with "/"' });
  }
  return segment as Value;
};

const ensureModuleSegment = <const Value extends StringTypes.NonEmptyString>(segment: Value): Value => {
  const ensured = ensureSegment(segment);
  if (!S.is(ModuleCharacters)(ensured)) {
    throw new InvalidModuleSegmentError({
      value: ensured,
      reason: "Module segments must contain only alphanumeric characters, hyphens, or underscores.",
    });
  }
  if (!S.is(ModuleLeadingAlpha)(ensured)) {
    throw new InvalidModuleSegmentError({
      value: ensured,
      reason: "Module segments must start with an alphabetic character to create valid accessors.",
    });
  }
  const decoded = S.decodeUnknownEither(Segment)(ensured);
  if (E.isLeft(decoded)) {
    const reason = decoded.left.message;
    throw new InvalidModuleSegmentError({ value: ensured, reason });
  }
  return decoded.right as unknown as Value;
};

const ensureBaseSegment = <const Value extends StringTypes.NonEmptyString>(value: Value): Value => {
  if (!Str.isString(value)) {
    throw new InvalidBaseError({ value: String(value), reason: "Identity bases must be strings." });
  }
  const decoded = S.decodeUnknownEither(BaseSegment)(value);
  if (E.isLeft(decoded)) {
    const reason = decoded.left.message;
    throw new InvalidBaseError({
      value,
      reason,
    });
  }
  return decoded.right as unknown as Value;
};

const normalizeBase = <const Base extends StringTypes.NonEmptyString>(base: Base): NormalizedBase<Base> => {
  if (!Str.isString(base)) {
    throw new TypeError("Identity bases must be strings.");
  }
  const namespaceValue = F.pipe(BEEP_NAMESPACE, Str.replace(/^@/, ""));
  const namespaceWithSlash = `${BEEP_NAMESPACE}/`;
  const strippedNamespace = F.pipe(base, (value) => {
    if (F.pipe(value, Str.startsWith(namespaceWithSlash))) {
      return F.pipe(value, Str.slice(Str.length(namespaceWithSlash)));
    }
    if (F.pipe(value, Str.startsWith(BEEP_NAMESPACE))) {
      if (Str.length(value) === Str.length(BEEP_NAMESPACE)) {
        return namespaceValue;
      }
      return F.pipe(value, Str.slice(Str.length(BEEP_NAMESPACE)));
    }
    return value;
  });
  const strippedLeadingAt = F.pipe(strippedNamespace, (value) =>
    F.pipe(value, Str.startsWith("@")) ? F.pipe(value, Str.slice(1)) : value
  );
  const ensured = ensureBaseSegment(strippedLeadingAt as StringTypes.NonEmptyString);
  return ensured as NormalizedBase<Base>;
};

const createBaseIdentity = <const Base extends StringTypes.NonEmptyString>(
  base: NormalizedBase<Base>
): BaseIdentity<Base> => {
  if (base === "beep") {
    return BEEP_NAMESPACE as BaseIdentity<Base>;
  }
  return `${BEEP_NAMESPACE}/${base}` as BaseIdentity<Base>;
};

const createAnnotations = <const Value extends StringTypes.NonEmptyString>(value: Value) =>
  (<SchemaType = unknown, Next extends StringTypes.NonEmptyString = StringTypes.NonEmptyString>(
    identifier: SegmentValue<Next>,
    extras?: SchemaAnnotationExtras<SchemaType>
  ) => {
    const next = ensureSegment(identifier);
    const composed = `${value}/${next}` as `${Value}/${SegmentValue<Next>}`;
    const base = {
      schemaId: toIdentitySymbol(composed),
      identifier: next,
      title: toTitle(next),
    } satisfies IdentityAnnotation<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>>;
    if (extras === undefined) {
      return base as IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, SchemaType>;
    }
    return { ...base, ...extras } as IdentityAnnotationResult<
      `${Value}/${SegmentValue<Next>}`,
      SegmentValue<Next>,
      SchemaType
    >;
  }) as TaggedComposer<Value>["annotations"];

const createComposer = <const Value extends StringTypes.NonEmptyString>(value: Value): TaggedComposer<Value> => {
  const identityValue = toIdentityString(value);
  const tag = ((strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>) => {
    if (values.length > 0) {
      throw new Error("Identifier template tags do not allow interpolations.");
    }
    if (strings.length !== 1) {
      throw new Error("Identifier template tags must use a single literal segment.");
    }
    const raw = strings[0];
    const segment = ensureModuleSegment(raw as StringTypes.NonEmptyString);
    const composed = `${value}/${segment}` as `${Value}/${ModuleSegmentValue<StringTypes.NonEmptyString>}`;
    return toIdentityString(composed);
  }) as TaggedComposer<Value>;
  tag.value = identityValue;
  tag.identifier = identityValue;
  tag.string = () => identityValue;
  tag.symbol = () => toIdentitySymbol(value);
  tag.make = <Next extends StringTypes.NonEmptyString>(segment: SegmentValue<Next>) => {
    const next = ensureSegment(segment);
    return toIdentityString(`${value}/${next}` as `${Value}/${SegmentValue<Next>}`);
  };
  tag.compose = <
    const Segments extends readonly [
      ModuleSegmentValue<StringTypes.NonEmptyString>,
      ...ModuleSegmentValue<StringTypes.NonEmptyString>[],
    ],
  >(
    ...segments: Segments
  ) => {
    const entries = F.pipe(
      segments,
      A.map((segment) => {
        const ensured = ensureModuleSegment(segment);
        const composed = `${value}/${ensured}` as `${Value}/${ModuleSegmentValue<StringTypes.NonEmptyString>}`;
        const composer = createComposer(composed);
        return [toTaggedKey(ensured), composer] as const;
      })
    );
    return R.fromEntries(entries) as TaggedModuleRecord<Value, Segments>;
  };
  tag.annotations = createAnnotations(value);
  tag.create = <const Segment extends ModuleSegmentValue<StringTypes.NonEmptyString>>(
    segment: Segment
  ): TaggedComposerResult<Value, Segment> => {
    const next = ensureSegment(segment);
    const composed = `${value}/${next}` as `${Value}/${SegmentValue<Segment>}`;
    return createComposer(composed);
  };

  return tag;
};

/**
 * Build the root `$<Base>Id` composer for the given base segment(s).
 *
 * @example
 * const { $BeepId } = Identifier.make("beep");
 * const { $SchemaId } = $BeepId.compose("schema");
 */
export const make = <const Base extends StringTypes.NonEmptyString>(base: Base) => {
  const normalizedBase = normalizeBase(base);
  const baseIdentity = createBaseIdentity(normalizedBase);
  const composer = createComposer(baseIdentity);
  const key = toTaggedKey(normalizedBase);
  return {
    [key]: composer,
  } as {
    readonly [Key in typeof key]: TaggedComposer<BaseIdentity<Base>>;
  };
};

export type TaggedAccessor<S extends StringTypes.NonEmptyString> = `$${ModuleAccessor<S>}`;

export type TaggedComposer<Value extends StringTypes.NonEmptyString> = {
  <const Segment extends ModuleSegmentValue<StringTypes.NonEmptyString>>(
    strings: readonly [Segment]
  ): IdentityString<`${Value}/${Segment}`>;
  (
    strings: TemplateStringsArray,
    ...values: ReadonlyArray<unknown>
  ): IdentityString<`${Value}/${ModuleSegmentValue<StringTypes.NonEmptyString>}`>;
  value: IdentityString<Value>;
  identifier: IdentityString<Value>;
  compose<
    const Segments extends readonly [
      ModuleSegmentValue<StringTypes.NonEmptyString>,
      ...ModuleSegmentValue<StringTypes.NonEmptyString>[],
    ],
  >(...segments: Segments): TaggedModuleRecord<Value, Segments>;
  make<Next extends StringTypes.NonEmptyString>(
    segment: SegmentValue<Next>
  ): IdentityString<`${Value}/${SegmentValue<Next>}`>;
  string(): IdentityString<Value>;
  symbol(): IdentitySymbol<Value>;
  annotations<SchemaType = unknown, Next extends StringTypes.NonEmptyString = StringTypes.NonEmptyString>(
    identifier: SegmentValue<Next>,
    extras?: SchemaAnnotationExtras<SchemaType>
  ): IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, SchemaType>;
  create<const Segment extends ModuleSegmentValue<StringTypes.NonEmptyString>>(
    segment: Segment
  ): TaggedComposerResult<Value, Segment>;
};

export type TaggedModuleRecord<
  Value extends StringTypes.NonEmptyString,
  Segments extends ReadonlyArray<StringTypes.NonEmptyString>,
> = Segments extends readonly [
  infer Head extends StringTypes.NonEmptyString,
  ...infer Tail extends ReadonlyArray<StringTypes.NonEmptyString>,
]
  ? {
      readonly [Key in TaggedAccessor<Head>]: TaggedComposer<`${Value}/${ModuleSegmentValue<Head>}`>;
    } & TaggedModuleRecord<Value, Tail>
  : {};

export type TaggedComposerResult<
  Value extends StringTypes.NonEmptyString,
  Segment extends ModuleSegmentValue<StringTypes.NonEmptyString>,
> = TaggedComposer<`${Value}/${Segment}`>;

type NormalizedBase<Base extends StringTypes.NonEmptyString> =
  Base extends `@beep/${infer Rest extends StringTypes.NonEmptyString}`
    ? Rest
    : Base extends "@beep"
      ? "beep"
      : Base extends `@${infer Rest extends StringTypes.NonEmptyString}`
        ? Rest
        : Base;

export type BaseIdentity<Base extends StringTypes.NonEmptyString> =
  NormalizedBase<Base> extends "beep" ? typeof BEEP_NAMESPACE : `${typeof BEEP_NAMESPACE}/${NormalizedBase<Base>}`;

export const __internal = {
  ensureSegment,
  ensureModuleSegment,
  ensureBaseSegment,
  normalizeBase,
  toTaggedKey,
  toPascalIdentifier,
  toTitle,
};
