import {UnsafeTypes} from "@beep/shared/types";
import * as Arbitrary from "effect/Arbitrary";
import * as Arr from "effect/Array";
import * as Equivalence from "effect/Equivalence";
import * as FC from "effect/FastCheck";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Pretty from "effect/Pretty";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";

/* -------------------------------------------------------------------------------------------------
 * Annotations: developer-safe envelope (REQUIRES title, description, identifier)
 * ------------------------------------------------------------------------------------------------- */

/**
 * @category annotations
 * A documentation block guaranteed to carry a `title` and `description`.
 */
export declare namespace Annotations {
  export interface Doc<A> extends AST.Annotations {
    readonly title: AST.TitleAnnotation;
    readonly description: AST.DescriptionAnnotation;
    readonly documentation?: AST.DocumentationAnnotation;
    readonly examples?: AST.ExamplesAnnotation<A>;
    readonly default?: AST.DefaultAnnotation<A>;
  }

  /**
   * @category annotations
   * A schema annotation bundle that **requires**:
   * - `identifier` (for Effect Schema’s identity),
   * - `title`, `description` for dev/UX & docs.
   *
   * You can optionally enrich with `arbitrary`, `pretty`, `equivalence`, JSON Schema metadata, etc.
   */
  export interface Schema<A, TP extends UnsafeTypes.UnsafeReadonlyArray = readonly []> extends Doc<A> {
    readonly identifier: AST.IdentifierAnnotation;
    readonly message?: AST.MessageAnnotation;
    readonly schemaId?: AST.SchemaIdAnnotation;
    readonly jsonSchema?: AST.JSONSchemaAnnotation;
    readonly arbitrary?: Arbitrary.ArbitraryAnnotation<A, TP>;
    readonly pretty?: Pretty.PrettyAnnotation<A, TP>;
    readonly equivalence?: AST.EquivalenceAnnotation<A, TP>;
    readonly concurrency?: AST.ConcurrencyAnnotation;
    readonly batching?: AST.BatchingAnnotation;
    readonly parseIssueTitle?: AST.ParseIssueTitleAnnotation;
    readonly parseOptions?: AST.ParseOptions;
    readonly decodingFallback?: AST.DecodingFallbackAnnotation<A>;
  }

  /**
   * Runtime-parameterized version for `arbitrary`/`pretty`/`equivalence`.
   */
  export interface GenericSchema<A> extends Schema<A> {
    readonly arbitrary?: (..._: UnsafeTypes.UnsafeAny) => Arbitrary.LazyArbitrary<A>;
    readonly pretty?: (..._: UnsafeTypes.UnsafeAny) => Pretty.Pretty<A>;
    readonly equivalence?: (..._: UnsafeTypes.UnsafeAny) => Equivalence.Equivalence<A>;
  }

  /** Filter annotations (Effect-internal shape, included for completeness). */
  export interface Filter<A, P = A> extends Schema<A, readonly [P]> {
  }
}

/**
 * Merge annotations into a schema (curried or uncurried).
 * Returns `S.Annotable.Self<S>` as per Effect.
 */
export const annotate: {
  <Sx extends S.Annotable.All>(annotations: Annotations.GenericSchema<S.Schema.Type<Sx>>): (self: Sx) => S.Annotable.Self<Sx>;
  <Sx extends S.Annotable.All>(self: Sx, annotations: Annotations.GenericSchema<S.Schema.Type<Sx>>): S.Annotable.Self<Sx>;
} = F.dual(
  2,
  <A, I, R>(self: S.Schema<A, I, R>, annotations: Annotations.GenericSchema<A>): S.Schema<A, I, R> =>
    self.annotations(annotations)
);

/* -------------------------------------------------------------------------------------------------
 * Dev-time guard: ensure required annotations exist (identifier/title/description)
 * ------------------------------------------------------------------------------------------------- */

const __DEV__: boolean =
  typeof process !== "undefined" &&
  !!process.env &&
  process.env.NODE_ENV !== "production";

/**
 * Assert that a schema carries the required annotations.
 * No-op in production; throws a readable error in dev.
 */

/**
 * Assert that an AST node (schema or derived) carries the required annotations.
 * No-op in production; throws a readable error in dev.
 *
 * Accepts `AST.Annotated` because annotations live on the AST node.
 */
export const assertRequiredAnnotations = (annotated: AST.Annotated): void => {
  if (!__DEV__) return;

  const idOpt = AST.getAnnotation(annotated, AST.IdentifierAnnotationId);
  const titleOpt = AST.getAnnotation(annotated, AST.TitleAnnotationId);
  const descriptionOpt = AST.getAnnotation(annotated, AST.DescriptionAnnotationId);

  // Build a *pure* list of missing keys (no mutation).
  const missing = Arr.filterMap(
    [
      ["identifier", idOpt] as const,
      ["title", titleOpt] as const,
      ["description", descriptionOpt] as const,
    ] as const,
    ([label, opt]) => (O.isNone(opt) ? O.some(label) : O.none())
  );

  if (missing.length === 0) return;

  // Choose a human-friendly schema name for the error message.
  const name =
    O.getOrElse(
      O.orElse(
        idOpt,
        () => AST.getAnnotation(annotated, AST.SchemaIdAnnotationId)
      ),
      () => "(anonymous)"
    ) as string;

  throw new Error(
    `Schema ${name} is missing required annotations: ${missing.join(", ")}`
  );
};


/* -------------------------------------------------------------------------------------------------
 * Mock utilities (FastCheck + Effect Arbitrary) with precise return types
 * ------------------------------------------------------------------------------------------------- */

type ArbParamsBase = {
  /** Number of samples to generate (default 1). */
  qty?: number;
  /** If true and qty===1, return a single value instead of an array. */
  flat?: boolean;
  /** Optional random seed for deterministic output. */
  seed?: number;
};

type BoundMock<A, I, R> = ArbParamsBase & {
  _tag: "bound";
  schema: S.Schema<A, I, R>;
};
type TypeMock<A, I, R> = ArbParamsBase & {
  _tag: "type";
  schema: S.Schema<A, I, R>;
};
type EncodedMock<A, I, R> = ArbParamsBase & {
  _tag: "encoded";
  schema: S.Schema<A, I, R>;
};
type Mock<A, I, R> = BoundMock<A, I, R> | TypeMock<A, I, R> | EncodedMock<A, I, R>;

/** FC.sample wrapper that supports an optional seed. */
const sample = <T>(arb: FC.Arbitrary<T>, qty: number, seed?: number): readonly T[] => {
  return seed != null ? FC.sample(arb, {numRuns: qty, seed}) : FC.sample(arb, {numRuns: qty});
};

/**
 * If `qty === 1` and `flat === true`, unwrap the single element; otherwise return the array.
 * (Avoided generic name collision with Arr import.)
 */
export const makeFlat = <T extends UnsafeTypes.UnsafeReadonlyArray>(
  xs: T,
  qty: number,
  flat: boolean
) => (qty === 1 && flat ? Arr.flatten(xs) : xs);

/** Overloads for precise return shapes (single vs array). */
/** Overloads for precise return shapes (single vs array). */
export function makeMocked<A, I, R>(params: Mock<A, I, R> & {
  qty?: 1;
  flat?: true
}): A | S.Schema.Encoded<S.Schema<A, I, R>> | S.Schema.Context<S.Schema<A, I, R>>;
export function makeMocked<A, I, R>(params: Mock<A, I, R>): readonly (A | S.Schema.Encoded<S.Schema<A, I, R>> | S.Schema.Context<S.Schema<A, I, R>>)[];

/** Implementation: use a broad return type compatible with both overloads. */
export function makeMocked<A, I, R>(params: Mock<A, I, R>): unknown {
  const {schema, flat = false, qty = 1, seed} = params;
  return Match.value(params).pipe(
    Match.tags({
      bound: () => makeFlat(
        sample(Arbitrary.make(S.encodedBoundSchema(schema)), qty, seed),
        qty, flat
      ),
      type: () => makeFlat(
        sample(Arbitrary.make(S.typeSchema(schema)), qty, seed),
        qty, flat
      ),
      encoded: () => makeFlat(
        sample(Arbitrary.make(S.encodedSchema(schema)), qty, seed),
        qty, flat
      ),
    })
  );
}

/** Overloads for the curried factory. */
export function makeMocker<A, I, R>(
  schema: S.Schema<A, I, R>
): (kind: "bound" | "type" | "encoded", qty?: 1, flat?: true, seed?: number) =>
  A | S.Schema.Encoded<S.Schema<A, I, R>> | S.Schema.Context<S.Schema<A, I, R>>;
export function makeMocker<A, I, R>(
  schema: S.Schema<A, I, R>
): (kind: "bound" | "type" | "encoded", qty?: number, flat?: boolean, seed?: number) =>
  readonly (A | S.Schema.Encoded<S.Schema<A, I, R>> | S.Schema.Context<S.Schema<A, I, R>>)[];

/** Implementation: broad return type (`unknown`) that satisfies both overloads. */
export function makeMocker<A, I, R>(schema: S.Schema<A, I, R>) {
  return (kind: "bound" | "type" | "encoded", qty?: number, flat?: boolean, seed?: number): unknown =>
    Match.value(kind).pipe(
      Match.when("bound", () => makeMocked({schema, _tag: "bound", qty, flat, seed})),
      Match.when("type", () => makeMocked({schema, _tag: "type", qty, flat, seed})),
      Match.when("encoded", () => makeMocked({schema, _tag: "encoded", qty, flat, seed}))
    );
}