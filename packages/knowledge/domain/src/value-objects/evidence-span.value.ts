/**
 * EvidenceSpan value object
 *
 * Character-level text evidence for provenance tracking.
 * Captures the exact text span and character offsets where a fact
 * was mentioned in the source document.
 *
 * @module knowledge-domain/value-objects/EvidenceSpan
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/EvidenceSpan");

/**
 * EvidenceSpan - Character-level text evidence for provenance
 *
 * Captures the exact text span and character offsets where a fact
 * was mentioned in the source document. Uses W3C Web Annotation
 * TextQuoteSelector semantics for interoperability.
 *
 * @example
 * ```typescript
 * const evidence: EvidenceSpan = {
 *   text: "Cristiano Ronaldo",
 *   startChar: 42,
 *   endChar: 59,
 *   confidence: 0.95
 * }
 * ```
 *
 * @since 0.1.0
 * @category value-objects
 */
export class EvidenceSpan extends S.Class<EvidenceSpan>($I`EvidenceSpan`)({
  /**
   * Exact text span from source document
   */
  text: S.String.annotations({
    title: "Text",
    description: "Exact text span from source document",
  }),

  /**
   * Character offset start (0-indexed)
   */
  startChar: S.NonNegativeInt.annotations({
    title: "Start Character",
    description: "Character offset start (0-indexed)",
  }),

  /**
   * Character offset end (exclusive)
   */
  endChar: S.NonNegativeInt.annotations({
    title: "End Character",
    description: "Character offset end (exclusive)",
  }),

  /**
   * Extraction confidence (0-1)
   */
  confidence: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1))).annotations({
    title: "Confidence",
    description: "Extraction confidence score (0-1)",
  }),
}) {}

export declare namespace EvidenceSpan {
  export type Type = typeof EvidenceSpan.Type;
  export type Encoded = typeof EvidenceSpan.Encoded;
}
