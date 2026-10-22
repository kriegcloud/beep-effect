/**
 * Segment value-object schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Segment } from "../Segment/index.ts";

const $I = $LawPracticeDomainId.create("values/SegmentMap/SegmentMap.model");

/**
 * Compressed map between cleaned-text and original-text positions.
 *
 * **Example** (Identity map lookup)
 *
 * ```ts
 * import { SegmentMap } from "@beep/law-practice-domain"
 *
 * const segmentMap = SegmentMap.make({ segments: [] })
 * console.log(segmentMap.lookup(0))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SegmentMap extends S.Class<SegmentMap, { readonly brand: unique symbol }>($I`SegmentMap`)(
  {
    segments: S.Array(Segment),
  },
  $I.annote("SegmentMap", {
    description: "Compressed map between cleaned-text and original-text positions.",
  })
) {
  /**
   * Look up the original position for a clean-text position.
   * Uses binary search on sorted segments.
   *
   * **Example** (Lookup original position)
   *
   * ```ts
   * import { SegmentMap } from "@beep/law-practice-domain"
   *
   * console.log(SegmentMap.make({ segments: [] }).lookup(5))
   * ```
   *
   * @category utilities
   * @since 0.0.0
   */
  // fallow-ignore-next-line unused-class-member -- SegmentMap.lookup: Span.resolveOriginal calls this on a schema-produced instance.
  lookup(cleanPos: number): number {
    const segments = this.segments;
    if (A.isReadonlyArrayEmpty(segments)) return cleanPos;

    let lo = 0;
    let hi = segments.length - 1;

    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const segmentOption = A.get(segments, mid);
      if (O.isNone(segmentOption)) return cleanPos;

      const segment = segmentOption.value;

      if (cleanPos < segment.cleanPos) {
        hi = mid - 1;
      } else if (cleanPos >= segment.cleanPos + segment.len) {
        lo = mid + 1;
      } else {
        return segment.origPos + (cleanPos - segment.cleanPos);
      }
    }

    return A.last(segments).pipe(
      O.match({
        onNone: () => cleanPos,
        onSome: (last) => last.origPos + (cleanPos - last.cleanPos),
      })
    );
  }
}
