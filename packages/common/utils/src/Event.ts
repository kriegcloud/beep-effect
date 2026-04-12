/**
 * Helpers for schema-backed server-sent event envelopes.
 *
 * @module @beep/utils/Event
 * @since 0.0.0
 */

import { $UtilsId } from "@beep/identity/packages";
import type { TString } from "@beep/types";

/**
 * Re-export of the Effect SSE encoder/decoder primitives.
 *
 * @since 0.0.0
 */
export * from "effect/unstable/encoding/Sse";

import * as S from "effect/Schema";

const $I = $UtilsId.create("Event");

type EventShape<TTag extends TString.NonEmpty, TFields extends S.Struct.Fields> = {
  readonly kind: "Event";
  readonly _tag: TTag;
  readonly payload: S.Struct<TFields>["Type"];
};

/**
 * Builds a typed server-sent event envelope schema.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { makeEvent } from "@beep/utils/Event"
 *
 * const Progress = makeEvent({ percent: S.Number }, "Progress")
 * const decoded = S.decodeUnknownSync(Progress)({
 *   kind: "Event",
 *   _tag: "Progress",
 *   payload: { percent: 100 },
 * })
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const makeEvent = <TTag extends TString.NonEmpty, TFields extends S.Struct.Fields>(
  payload: TFields,
  tag: TTag
) =>
  S.Class<EventShape<TTag, TFields>>($I`Event`)(
    {
      kind: S.tag("Event"),
      _tag: S.tag(tag),
      payload: S.Struct({ ...payload }),
    },
    $I.annote("Event", {
      description: "A typed server-sent event envelope.",
    })
  );
