/**
 * Attributes value object
 *
 * Property-value pairs for entity attributes where keys are strings
 * (typically URIs) and values are literals (string, number, or boolean).
 *
 * @module knowledge-domain/value-objects/Attributes
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/Attributes");

/**
 * Schema for entity/mention attributes
 *
 * Property-value pairs where keys are strings (typically URIs)
 * and values are literals (string, number, or boolean).
 *
 * @example
 * ```typescript
 * const attrs = {
 *   "http://schema.org/birthDate": "1985-02-05",
 *   "http://schema.org/age": 39,
 *   "http://schema.org/active": true
 * }
 * ```
 *
 * @since 0.1.0
 * @category value-objects
 */
export class Attributes extends S.Record({
  key: S.String,
  value: S.Union(S.String, S.Number, S.Boolean),
}).annotations(
  $I.annotations("Attributes", {
    title: "Attributes",
    description: "Property-value pairs (literal values only)",
  })
) {}

export declare namespace Attributes {
  export type Type = typeof Attributes.Type;
  export type Encoded = typeof Attributes.Encoded;
}

/**
 * Schema for confidence scores (0.0 to 1.0)
 *
 * Used for extraction confidence, resolution confidence, and grounding scores.
 *
 * @since 0.1.0
 * @category value-objects
 */
export class Confidence extends S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1)).annotations(
  $I.annotations("Confidence", {
    title: "Confidence",
    description: "Confidence score (0.0-1.0)",
  })
) {}
export declare namespace Confidence {
  export type Type = typeof Confidence.Type;
  export type Encoded = typeof Confidence.Encoded;
}
