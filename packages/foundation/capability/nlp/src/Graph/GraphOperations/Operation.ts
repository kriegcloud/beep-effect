/**
 * GraphOperations/Operation - the core graph-operation abstraction.
 *
 * A {@link GraphOperation} is a morphism in the category of graphs: it maps a
 * node of data `A` to an array of child nodes of data `B`, possibly requiring
 * context `R` and failing with `E`, alongside validation and cost-estimation.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * - operations that mint nodes are EFFECTFUL ({@link pure}/{@link identity} use
 *   `EffectGraph.makeNode`/`generateNodeId`, which read `Clock`/`Random`) instead
 *   of adjunct's synchronous `EG.makeNode` + `NodeId.generate()`.
 * - native `Array#map` becomes `effect/Array` + `Effect.forEach`.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { A } from "@beep/utils";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { generateNodeId, makeNode } from "../EffectGraph.ts";
import * as Types from "./Types.ts";
import type { GraphNode } from "../EffectGraph.ts";
import type { OperationCategory, OperationCost, ValidationResult } from "./Types.ts";

// =============================================================================
// Core Operation Interface
// =============================================================================

/**
 * A categorical morphism in the category of graphs: `Node<A> -> Effect<[Node<B>], E, R>`.
 *
 * @since 0.0.0
 * @category models
 */
export interface GraphOperation<A, B, R = never, E = never> {
  /** Apply the operation to a single node, producing child nodes. */
  readonly apply: (node: GraphNode<A>) => Effect.Effect<ReadonlyArray<GraphNode<B>>, E, R>;
  readonly category: OperationCategory;
  readonly description: string;
  /** Estimate the cost of applying the operation to a node. */
  readonly estimateCost: (node: GraphNode<A>) => Effect.Effect<OperationCost>;
  readonly name: string;
  /** Validate that the operation can be applied to a node. */
  readonly validate: (node: GraphNode<A>) => Effect.Effect<ValidationResult>;
}

// =============================================================================
// Operation Constructors
// =============================================================================

/**
 * Build a {@link GraphOperation} from a config, defaulting validate/estimateCost.
 *
 * @example
 * ```ts
 * import { make } from "@beep/nlp/Graph/GraphOperations/Operation"
 * import * as Effect from "effect/Effect"
 *
 * console.log(make({ name: "noop", description: "", category: "transformation", apply: () => Effect.succeed([]) }).name)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const make = <A, B, R = never, E = never>(config: {
  readonly apply: (node: GraphNode<A>) => Effect.Effect<ReadonlyArray<GraphNode<B>>, E, R>;
  readonly category: OperationCategory;
  readonly description: string;
  readonly estimateCost?: (node: GraphNode<A>) => Effect.Effect<OperationCost>;
  readonly name: string;
  readonly validate?: (node: GraphNode<A>) => Effect.Effect<ValidationResult>;
}): GraphOperation<A, B, R, E> => ({
  apply: config.apply,
  category: config.category,
  description: config.description,
  estimateCost: config.estimateCost ?? (() => Effect.succeed(Types.OperationCost.zero())),
  name: config.name,
  validate: config.validate ?? (() => Effect.succeed(Types.ValidationResult.valid())),
});

/**
 * A pure operation: map node data to new data values, minting a child node per
 * produced value (effectful only via the node id/clock).
 *
 * @example
 * ```ts
 * import { pure } from "@beep/nlp/Graph/GraphOperations/Operation"
 *
 * console.log(pure({ name: "dup", description: "", category: "expansion", f: (s: string) => [s, s] }).name)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const pure = <A, B>(config: {
  readonly category: OperationCategory;
  readonly description: string;
  readonly f: (data: A) => ReadonlyArray<B>;
  readonly name: string;
}): GraphOperation<A, B> =>
  make({
    apply: (node) => Effect.forEach(config.f(node.data), (b) => makeNode(b, O.some(node.id), O.some(config.name))),
    category: config.category,
    description: config.description,
    name: config.name,
  });

/**
 * A transformation operation (`A -> B`).
 *
 * @example
 * ```ts
 * import { transform } from "@beep/nlp/Graph/GraphOperations/Operation"
 *
 * console.log(transform({ name: "up", description: "", f: (s: string) => s.toUpperCase() }).category)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const transform = <A, B>(config: {
  readonly description: string;
  readonly f: (data: A) => B;
  readonly name: string;
}): GraphOperation<A, B> =>
  pure({
    category: "transformation",
    description: config.description,
    f: (data) => A.of(config.f(data)),
    name: config.name,
  });

/**
 * An expansion operation (`A -> [B]`).
 *
 * @example
 * ```ts
 * import { expand } from "@beep/nlp/Graph/GraphOperations/Operation"
 *
 * console.log(expand({ name: "chars", description: "", f: (s: string) => s.split("") }).category)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const expand = <A, B>(config: {
  readonly description: string;
  readonly f: (data: A) => ReadonlyArray<B>;
  readonly name: string;
}): GraphOperation<A, B> =>
  pure({ category: "expansion", description: config.description, f: config.f, name: config.name });

/**
 * A filter operation (`A -> Option<A>`, modeled as `A -> [A]`).
 *
 * @example
 * ```ts
 * import { filter } from "@beep/nlp/Graph/GraphOperations/Operation"
 *
 * console.log(filter({ name: "nonEmpty", description: "", predicate: (s: string) => s.length > 0 }).category)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const filter = <A>(config: {
  readonly description: string;
  readonly name: string;
  readonly predicate: (data: A) => boolean;
}): GraphOperation<A, A> =>
  pure({
    category: "filtering",
    description: config.description,
    f: (data) => (config.predicate(data) ? A.of(data) : A.empty<A>()),
    name: config.name,
  });

// =============================================================================
// Identity & Basic Combinators
// =============================================================================

/**
 * The identity operation: re-emits the node under a fresh id (effectful id).
 *
 * Law: `id ∘ f = f = f ∘ id`.
 *
 * @example
 * ```ts
 * import { identity } from "@beep/nlp/Graph/GraphOperations/Operation"
 *
 * console.log(identity<string>().name)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const identity = <A>(): GraphOperation<A, A> =>
  make({
    apply: (node) => Effect.map(generateNodeId, (id) => A.of({ ...node, id, parentId: O.some(node.id) })),
    category: "transformation",
    description: "Identity operation (no transformation)",
    name: "identity",
  });

/**
 * Map operation - transform data without changing structure.
 *
 * @example
 * ```ts
 * import { map } from "@beep/nlp/Graph/GraphOperations/Operation"
 *
 * console.log(map((s: string) => s.length).name)
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const map = <A, B>(f: (a: A) => B): GraphOperation<A, B> =>
  transform({ description: "Map with function", f, name: "map" });

/**
 * FlatMap operation - map and flatten.
 *
 * @example
 * ```ts
 * import { flatMap } from "@beep/nlp/Graph/GraphOperations/Operation"
 *
 * console.log(flatMap((s: string) => s.split("")).name)
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const flatMap = <A, B>(f: (a: A) => ReadonlyArray<B>): GraphOperation<A, B> =>
  expand({ description: "FlatMap with function", f, name: "flatMap" });

// =============================================================================
// Metadata Helpers
// =============================================================================

/**
 * Get an operation's category.
 *
 * @since 0.0.0
 * @category getters
 */
export const getCategory = <A, B, R, E>(operation: GraphOperation<A, B, R, E>): OperationCategory => operation.category;
