/**
 * Identifier v2 — tagged template friendly identity composers with `$` accessors.
 *
 * @example
 * ```typescript
 * import * as Identifier from "@beep/identity/Identifier"
 *
 * const { $BeepId } = Identifier.make("beep")
 * const { $SchemaId } = $BeepId.compose("schema")
 * const serviceId = $SchemaId`TenantService`
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
import type { StringTypes } from "@beep/types";
import * as A from "effect/Array";
import * as E from "effect/Either";
import * as F from "effect/Function";
import * as MutableHashSet from "effect/MutableHashSet";
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

type Registry = MutableHashSet.MutableHashSet<string>;

/**
 * Registers an identity value and warns if a duplicate is detected.
 * Duplicates indicate potential copy-paste errors that would cause
 * runtime Effect Context/Layer conflicts.
 *
 * @internal
 */
const registerIdentity = (registry: Registry, identity: string): void => {
  if (MutableHashSet.has(registry, identity)) {
    console.warn(
      `[beep/identity] Duplicate identity detected: "${identity}"\n` +
        `This may indicate a copy-paste error. Each identity string must be unique.\n` +
        `Duplicate Effect Context/Service tags cause runtime Layer conflicts.`
    );
  }
  MutableHashSet.add(registry, identity);
};

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

const createAnnotations = <const Value extends StringTypes.NonEmptyString>(value: Value, registry: Registry) =>
  (<SchemaType = unknown, Next extends StringTypes.NonEmptyString = StringTypes.NonEmptyString>(
    identifier: SegmentValue<Next>,
    extras?: SchemaAnnotationExtras<SchemaType>
  ) => {
    const next = ensureSegment(identifier);
    const composed = `${value}/${next}` as `${Value}/${SegmentValue<Next>}`;
    // Register with #annotation suffix to differentiate from template tag/make() usages
    // This prevents false positives when both $I`Model` and $I.annotations("Model") are used
    registerIdentity(registry, `${composed}#annotation`);
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

const createComposer = <const Value extends StringTypes.NonEmptyString>(
  value: Value,
  registry: Registry
): TaggedComposer<Value> => {
  // Register this value immediately
  registerIdentity(registry, value);

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
    registerIdentity(registry, composed);
    return toIdentityString(composed);
  }) as TaggedComposer<Value>;
  tag.value = identityValue;
  tag.identifier = identityValue;
  tag.string = () => identityValue;
  tag.symbol = () => toIdentitySymbol(value);
  tag.make = <Next extends StringTypes.NonEmptyString>(segment: SegmentValue<Next>) => {
    const next = ensureSegment(segment);
    const composed = `${value}/${next}` as `${Value}/${SegmentValue<Next>}`;
    registerIdentity(registry, composed);
    return toIdentityString(composed);
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
        const composer = createComposer(composed, registry);
        return [toTaggedKey(ensured), composer] as const;
      })
    );
    return R.fromEntries(entries) as TaggedModuleRecord<Value, Segments>;
  };
  tag.annotations = createAnnotations(value, registry);
  tag.create = <const Segment extends ModuleSegmentValue<StringTypes.NonEmptyString>>(
    segment: Segment
  ): TaggedComposerResult<Value, Segment> => {
    const next = ensureSegment(segment);
    const composed = `${value}/${next}` as `${Value}/${SegmentValue<Segment>}`;
    return createComposer(composed, registry);
  };
  (tag as { identityRegistry: typeof registry }).identityRegistry = registry;

  return tag;
};

/**
 * Creates a tagged composer factory for building strongly-typed identifiers with a specific base string.
 *
 * @category constructors
 * @example
 * ```typescript
 * import { Identifier } from "@beep/identity"
 *
 * const { $BeepId } = Identifier.make("beep")
 * const userId = $BeepId.make("User")
 * ```
 * @since 0.1.0
 */
export const make = <const Base extends StringTypes.NonEmptyString>(base: Base) => {
  const registry = MutableHashSet.empty<string>();
  const normalizedBase = normalizeBase(base);
  const baseIdentity = createBaseIdentity(normalizedBase);
  const composer = createComposer(baseIdentity, registry);
  const key = toTaggedKey(normalizedBase);
  return {
    [key]: composer,
  } as {
    readonly [Key in typeof key]: TaggedComposer<BaseIdentity<Base>>;
  };
};

/**
 * A string literal type that creates a tagged accessor by prefixing a module accessor with `$`.
 * Used for creating tagged identifiers in the beep-effect system.
 *
 * @category models
 * @example
 * ```typescript
 * import type { TaggedAccessor } from "@beep/identity/Identifier"
 *
 * type MyTaggedAccessor = TaggedAccessor<"user">
 * // Result: "$UserId"
 * ```
 * @since 0.1.0
 */
export type TaggedAccessor<S extends StringTypes.NonEmptyString> = `$${ModuleAccessor<S>}`;

/**
 * A composer interface for creating tagged module identifiers with type-safe segment composition.
 * Provides multiple ways to construct and compose module paths with compile-time validation.
 *
 * @category models
 * @example
 * ```typescript
 * import { Identifier } from "@beep/identity"
 *
 * const { $BeepId } = Identifier.make("beep")
 * const userService = $BeepId`service`
 * ```
 * @since 0.1.0
 */
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

  /**
   * Shared registry containing all identity strings created from this composer's root.
   * All child composers derived via `compose`, `create`, template tags, `make`, or
   * `annotations` share the same registry instance.
   *
   * @category Registry
   * @since 0.1.0
   * @example
   * ```typescript
   * import * as MutableHashSet from "effect/MutableHashSet";
   * import { $I } from "@beep/identity/packages";
   *
   * const values = [...MutableHashSet.values($I.identityRegistry)];
   * console.log(values); // All registered identity strings
   * ```
   */
  readonly identityRegistry: MutableHashSet.MutableHashSet<string>;
};

/**
 * Represents a record of tagged module accessors for building hierarchical module paths.
 * Each segment in the module path becomes a property with a corresponding tagged composer.
 *
 * @category models
 * @example
 * ```typescript
 * import { Identifier } from "@beep/identity"
 *
 * const { $BeepId } = Identifier.make("beep")
 * const modules = $BeepId.compose("profile", "settings")
 * ```
 * @since 0.1.0
 */
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

/**
 * Represents a tagged composer result that combines a base value with a module segment.
 * This type creates a new TaggedComposer with a path formed by joining the value and segment with a forward slash.
 *
 * @category models
 * @example
 * ```typescript
 * import type { TaggedComposerResult } from "@beep/identity/Identifier"
 *
 * type UserProfile = TaggedComposerResult<"@beep", "user">
 * ```
 * @since 0.1.0
 */
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

/**
 * Base identity type that creates a namespace-prefixed identity string.
 *
 * When the base is "beep", returns just the BEEP_NAMESPACE. Otherwise, returns
 * the namespace followed by a slash and the normalized base string.
 *
 * @category models
 * @example
 * ```typescript
 * import type { BaseIdentity } from "@beep/identity/Identifier"
 *
 * type BeepIdentity = BaseIdentity<"beep"> // "@beep"
 * type UserIdentity = BaseIdentity<"schema"> // "@beep/schema"
 * ```
 * @since 0.1.0
 */
export type BaseIdentity<Base extends StringTypes.NonEmptyString> =
  NormalizedBase<Base> extends "beep" ? typeof BEEP_NAMESPACE : `${typeof BEEP_NAMESPACE}/${NormalizedBase<Base>}`;

/**
 * Internal utilities for namespace and identifier processing.
 *
 * @category utilities
 * @example
 * ```typescript
 * import { Identifier } from "@beep/identity"
 *
 * const segment = Identifier.__internal.ensureSegment("my-segment")
 * ```
 * @since 0.1.0
 */
export const __internal = {
  ensureSegment,
  ensureModuleSegment,
  ensureBaseSegment,
  normalizeBase,
  toTaggedKey,
  toPascalIdentifier,
  toTitle,
};
