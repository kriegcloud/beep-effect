/**
 * Timestamp helpers that normalize either epoch numbers or ISO strings into canonical UTC strings.
 *
 * Converts timestamps represented as milliseconds or ISO inputs into normalized ISO strings without milliseconds.
 * Useful when a database stores numeric timestamps but APIs expect ISO strings.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TimestampToIsoString } from "@beep/schema/primitives/temporal/dates/timestamp";
 *
 * const decode = S.decodeSync(TimestampToIsoString);
 * const encode = S.encodeSync(TimestampToIsoString);
 *
 * const decoded = decode(1704067200000);
 * const encoded = encode("2024-01-01T00:00:00.123Z");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */

import { Regex } from "@beep/schema/internal/regex/regex";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Id } from "./_id";

const stripMilliseconds = (value: string): string => F.pipe(value, Str.replace(Regex.make(/\.\d{3}Z$/), "Z"));

/**
 * Schema transformer converting timestamps (numbers or ISO strings) into normalized ISO strings.
 *
 * Always emits ISO strings without fractional seconds to keep storage consistent.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TimestampToIsoString } from "@beep/schema/primitives/temporal/dates/timestamp";
 *
 * const iso = S.decodeSync(TimestampToIsoString)("2024-01-01T00:00:00.123Z");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const TimestampToIsoString = S.transform(S.Union(S.Number, S.String), S.String, {
  decode: (input) => F.pipe(new Date(input).toISOString(), stripMilliseconds),
  encode: (isoString) => F.pipe(new Date(isoString).toISOString(), stripMilliseconds),
}).annotations(
  Id.annotations("timestamp/TimestampToIsoString", {
    description:
      "Schema transformer that converts timestamp numbers or ISO strings into canonical ISO strings without milliseconds.",
  })
);

/**
 * Namespace exposing runtime and encoded types for {@link TimestampToIsoString}.
 *
 * @example
 * import type { TimestampToIsoString } from "@beep/schema/primitives/temporal/dates/timestamp";
 *
 * type Timestamp = TimestampToIsoString.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace TimestampToIsoString {
  /**
   * Runtime type after decoding via {@link TimestampToIsoString}.
   *
   * @example
   * import type { TimestampToIsoString } from "@beep/schema/primitives/temporal/dates/timestamp";
   *
   * let iso: TimestampToIsoString.Type;
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof TimestampToIsoString>;
  /**
   * Encoded representation accepted by {@link TimestampToIsoString}.
   *
   * @example
   * import type { TimestampToIsoString } from "@beep/schema/primitives/temporal/dates/timestamp";
   *
   * let encoded: TimestampToIsoString.Encoded;
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof TimestampToIsoString>;
}
