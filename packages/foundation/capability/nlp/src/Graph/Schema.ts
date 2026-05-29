/**
 * Graph node & edge schemas for the NLP text graph.
 *
 * Schema-first domain types for the text-graph IR: structural nodes
 * ({@link TextNode}/{@link TextEdge}), the {@link NLPAnalysis} summary, and the
 * linguistic-annotation node classes ({@link POSNode}, {@link EntityNode},
 * {@link LemmaNode}, {@link DependencyNode}, {@link RelationNode}). These are the
 * basis for the product-neutral handoff contract emitted to downstream consumers.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * `Schema.Class("Name")` becomes `S.Class($I\`Name\`)(fields, $I.annote(...))`,
 * multi-arm `Schema.Literal(...)` becomes `S.Literals(...)`, `Schema.optional`
 * becomes `S.optionalKey`, and `Schema.Record({key,value})` becomes the positional
 * `S.Record(key, value)`. `timestamp` remains a plain field supplied by the graph
 * producer (which reads `Clock`).
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $NlpId.create("Graph/Schema");

/**
 * Structural text-node kind vocabulary.
 *
 * @example
 * ```ts
 * import { TextNodeType } from "@beep/nlp/Graph/Schema"
 *
 * console.log(TextNodeType.is.sentence("sentence")) // true
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const TextNodeType = LiteralKit(["sentence", "token", "paragraph", "document"]).annotate(
  $I.annote("TextNodeType", {
    description: "Structural text-graph node kind (document/paragraph/sentence/token).",
  })
);

/**
 * Edge-relation vocabulary (structural + linguistic-annotation relations).
 *
 * @example
 * ```ts
 * import { TextEdgeRelation } from "@beep/nlp/Graph/Schema"
 *
 * console.log(TextEdgeRelation.is.contains("contains")) // true
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const TextEdgeRelation = LiteralKit([
  // Structural relations
  "contains",
  "follows",
  "derived-from",
  "parent-of",
  // Linguistic annotation relations
  "tagged-as",
  "lemma-of",
  "head-of",
  "dependent-of",
  "entity-mention",
  "relates-to",
]).annotate(
  $I.annote("TextEdgeRelation", {
    description: "Text-graph edge relation (structural lineage + linguistic-annotation links).",
  })
);

/**
 * Text node stored in the graph: a piece of text with processing metadata.
 *
 * @example
 * ```ts
 * import { TextNode } from "@beep/nlp/Graph/Schema"
 *
 * console.log(TextNode)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class TextNode extends S.Class<TextNode>($I`TextNode`)(
  {
    text: S.String,
    type: TextNodeType,
    operation: S.optionalKey(S.String),
    timestamp: S.Number,
    metadata: S.optionalKey(S.Record(S.String, S.Unknown)),
  },
  $I.annote("TextNode", {
    description: "Text-graph node: text content plus processing metadata and a creation timestamp.",
  })
) {}

/**
 * Edge between text nodes, labeled with a structural or linguistic relation.
 *
 * @example
 * ```ts
 * import { TextEdge } from "@beep/nlp/Graph/Schema"
 *
 * console.log(TextEdge)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class TextEdge extends S.Class<TextEdge>($I`TextEdge`)(
  {
    relation: TextEdgeRelation,
    label: S.optionalKey(S.String),
    weight: S.optionalKey(S.Number),
  },
  $I.annote("TextEdge", {
    description: "Text-graph edge labeled with a structural or linguistic-annotation relation.",
  })
) {}

/**
 * Summary result of analyzing a piece of text.
 *
 * @example
 * ```ts
 * import { NLPAnalysis } from "@beep/nlp/Graph/Schema"
 *
 * console.log(NLPAnalysis)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class NLPAnalysis extends S.Class<NLPAnalysis>($I`NLPAnalysis`)(
  {
    text: S.String,
    sentences: S.Array(S.String),
    tokens: S.Array(S.String),
    wordCount: S.Number,
    stats: S.optionalKey(S.Record(S.String, S.Number)),
  },
  $I.annote("NLPAnalysis", {
    description: "Summary analysis of a text: detected sentences, tokens, word count, and optional stats.",
  })
) {}

/**
 * Part-of-speech annotation for a token (a functor `Token -> POS`).
 *
 * @example
 * ```ts
 * import { POSNode } from "@beep/nlp/Graph/Schema"
 *
 * console.log(POSNode)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class POSNode extends S.Class<POSNode>($I`POSNode`)(
  {
    text: S.String,
    tag: S.String,
    description: S.optionalKey(S.String),
    position: S.Number,
    timestamp: S.Number,
    metadata: S.optionalKey(S.Record(S.String, S.Unknown)),
  },
  $I.annote("POSNode", {
    description: "Part-of-speech annotation node (Penn Treebank tag) for a token at a sentence position.",
  })
) {}

/**
 * Named entity extracted from text (a functor `Text -> Entity`).
 *
 * @example
 * ```ts
 * import { EntityNode } from "@beep/nlp/Graph/Schema"
 *
 * console.log(EntityNode)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class EntityNode extends S.Class<EntityNode>($I`EntityNode`)(
  {
    text: S.String,
    entityType: S.String,
    confidence: S.optionalKey(S.Number),
    span: S.Struct({ start: S.Number, end: S.Number }),
    normalizedForm: S.optionalKey(S.String),
    timestamp: S.Number,
    metadata: S.optionalKey(S.Record(S.String, S.Unknown)),
  },
  $I.annote("EntityNode", {
    description: "Named-entity node with type label, character span, optional confidence, and normalized form.",
  })
) {}

/**
 * Lemmatized (canonical) form of a token (a forgetful functor `Token -> Lemma`).
 *
 * @example
 * ```ts
 * import { LemmaNode } from "@beep/nlp/Graph/Schema"
 *
 * console.log(LemmaNode)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class LemmaNode extends S.Class<LemmaNode>($I`LemmaNode`)(
  {
    token: S.String,
    lemma: S.String,
    pos: S.optionalKey(S.String),
    position: S.Number,
    timestamp: S.Number,
    metadata: S.optionalKey(S.Record(S.String, S.Unknown)),
  },
  $I.annote("LemmaNode", {
    description: "Lemma node: the canonical/dictionary form of a token (idempotent under lemmatization).",
  })
) {}

/**
 * Syntactic dependency relation between two tokens.
 *
 * @example
 * ```ts
 * import { DependencyNode } from "@beep/nlp/Graph/Schema"
 *
 * console.log(DependencyNode)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class DependencyNode extends S.Class<DependencyNode>($I`DependencyNode`)(
  {
    relation: S.String,
    head: S.Struct({ text: S.String, position: S.Number }),
    dependent: S.Struct({ text: S.String, position: S.Number }),
    distance: S.Number,
    timestamp: S.Number,
    metadata: S.optionalKey(S.Record(S.String, S.Unknown)),
  },
  $I.annote("DependencyNode", {
    description: "Syntactic dependency arc (Universal Dependencies relation) between a head and dependent token.",
  })
) {}

/**
 * Semantic relation between two entities.
 *
 * @example
 * ```ts
 * import { RelationNode } from "@beep/nlp/Graph/Schema"
 *
 * console.log(RelationNode)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class RelationNode extends S.Class<RelationNode>($I`RelationNode`)(
  {
    relationType: S.String,
    subject: S.Struct({
      text: S.String,
      entityType: S.String,
      span: S.Struct({ start: S.Number, end: S.Number }),
    }),
    object: S.Struct({
      text: S.String,
      entityType: S.String,
      span: S.Struct({ start: S.Number, end: S.Number }),
    }),
    trigger: S.optionalKey(S.String),
    confidence: S.optionalKey(S.Number),
    timestamp: S.Number,
    metadata: S.optionalKey(S.Record(S.String, S.Unknown)),
  },
  $I.annote("RelationNode", {
    description: "Semantic relation node connecting a subject entity to an object entity via a typed predicate.",
  })
) {}
