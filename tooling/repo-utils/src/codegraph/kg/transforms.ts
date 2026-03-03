// cspell:ignore codegraph
import { NonNegativeInt } from "@beep/schema";
import { Effect, pipe, SchemaTransformation, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { DomainError } from "../../errors/index.js";
import { SnapshotRecord } from "./models.js";

/**
 * Path normalizer transformation.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const NormalizedPath = S.String.pipe(
  S.decode(
    SchemaTransformation.transform({
      decode: (value) => pipe(value, Str.replace(/\\/g, "/"), Str.replace(/^\.\//, "")),
      encode: (value) => value,
    })
  )
);

/**
 * Comma-separated changed-path list.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const ChangedPathsCsv = S.String.pipe(
  S.decodeTo(
    S.Array(NormalizedPath),
    SchemaTransformation.transform<ReadonlyArray<string>, string>({
      decode: (value): ReadonlyArray<string> => pipe(value, Str.split(","), A.map(Str.trim), A.filter(Str.isNonEmpty)),
      encode: A.join(","),
    })
  )
);

/**
 * Decoder for changed-path CSV flags.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const decodeChangedPathsCsv = S.decodeUnknownEffect(ChangedPathsCsv);

/**
 * Snapshot record persisted as one JSON line.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const SnapshotRecordJsonLine = S.fromJsonString(SnapshotRecord);

/**
 * Decoder for one JSONL snapshot line.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const decodeSnapshotRecordJsonLine = S.decodeUnknownEffect(SnapshotRecordJsonLine);

/**
 * Encoder for one JSONL snapshot line.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const encodeSnapshotRecordJsonLine = S.encodeUnknownEffect(SnapshotRecordJsonLine);

/**
 * Generic JSON envelope line.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const JsonEnvelopeLine = S.fromJsonString(S.Record(S.String, S.Unknown));

/**
 * Decoder for one JSONL envelope line.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const decodeJsonEnvelopeLine = S.decodeUnknownEffect(JsonEnvelopeLine);

/**
 * Parse a positive integer or return the provided fallback.
 *
 * @param value - Optional string input to parse.
 * @param fallback - Default value returned when parse fails.
 * @returns Parsed positive integer or fallback.
 * @category Uncategorized
 * @since 0.0.0
 */
export const parsePositiveInt = (value: O.Option<string>, fallback: number): number =>
  O.match(value, {
    onNone: () => fallback,
    onSome: (raw) => {
      const parsed = Number(raw);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
    },
  });

/**
 * Parse a finite positive number or return the provided fallback.
 *
 * @param value - Optional string input to parse.
 * @param fallback - Default value returned when parse fails.
 * @returns Parsed positive number or fallback.
 * @category Uncategorized
 * @since 0.0.0
 */
export const parsePositiveNumber = (value: O.Option<string>, fallback: number): number =>
  O.match(value, {
    onNone: () => fallback,
    onSome: (raw) => {
      const parsed = Number(raw);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    },
  });

/**
 * Decode a strict boolean-like string with fallback.
 *
 * @param value - Optional string input to parse.
 * @param fallback - Default value returned when parse fails.
 * @returns Parsed boolean or fallback.
 * @category Uncategorized
 * @since 0.0.0
 */
export const parseBoolean = (value: O.Option<string>, fallback: boolean): boolean =>
  O.match(value, {
    onNone: () => fallback,
    onSome: (raw) => {
      const normalized = pipe(raw, Str.trim, Str.toLowerCase);
      if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
        return true;
      }
      if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
        return false;
      }
      return fallback;
    },
  });

/**
 * Decode unknown input as a non-negative integer.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const decodeNonNegativeInt: (value: unknown) => Effect.Effect<number, DomainError> = Effect.fn(
  function* (value) {
    return yield* S.decodeUnknownEffect(NonNegativeInt)(value).pipe(
      Effect.mapError((cause) => new DomainError({ message: "Failed to decode non-negative integer", cause }))
    );
  }
);
