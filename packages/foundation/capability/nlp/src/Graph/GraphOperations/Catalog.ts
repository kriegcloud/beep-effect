/**
 * GraphOperations/Catalog - a library of standard NLP graph operations.
 *
 * Ready-to-use {@link Operation.GraphOperation}s that the
 * {@link Executor.GraphExecutor} can apply to a text graph. The linguistic
 * operations are backed by the pluggable {@link Backend.NLPBackend} (so they
 * require it in their context `R` and fail with {@link Backend.NLPBackendError});
 * the pure string operations are context-free transformations.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * - operations are backed by {@link Backend.NLPBackend} (the granular linguistic
 *   contract) rather than adjunct's fat `NLPService`; the thin facade `NLPService`
 *   delegates to the same backend.
 * - node creation is EFFECTFUL (`EffectGraph.makeNode` reads `Clock`/`Random`), so
 *   `apply` uses `Effect.forEach` instead of adjunct's synchronous `[].map(makeNode)`.
 * - adjunct's text-utility operations (paragraphize/normalizeWhitespace/
 *   removePunctuation/removeStopWords/stem/ngrams) are NOT backend operations; they
 *   live on the existing `Core`/`Wink` services and are folded in during the
 *   Core/Wink/Tools reconciliation (see `goals/nlp-adjunct-port`), not here.
 * - `Object.keys` becomes `Struct.keys`; the cast-based `getOperation(name)` lookup
 *   is dropped (it required `as any`).
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { A } from "@beep/utils";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";
import * as Backend from "../../Backend/NLPBackend.ts";
import { makeNode } from "../EffectGraph.ts";
import * as Op from "./Operation.ts";
import type { DependencyNode, EntityNode, LemmaNode, POSNode, RelationNode } from "../Schema.ts";

/**
 * Split text into sentences (free functor `Text -> [Sentence]`).
 *
 * @example
 * ```ts
 * import { sentencize } from "@beep/nlp/Graph/GraphOperations/Catalog"
 *
 * console.log(sentencize.name)
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export const sentencize: Op.GraphOperation<string, string, Backend.NLPBackend, Backend.NLPBackendError> = Op.make({
  apply: Effect.fn("Catalog.sentencize")(function* (node) {
    const backend = yield* Backend.NLPBackend;
    const sentences = yield* backend.sentencize(node.data);
    return yield* Effect.forEach(sentences, (sentence) => makeNode(sentence, O.some(node.id), O.some("sentencize")));
  }),
  category: "expansion",
  description: "Split text into sentences using sentence boundary detection.",
  name: "sentencize",
});

/**
 * Split text into tokens (free functor `Text -> [Token]`).
 *
 * @example
 * ```ts
 * import { tokenize } from "@beep/nlp/Graph/GraphOperations/Catalog"
 *
 * console.log(tokenize.name)
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export const tokenize: Op.GraphOperation<string, string, Backend.NLPBackend, Backend.NLPBackendError> = Op.make({
  apply: Effect.fn("Catalog.tokenize")(function* (node) {
    const backend = yield* Backend.NLPBackend;
    const tokens = yield* backend.tokenize(node.data);
    return yield* Effect.forEach(tokens, (token) => makeNode(token, O.some(node.id), O.some("tokenize")));
  }),
  category: "expansion",
  description: "Split text into tokens using the backend tokenizer.",
  name: "tokenize",
});

/**
 * Tag tokens with part-of-speech labels (functor `Text -> [POSNode]`).
 *
 * @example
 * ```ts
 * import { posTag } from "@beep/nlp/Graph/GraphOperations/Catalog"
 *
 * console.log(posTag.name)
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export const posTag: Op.GraphOperation<string, POSNode, Backend.NLPBackend, Backend.NLPBackendError> = Op.make({
  apply: Effect.fn("Catalog.posTag")(function* (node) {
    const backend = yield* Backend.NLPBackend;
    const tags = yield* backend.posTag(node.data);
    return yield* Effect.forEach(tags, (tag) => makeNode(tag, O.some(node.id), O.some("posTag")));
  }),
  category: "expansion",
  description: "Tag each token with its part-of-speech label.",
  name: "posTag",
});

/**
 * Lemmatize tokens to canonical forms (forgetful functor `Text -> [LemmaNode]`).
 *
 * @example
 * ```ts
 * import { lemmatize } from "@beep/nlp/Graph/GraphOperations/Catalog"
 *
 * console.log(lemmatize.name)
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export const lemmatize: Op.GraphOperation<string, LemmaNode, Backend.NLPBackend, Backend.NLPBackendError> = Op.make({
  apply: Effect.fn("Catalog.lemmatize")(function* (node) {
    const backend = yield* Backend.NLPBackend;
    const lemmas = yield* backend.lemmatize(node.data);
    return yield* Effect.forEach(lemmas, (lemma) => makeNode(lemma, O.some(node.id), O.some("lemmatize")));
  }),
  category: "expansion",
  description: "Reduce each token to its canonical lemma.",
  name: "lemmatize",
});

/**
 * Extract named entities (functor `Text -> [EntityNode]`).
 *
 * @example
 * ```ts
 * import { extractEntities } from "@beep/nlp/Graph/GraphOperations/Catalog"
 *
 * console.log(extractEntities.name)
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export const extractEntities: Op.GraphOperation<string, EntityNode, Backend.NLPBackend, Backend.NLPBackendError> =
  Op.make({
    apply: Effect.fn("Catalog.extractEntities")(function* (node) {
      const backend = yield* Backend.NLPBackend;
      const entities = yield* backend.extractEntities(node.data);
      return yield* Effect.forEach(entities, (entity) => makeNode(entity, O.some(node.id), O.some("extractEntities")));
    }),
    category: "expansion",
    description: "Extract named entities from text.",
    name: "extractEntities",
  });

/**
 * Parse syntactic dependencies (functor `Sentence -> [DependencyNode]`).
 *
 * @example
 * ```ts
 * import { parseDependencies } from "@beep/nlp/Graph/GraphOperations/Catalog"
 *
 * console.log(parseDependencies.name)
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export const parseDependencies: Op.GraphOperation<string, DependencyNode, Backend.NLPBackend, Backend.NLPBackendError> =
  Op.make({
    apply: Effect.fn("Catalog.parseDependencies")(function* (node) {
      const backend = yield* Backend.NLPBackend;
      const deps = yield* backend.parseDependencies(node.data);
      return yield* Effect.forEach(deps, (dep) => makeNode(dep, O.some(node.id), O.some("parseDependencies")));
    }),
    category: "expansion",
    description: "Parse syntactic dependency arcs within a sentence.",
    name: "parseDependencies",
  });

/**
 * Extract semantic relations between entities (functor `Text -> [RelationNode]`).
 *
 * @example
 * ```ts
 * import { extractRelations } from "@beep/nlp/Graph/GraphOperations/Catalog"
 *
 * console.log(extractRelations.name)
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export const extractRelations: Op.GraphOperation<string, RelationNode, Backend.NLPBackend, Backend.NLPBackendError> =
  Op.make({
    apply: Effect.fn("Catalog.extractRelations")(function* (node) {
      const backend = yield* Backend.NLPBackend;
      const relations = yield* backend.extractRelations(node.data);
      return yield* Effect.forEach(relations, (relation) =>
        makeNode(relation, O.some(node.id), O.some("extractRelations"))
      );
    }),
    category: "expansion",
    description: "Extract semantic relations between entities.",
    name: "extractRelations",
  });

/**
 * Lowercase the node text (pure transformation).
 *
 * @example
 * ```ts
 * import { toLowerCase } from "@beep/nlp/Graph/GraphOperations/Catalog"
 *
 * console.log(toLowerCase.name)
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export const toLowerCase: Op.GraphOperation<string, string> = Op.transform({
  description: "Convert text to lowercase.",
  f: (data) => data.toLowerCase(),
  name: "toLowerCase",
});

/**
 * Uppercase the node text (pure transformation).
 *
 * @example
 * ```ts
 * import { toUpperCase } from "@beep/nlp/Graph/GraphOperations/Catalog"
 *
 * console.log(toUpperCase.name)
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export const toUpperCase: Op.GraphOperation<string, string> = Op.transform({
  description: "Convert text to uppercase.",
  f: (data) => data.toUpperCase(),
  name: "toUpperCase",
});

/**
 * Trim leading/trailing whitespace from the node text (pure transformation).
 *
 * @example
 * ```ts
 * import { trim } from "@beep/nlp/Graph/GraphOperations/Catalog"
 *
 * console.log(trim.name)
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export const trim: Op.GraphOperation<string, string> = Op.transform({
  description: "Remove leading and trailing whitespace.",
  f: (data) => data.trim(),
  name: "trim",
});

/**
 * The standard catalog of linguistic + pure string operations, keyed by name.
 *
 * @example
 * ```ts
 * import { StandardOperations } from "@beep/nlp/Graph/GraphOperations/Catalog"
 *
 * console.log(StandardOperations.tokenize.name)
 * ```
 *
 * @since 0.0.0
 * @category catalog
 */
export const StandardOperations = {
  extractEntities,
  extractRelations,
  lemmatize,
  parseDependencies,
  posTag,
  sentencize,
  toLowerCase,
  toUpperCase,
  tokenize,
  trim,
} as const;

/**
 * List the names of all operations in the {@link StandardOperations} catalog.
 *
 * @example
 * ```ts
 * import { getOperationNames } from "@beep/nlp/Graph/GraphOperations/Catalog"
 *
 * console.log(getOperationNames())
 * ```
 *
 * @since 0.0.0
 * @category catalog
 */
export const getOperationNames = (): ReadonlyArray<string> => A.fromIterable(Struct.keys(StandardOperations));
