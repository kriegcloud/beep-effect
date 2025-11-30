import type { UnsafeTypes } from "@beep/types";
import { readFileArrayBuffer } from "@beep/utils/uint8-array-to-array-buffer";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import ExifReader from "exifreader";
import { ExpandedTags } from "./ExifTags";
import * as Errors from "./errors";

/**
 * Fields that typically contain large binary data or images that should be omitted
 * to reduce payload size and improve performance
 */
const LARGE_DATA_FIELDS = [
  "base64",
  "image",
  // "thumbnail" is intentionally excluded from exact matches to preserve container objects
  "thumbnailImage",
  "preview",
  "previewImage",
  "rawImage",
  "blob",
  "buffer",
  "data",
  "binaryData",
  "iccProfile",
  "colorProfile",
  "embeddedImage",
  "makerNoteImage",
] as const;

/**
 * Check if a field name indicates it contains large data.
 * Heuristic: matches common names like base64/image/thumbnail/preview/etc.
 */
const isLargeDataField = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  // Do not drop the entire container for `thumbnail`; clean its inner fields instead
  if (lowerKey === "thumbnail") return false;
  return (
    LARGE_DATA_FIELDS.some((field) => lowerKey.includes(field.toLowerCase())) ||
    lowerKey.endsWith("image") ||
    lowerKey.includes("base64")
  );
};

/**
 * Check if a value appears to be large binary data.
 * Uses simple thresholds (>1KB) and base64-like pattern detection for strings.
 */
const isLargeDataValue = (value: unknown): boolean => {
  if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
    return value.byteLength > 1024; // > 1KB
  }

  if (typeof value === "string") {
    // Base64 encoded data or very long strings
    return value.length > 1024 || (/^[A-Za-z0-9+/]+=*$/.test(value) && value.length > 100);
  }

  return false;
};

/**
 * Recursively omit large data fields from an object.
 * Walks objects and arrays, removing keys that look like large binary payloads.
 */
const omitLargeDataFromObject = <T extends Record<string, UnsafeTypes.UnsafeAny>>(obj: T): T => {
  const result: Record<string, UnsafeTypes.UnsafeAny> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip if field name indicates large data
    if (isLargeDataField(key)) {
      continue;
    }

    // Skip if value appears to be large binary data
    if (isLargeDataValue(value)) {
      continue;
    }

    // Recursively process nested objects
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = omitLargeDataFromObject(value);
    } else if (Array.isArray(value)) {
      // Process arrays, filtering out large data items
      result[key] = value
        .filter((item) => !isLargeDataValue(item))
        .map((item) =>
          item && typeof item === "object" && !Array.isArray(item) ? omitLargeDataFromObject(item) : item
        );
    } else {
      result[key] = value;
    }
  }

  return result as T;
};

/**
 * Clean EXIF data by removing large binary fields like base64, images, etc.
 * This is useful for reducing payload size when storing or transmitting EXIF metadata.
 *
 * @param exifData - Raw EXIF data from ExifReader
 * @returns Cleaned EXIF data with large binary fields removed
 *
 * @example
 * ```typescript
 * const rawExif = ExifReader.load(imagePath, { expanded: true });
 * const cleanExif = cleanExifData(rawExif);
 * const validated = yield* S.decode(ExpandedTags)(cleanExif);
 * ```
 */
export const cleanExifData = <T extends Record<string, UnsafeTypes.UnsafeAny>>(exifData: T): T => {
  if (!exifData || typeof exifData !== "object") {
    return exifData;
  }

  return omitLargeDataFromObject(exifData);
};

/**
 * Clean specific known large fields from EXIF data using Effect's EffStruct.omit
 * This is a more targeted approach for known problematic fields.
 *
 * @param exifData - Raw EXIF data from ExifReader
 * @returns EXIF data with specific large fields omitted
 */
export const omitKnownLargeFields = <T extends Record<string, UnsafeTypes.UnsafeAny>>(exifData: T): T => {
  let cleaned = { ...exifData };

  // Clean ICC profile
  if (P.isNotNullable(cleaned.icc) && typeof cleaned.icc === "object") {
    cleaned = {
      ...cleaned,
      icc: Struct.omit("base64", "data", "buffer")(cleaned.icc),
    };
  }

  // Clean XMP data
  if (P.isNotNullable(cleaned.xmp) && typeof cleaned.xmp === "object") {
    cleaned = {
      ...cleaned,
      xmp: Struct.omit("base64", "rawXml", "data")(cleaned.xmp),
    };
  }

  // Clean IPTC data
  if (P.isNotNullable(cleaned.iptc) && typeof cleaned.iptc === "object") {
    cleaned = {
      ...cleaned,
      iptc: Struct.omit("base64", "data", "buffer")(cleaned.iptc),
    };
  }

  // Clean thumbnail data
  if (P.isNotNullable(cleaned.thumbnail) && typeof cleaned.thumbnail === "object") {
    cleaned = {
      ...cleaned,
      thumbnail: Struct.omit("image", "base64", "blob", "buffer")(cleaned.thumbnail),
    };
  }

  // Clean EXIF data recursively for nested structures
  if (P.isNotNullable(cleaned.exif) && typeof cleaned.exif === "object") {
    const exifCleaned = omitLargeDataFromObject(cleaned.exif);
    cleaned = { ...cleaned, exif: exifCleaned };
  }

  return cleaned;
};

export class ExifMetadata extends ExpandedTags.annotations({
  schemaId: Symbol.for("@beep/schema/integrations/files/exif-metadata/ExifMetadata"),
  identifier: "ExifMetadata",
  title: "EXIF Metadata",
  description: "EXIF metadata extracted from an image file.",
}) {
  static readonly cleanExifData = cleanExifData;
  static readonly omitKnownLargeFields = omitKnownLargeFields;
  static readonly isLargeDataField = isLargeDataField;
  static readonly isLargeDataValue = isLargeDataValue;
  static readonly omitLargeDataFromObject = omitLargeDataFromObject;

  static readonly extractMetadata = Effect.fn("extractMetadata")(function* (file: File) {
    const arrayBuffer = yield* readFileArrayBuffer(file);
    const raw = yield* Effect.try({
      try: () => ExifReader.load(arrayBuffer, { expanded: true }),
      catch: (e) =>
        new Errors.ExifParseError({
          message: "Could not parse EXIF data",
          cause: e,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          phase: "parse",
        }),
    });
    const cleaned = cleanExifData(raw);
    return yield* S.decodeUnknown(ExifMetadata)(cleaned).pipe(
      Effect.mapError(
        (e) =>
          new Errors.ExifParseError({
            message: "Could not decode EXIF data to schema",
            cause: e,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            phase: "decode",
          })
      )
    );
  });
}
