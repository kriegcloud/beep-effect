/**
 * Ontology/Kind - Type-level ontology for text-processing categories.
 *
 * Makes the categorical structure explicit:
 * - {@link TextKind}: the objects in the category of discourse
 * - {@link TypedText}: payloads tagged with their ontological kind
 * - Smart constructors: safe ways to create typed text
 * - Kind relations: the partial-order ("contains") structure
 *
 * The kinds form a poset under containment
 * (`Document > Paragraph > Sentence > Token > Character`) with orthogonal
 * annotation kinds (POS, Lemma, Entity, Relation, Dependency, Chunk, Embedding).
 * Free operations increase granularity (move down the poset); forgetful
 * operations decrease it (move up).
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`.
 * `Schema.Union(Schema.Literal(...))` is replaced by `@beep/schema`'s
 * `LiteralKit` per repo convention.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $NlpId.create("Ontology/Kind");

// =============================================================================
// Core Kind System
// =============================================================================

/**
 * Textual strata in the NLP category (the object layer).
 *
 * Forms a poset under containment plus orthogonal annotation kinds.
 *
 * @example
 * ```ts
 * import { TextKind } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(TextKind.is.Document("Document")) // true
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const TextKind = LiteralKit([
  // Structural hierarchy (poset under containment)
  "Document",
  "Paragraph",
  "Sentence",
  "Token",
  "Character",
  // Linguistic annotations (orthogonal to the structural hierarchy)
  "POS",
  "Lemma",
  "Entity",
  "Relation",
  "Dependency",
  "Chunk",
  "Embedding",
]).annotate(
  $I.annote("TextKind", {
    description: "Ontological strata of text in the NLP category (structural hierarchy + annotation kinds).",
  })
);

/**
 * Runtime type for {@link TextKind}.
 *
 * @example
 * ```ts
 * import type { TextKind } from "@beep/nlp/Ontology/Kind"
 *
 * const kind: TextKind = "Sentence"
 * console.log(kind)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type TextKind = typeof TextKind.Type;

/**
 * Schema for {@link TextKind} (alias of the LiteralKit schema).
 *
 * @example
 * ```ts
 * import { TextKindSchema } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(TextKindSchema)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const TextKindSchema: S.Schema<TextKind> = TextKind.pipe(
  $I.annoteSchema("TextKindSchema", {
    description: "Runtime schema alias for NLP text ontology kinds.",
  })
);

// =============================================================================
// Typed Text Payload
// =============================================================================

/**
 * Text content tagged with its ontological kind.
 *
 * Pairs raw content with its position in the categorical hierarchy, enabling
 * type-level enforcement of valid operations.
 *
 * @typeParam K - The ontological kind (position in the category).
 * @example
 * ```ts
 * import type { TypedText } from "@beep/nlp/Ontology/Kind"
 *
 * const doc: TypedText<"Document"> = { kind: "Document", content: "hello" }
 * console.log(doc.kind)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export interface TypedText<K extends TextKind> {
  readonly content: string;
  readonly kind: K;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Runtime validation schema for {@link TypedText} of a given kind.
 *
 * @example
 * ```ts
 * import { TypedTextSchema, TextKind } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(TypedTextSchema(TextKind))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const TypedTextSchema = <K extends TextKind>(kind: S.Schema<K>) =>
  S.Struct({
    kind,
    content: S.String,
    metadata: S.optionalKey(S.Record(S.String, S.Unknown)),
  }).pipe(
    $I.annoteSchema("TypedTextSchema", {
      description: "Generic schema for text content tagged with a supplied ontology kind.",
    })
  );

// =============================================================================
// Smart Constructors
// =============================================================================

const makeTyped =
  <K extends TextKind>(kind: K) =>
  (content: string, metadata?: Record<string, unknown>): TypedText<K> =>
    metadata !== undefined ? { kind, content, metadata } : { kind, content };

/**
 * Create a Document-level typed text (top of the structural hierarchy).
 *
 * @example
 * ```ts
 * import { Document } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(Document("This is a document.").kind) // "Document"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Document: (content: string, metadata?: Record<string, unknown>) => TypedText<"Document"> =
  makeTyped("Document");

/**
 * Create a Paragraph-level typed text (logical grouping within a document).
 *
 * @example
 * ```ts
 * import { Paragraph } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(Paragraph("A paragraph.").kind) // "Paragraph"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Paragraph: (content: string, metadata?: Record<string, unknown>) => TypedText<"Paragraph"> =
  makeTyped("Paragraph");

/**
 * Create a Sentence-level typed text (fundamental unit of meaning).
 *
 * @example
 * ```ts
 * import { Sentence } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(Sentence("A sentence.").kind) // "Sentence"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Sentence: (content: string, metadata?: Record<string, unknown>) => TypedText<"Sentence"> =
  makeTyped("Sentence");

/**
 * Create a Token-level typed text (an individual word or punctuation mark).
 *
 * @example
 * ```ts
 * import { Token } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(Token("word").kind) // "Token"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Token: (content: string, metadata?: Record<string, unknown>) => TypedText<"Token"> = makeTyped("Token");

/**
 * Create a Character-level typed text (atomic element of text).
 *
 * @example
 * ```ts
 * import { Character } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(Character("a").kind) // "Character"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Character: (content: string, metadata?: Record<string, unknown>) => TypedText<"Character"> =
  makeTyped("Character");

/**
 * Create an Entity-level typed text (named entity from NER).
 *
 * @example
 * ```ts
 * import { Entity } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(Entity("Apple Inc.", { type: "ORG" }).kind) // "Entity"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Entity: (content: string, metadata?: Record<string, unknown>) => TypedText<"Entity"> = makeTyped("Entity");

/**
 * Create a Relation-level typed text (semantic connection between entities).
 *
 * @example
 * ```ts
 * import { Relation } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(Relation("founded", { type: "FOUNDER_OF" }).kind) // "Relation"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Relation: (content: string, metadata?: Record<string, unknown>) => TypedText<"Relation"> =
  makeTyped("Relation");

/**
 * Create an Embedding-level typed text (vector-space representation).
 *
 * @example
 * ```ts
 * import { Embedding } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(Embedding("apple", { model: "word2vec" }).kind) // "Embedding"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Embedding: (content: string, metadata?: Record<string, unknown>) => TypedText<"Embedding"> =
  makeTyped("Embedding");

/**
 * Create a Dependency-level typed text (syntactic dependency arc).
 *
 * @example
 * ```ts
 * import { Dependency } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(Dependency("nsubj", { head: "runs" }).kind) // "Dependency"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Dependency: (content: string, metadata?: Record<string, unknown>) => TypedText<"Dependency"> =
  makeTyped("Dependency");

/**
 * Create a Chunk-level typed text (shallow-parsing constituent: NP, VP, ...).
 *
 * @example
 * ```ts
 * import { Chunk } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(Chunk("the dog").kind) // "Chunk"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Chunk: (content: string, metadata?: Record<string, unknown>) => TypedText<"Chunk"> = makeTyped("Chunk");

/**
 * Create a POS-level typed text (part-of-speech annotation).
 *
 * @example
 * ```ts
 * import { POS } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(POS("dog", { tag: "NN" }).kind) // "POS"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const POS: (content: string, metadata?: Record<string, unknown>) => TypedText<"POS"> = makeTyped("POS");

/**
 * Create a Lemma-level typed text (canonical/dictionary form of a token).
 *
 * @example
 * ```ts
 * import { Lemma } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(Lemma("run", { original: "running" }).kind) // "Lemma"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Lemma: (content: string, metadata?: Record<string, unknown>) => TypedText<"Lemma"> = makeTyped("Lemma");

// =============================================================================
// Kind Relations (Partial Order Structure)
// =============================================================================

/**
 * Structural containment hierarchy: which kinds can contain which others.
 *
 * Forms a poset where `A` containing `B` means "A > B".
 *
 * @since 0.0.0
 * @category models
 */
export interface KindContainment {
  readonly Character: ReadonlyArray<TextKind>;
  readonly Chunk: ReadonlyArray<TextKind>;
  readonly Dependency: ReadonlyArray<TextKind>;
  readonly Document: ReadonlyArray<TextKind>;
  readonly Embedding: ReadonlyArray<TextKind>;
  readonly Entity: ReadonlyArray<TextKind>;
  readonly Lemma: ReadonlyArray<TextKind>;
  readonly Paragraph: ReadonlyArray<TextKind>;
  readonly POS: ReadonlyArray<TextKind>;
  readonly Relation: ReadonlyArray<TextKind>;
  readonly Sentence: ReadonlyArray<TextKind>;
  readonly Token: ReadonlyArray<TextKind>;
}

const containment: KindContainment = {
  Document: ["Paragraph", "Sentence"],
  Paragraph: ["Sentence"],
  Sentence: ["Token", "Chunk", "Dependency", "Entity", "Relation"],
  Token: ["Character", "POS", "Lemma"],
  Character: [],
  POS: [],
  Lemma: [],
  Entity: [],
  Relation: [],
  Dependency: [],
  Chunk: ["Token"],
  Embedding: [],
};

/**
 * Check whether `parent` can contain `child` per the containment poset.
 *
 * @example
 * ```ts
 * import { canContain } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(canContain("Document", "Sentence")) // true
 * console.log(canContain("Token", "Document")) // false
 * ```
 *
 * @since 0.0.0
 * @category predicates
 */
export const canContain = (parent: TextKind, child: TextKind): boolean => containment[parent].includes(child);

/**
 * Get all valid child kinds for a given parent kind.
 *
 * @example
 * ```ts
 * import { getValidChildren } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(getValidChildren("Token")) // ["Character", "POS", "Lemma"]
 * ```
 *
 * @since 0.0.0
 * @category getters
 */
export const getValidChildren = (kind: TextKind): ReadonlyArray<TextKind> => containment[kind];

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Extract raw content from typed text.
 *
 * @example
 * ```ts
 * import { Document, content } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(content(Document("hello"))) // "hello"
 * ```
 *
 * @since 0.0.0
 * @category getters
 */
export const content = <K extends TextKind>(text: TypedText<K>): string => text.content;

/**
 * Get the kind of a typed text.
 *
 * @example
 * ```ts
 * import { Token, kindOf } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(kindOf(Token("word"))) // "Token"
 * ```
 *
 * @since 0.0.0
 * @category getters
 */
export const kindOf = <K extends TextKind>(text: TypedText<K>): K => text.kind;

/**
 * Map over the content of typed text, preserving its kind.
 *
 * @example
 * ```ts
 * import { Token, mapContent } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(mapContent(Token("dog"), (s) => s.toUpperCase()).content) // "DOG"
 * ```
 *
 * @since 0.0.0
 * @category transformations
 */
export const mapContent = <K extends TextKind>(text: TypedText<K>, f: (content: string) => string): TypedText<K> => ({
  ...text,
  content: f(text.content),
});

/**
 * Merge additional metadata into typed text.
 *
 * @example
 * ```ts
 * import { Entity, withMetadata } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(withMetadata(Entity("Acme"), { type: "ORG" }).metadata) // { type: "ORG" }
 * ```
 *
 * @since 0.0.0
 * @category transformations
 */
export const withMetadata = <K extends TextKind>(
  text: TypedText<K>,
  metadata: Record<string, unknown>
): TypedText<K> => ({ ...text, metadata: { ...text.metadata, ...metadata } });

/**
 * Type guard: whether a value is a {@link TypedText} of a specific kind.
 *
 * @example
 * ```ts
 * import { Token, isKind } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(isKind("Token")(Token("word"))) // true
 * ```
 *
 * @since 0.0.0
 * @category predicates
 */
export const isKind =
  <K extends TextKind>(kind: K) =>
  (value: TypedText<TextKind>): value is TypedText<K> =>
    value.kind === kind;

/**
 * Re-tag typed text to a new kind (use only when the transition is valid).
 *
 * @example
 * ```ts
 * import { Token, recast } from "@beep/nlp/Ontology/Kind"
 *
 * console.log(recast(Token("word"), "Lemma").kind) // "Lemma"
 * ```
 *
 * @since 0.0.0
 * @category transformations
 */
export const recast = <K extends TextKind>(text: TypedText<TextKind>, newKind: K): TypedText<K> => ({
  ...text,
  kind: newKind,
});
