/**
 * Span value-object schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import { dual } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { SegmentMap } from "../SegmentMap/index.ts";

const $I = $LawPracticeDomainId.create("values/Span/Span.model");

/**
 * Represents a text span with positions tracked through transformations.
 *
 * **Details**
 *
 * During text cleaning (HTML removal, whitespace normalization), positions
 * shift. Span tracks BOTH cleaned positions (for parsing) and original
 * positions (for user-facing results).
 *
 * **Example** (Creating a basic Span)
 *
 * ```ts
 * import * as S from "effect/Schema"
 * import { Span } from "@beep/law-practice-domain"
 *
 * const span = Span.make({
 *   cleanEnd: S.Natural.make(10),
 *   cleanStart: S.Natural.make(0),
 *   originalEnd: S.Natural.make(10),
 *   originalStart: S.Natural.make(0),
 * })
 *
 * console.log(span.cleanStart)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Span extends S.Opaque<Span, { readonly brand: unique symbol }>()(
  S.Struct({
    cleanStart: S.Natural.annotateKey({
      description: "Start position in cleaned/tokenized text used during parsing",
    }),
    cleanEnd: S.Natural.annotateKey({
      description: "End position in cleaned/tokenized text used during parsing",
    }),
    originalStart: S.Natural.annotateKey({
      description: "Start position in original input text returned to user",
    }),
    originalEnd: S.Natural.annotateKey({
      description: "End position in original input text returned to user",
    }),
  }).pipe(
    $I.annoteSchema("Span", {
      description: "Represents a text span with positions tracked through transformations.",
    })
  )
) {
  /**
   * Resolve cleaned-text span positions against the original input text.
   *
   * **Gotchas**
   *
   * Both clean positions are checked as non-negative integers first; a
   * negative or fractional position throws a `SchemaError`.
   *
   * **Example** (Resolving original span positions)
   *
   * ```ts
   * import { Span, TransformationMap } from "@beep/law-practice-domain"
   * import * as HashMap from "effect/HashMap"
   * import * as O from "effect/Option"
   *
   * const positions = HashMap.empty<number, number>()
   * const map = TransformationMap.make({
   *   cleanToOriginal: positions,
   *   cleanToOriginalSegments: O.none(),
   *   originalToClean: positions,
   * })
   *
   * const resolved = Span.resolveOriginal(
   *   { cleanEnd: 5, cleanStart: 0 },
   *   map,
   * )
   * console.log(resolved.originalStart)
   * ```
   *
   * @category statics
   * @since 0.0.0
   */
  static readonly resolveOriginal: {
    (
      span: { readonly cleanStart: number; readonly cleanEnd: number },
      map: TransformationMap
    ): { readonly originalStart: number; readonly originalEnd: number };
    (
      map: TransformationMap
    ): (span: { readonly cleanStart: number; readonly cleanEnd: number }) => {
      readonly originalStart: number;
      readonly originalEnd: number;
    };
  } = dual(
    2,
    (
      span: { readonly cleanStart: number; readonly cleanEnd: number },
      map: TransformationMap
    ): { readonly originalStart: number; readonly originalEnd: number } => {
      const cleanStart = S.Natural.make(span.cleanStart);
      const cleanEnd = S.Natural.make(span.cleanEnd);
      return O.match(map.cleanToOriginalSegments, {
        onNone: () => ({
          originalEnd: HashMap.get(map.cleanToOriginal, cleanEnd).pipe(O.getOrElse(() => cleanEnd)),
          originalStart: HashMap.get(map.cleanToOriginal, cleanStart).pipe(O.getOrElse(() => cleanStart)),
        }),
        onSome: (segmentMap) => ({
          originalEnd: S.Natural.make(segmentMap.lookup(cleanEnd)),
          originalStart: S.Natural.make(segmentMap.lookup(cleanStart)),
        }),
      });
    }
  );
}

/**
 * Maps positions between cleaned and original text.
 *
 * **Details**
 *
 * Built during text transformation to track how character positions shift
 * when HTML entities are removed, whitespace is normalized, etc.
 *
 * **Example** (Creating empty TransformationMap)
 *
 * ```ts
 * import { TransformationMap } from "@beep/law-practice-domain"
 * import * as HashMap from "effect/HashMap"
 * import * as O from "effect/Option"
 *
 * const positions = HashMap.empty<number, number>()
 * const map = TransformationMap.make({
 *   cleanToOriginal: positions,
 *   cleanToOriginalSegments: O.none(),
 *   originalToClean: positions,
 * })
 *
 * console.log(map.cleanToOriginalSegments)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TransformationMap extends S.Opaque<TransformationMap, { readonly brand: unique symbol }>()(
  S.Struct({
    cleanToOriginal: S.HashMap(S.Natural, S.Natural).annotateKey({
      description: "Maps cleaned text position to original text position",
    }),
    originalToClean: S.HashMap(S.Natural, S.Natural).annotateKey({
      description: "Maps original text position to cleaned text position",
    }),
    cleanToOriginalSegments: S.OptionFromOptionalKey(SegmentMap).annotateKey({
      description: "Compressed segment-based clean-to-original mapping for logarithmic lookup",
    }),
  }).pipe(
    $I.annoteSchema("TransformationMap", {
      description: "Maps cleaned text positions to original text positions.",
    })
  )
) {}
