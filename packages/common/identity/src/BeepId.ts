/**
 * Concrete implementation for namespace-safe identity string and symbol creation.
 *
 * @example
 * import * as Identity from "@beep/identity/BeepId";
 *
 * const runtimeLayerId = Identity.BeepId.module("runtime-server").compose("layers").make("Managed");
 *
 * @category Identity/Builder
 * @since 0.1.0
 */
import type { StringTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

import type {
  IdentityAnnotation,
  IdentityAnnotationResult,
  IdentityComposer,
  IdentityString,
  IdentitySymbol,
  ModulePath,
  SchemaAnnotationExtras,
  SegmentTuple,
  SegmentValue,
} from "./types";

const BEEP_NAMESPACE = "@beep" as const;

const toIdentityString = <Value extends string>(value: Value): IdentityString<Value> => value as IdentityString<Value>;

const toIdentitySymbol = <Value extends string>(value: Value): IdentitySymbol<Value> =>
  Symbol.for(value) as IdentitySymbol<Value>;

const joinSegments = (segments: ReadonlyArray<string>) => F.pipe(segments, A.join("/" as const));

const toTitle = (identifier: string): string =>
  F.pipe(
    identifier,
    Str.replace(/[_-]+/g, " "),
    Str.replace(/([a-z0-9])([A-Z])/g, "$1 $2"),
    Str.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2"),
    Str.trim,
    Str.split(" "),
    A.filter(Str.isNonEmpty),
    A.map((segment) => F.pipe(segment, Str.toLowerCase, Str.capitalize)),
    A.join(" ")
  );

const ensureSegment = <Value extends string>(segment: Value): Value => {
  if (!Str.isString(segment)) {
    throw new TypeError("Identity segments must be strings.");
  }
  if (F.pipe(segment, Str.isEmpty)) {
    throw new Error("Identity segments cannot be empty.");
  }
  if (F.pipe(segment, Str.startsWith("/"))) {
    throw new Error('Identity segments cannot start with "/".');
  }
  if (F.pipe(segment, Str.endsWith("/"))) {
    throw new Error('Identity segments cannot end with "/".');
  }
  return segment;
};

const ensureBase = <Value extends StringTypes.NonEmptyString>(value: Value): Value => {
  if (!Str.isString(value)) {
    throw new TypeError("Identity bases must be strings.");
  }
  if (F.pipe(value, Str.isEmpty)) {
    throw new Error("Identity bases cannot be empty.");
  }
  return value;
};

const createComposer: <Value extends string>(value: Value) => IdentityComposer<Value> = <Value extends string>(
  value: Value
): IdentityComposer<Value> => {
  const identityValue = toIdentityString(value);
  return {
    value: identityValue,
    identifier: identityValue,
    compose<Next extends StringTypes.NonEmptyString>(segment: SegmentValue<Next>) {
      const next = ensureSegment(segment);
      return createComposer(`${value}/${next}` as `${Value}/${SegmentValue<Next>}`);
    },
    make<Next extends StringTypes.NonEmptyString>(segment: SegmentValue<Next>) {
      const next = ensureSegment(segment);
      return toIdentityString(`${value}/${next}` as `${Value}/${SegmentValue<Next>}`);
    },
    string() {
      return identityValue;
    },
    symbol() {
      return toIdentitySymbol(value);
    },
    annotations: (<SchemaType = unknown, Next extends StringTypes.NonEmptyString = StringTypes.NonEmptyString>(
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
    }) as IdentityComposer<Value>["annotations"],
  } satisfies IdentityComposer<Value>;
};

const makeModule: <const Segments extends SegmentTuple>(
  ...segments: Segments
) => IdentityComposer<ModulePath<Segments>> = <const Segments extends SegmentTuple>(...segments: Segments) => {
  const sanitizedSegments = F.pipe(segments, A.map(ensureSegment));
  const namespaced = F.pipe(sanitizedSegments, A.prepend(BEEP_NAMESPACE));
  const value = joinSegments(namespaced);
  return createComposer(value) as IdentityComposer<ModulePath<Segments>>;
};

const fromBase: <Value extends StringTypes.NonEmptyString>(value: Value) => IdentityComposer<Value> = <
  Value extends StringTypes.NonEmptyString,
>(
  value: Value
) => createComposer(ensureBase(value));

type ModuleFactory = <const Segments extends SegmentTuple>(
  ...segments: Segments
) => IdentityComposer<ModulePath<Segments>>;
type BaseFactory = <Value extends StringTypes.NonEmptyString>(value: Value) => IdentityComposer<Value>;

/**
 * Identity builder entry points for `@beep/*` namespaces.
 *
 * @example
 * import * as Identity from "@beep/identity/BeepId";
 *
 * const schemaId = Identity.BeepId.module("schema");
 * const payloadId = schemaId.compose("annotations").make("PasskeyAddPayload");
 *
 * @category Identity/Builder
 * @since 0.1.0
 */
export const BeepId: {
  readonly module: ModuleFactory;
  readonly from: BaseFactory;
} = {
  module: makeModule,
  from: fromBase,
} satisfies {
  readonly module: ModuleFactory;
  readonly from: BaseFactory;
};
