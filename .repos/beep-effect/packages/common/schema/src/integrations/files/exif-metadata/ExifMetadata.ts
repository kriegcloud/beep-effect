import { thunk } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";

/**
 * Raw EXIF metadata value type - matches ExifTool JSON output.
 * Uses index signature for arbitrary EXIF fields.
 */
type TExifMetadataValue<T extends Record<string, unknown>> = {
  readonly [K in keyof T]: T[K];
};

export type ExifMetadataValue = TExifMetadataValue<{
  readonly SourceFile?: undefined | string;
  readonly FileName?: undefined | string;
  readonly Directory?: undefined | string;
  readonly FileSize?: undefined | string;
  readonly FileModifyDate?: undefined | string;
  readonly FileAccessDate?: undefined | string;
  readonly FileInodeChangeDate?: undefined | string;
  readonly FilePermissions?: undefined | string;
  readonly FileType?: undefined | string;
  readonly FileTypeExtension?: undefined | string;
  readonly MIMEType?: undefined | string;
  readonly ImageWidth?: undefined | number;
  readonly ImageHeight?: undefined | number;
  readonly ImageSize?: undefined | string;
  readonly Megapixels?: undefined | number;
  // GPS fields
  readonly GPSLatitude?: undefined | number | string;
  readonly GPSLongitude?: undefined | number | string;
  readonly GPSAltitude?: undefined | number | string;
  readonly GPSLatitudeRef?: undefined | string;
  readonly GPSLongitudeRef?: undefined | string;
  // Camera fields
  readonly Make?: undefined | string;
  readonly Model?: undefined | string;
  readonly Software?: undefined | string;
  readonly DateTimeOriginal?: undefined | string;
  readonly CreateDate?: undefined | string;
  readonly ModifyDate?: undefined | string;
  readonly ExposureTime?: undefined | string | number;
  readonly FNumber?: undefined | number;
  readonly ISO?: undefined | number;
  readonly FocalLength?: undefined | string | number;
  readonly LensModel?: undefined | string;
  readonly Orientation?: undefined | number | string;
  // Allow arbitrary additional fields from ExifTool
  readonly [key: string]: unknown;
}>;

/**
 * Schema for raw EXIF metadata from ExifTool.
 * Uses S.declare for pass-through validation since ExifTool handles parsing.
 */
export const ExifMetadataRaw = S.declare((input: unknown): input is ExifMetadataValue => P.isRecord(input), {
  identifier: "ExifMetadataRaw",
  title: "Raw EXIF Metadata",
  description: "Raw EXIF metadata extracted from an image file using ExifTool WASM",
});

export type ExifMetadataRaw = S.Schema.Type<typeof ExifMetadataRaw>;

/**
 * Cleaned and validated EXIF metadata with common fields extracted.
 * Extends S.Class for encoding/decoding and class semantics.
 */
export class ExifMetadata extends S.Class<ExifMetadata>("ExifMetadata")(
  {
    // File identification
    fileName: S.optional(S.String),
    fileType: S.optional(S.String),
    mimeType: S.optional(S.String),
    fileSize: S.optional(S.String),

    // Dimensions
    imageWidth: S.optional(S.Number),
    imageHeight: S.optional(S.Number),

    // Camera info
    make: S.optional(S.String),
    model: S.optional(S.String),
    software: S.optional(S.String),

    // Dates
    dateTimeOriginal: S.optional(S.String),
    createDate: S.optional(S.String),
    modifyDate: S.optional(S.String),

    // GPS (decimal degrees)
    gpsLatitude: S.optional(S.Number),
    gpsLongitude: S.optional(S.Number),
    gpsAltitude: S.optional(S.Number),

    // Orientation
    orientation: S.optional(S.Union(S.Number, S.String)),

    // Raw data for access to all fields
    raw: S.Record({ key: S.String, value: S.Unknown }),
  },
  {
    identifier: "ExifMetadata",
    title: "EXIF Metadata",
    description: "Cleaned and validated EXIF metadata with common fields extracted.",
  }
) {
  /**
   * Create ExifMetadata from raw ExifTool output.
   */
  static fromRaw(raw: ExifMetadataValue): ExifMetadata {
    return new ExifMetadata({
      fileName: P.isString(raw.FileName) ? raw.FileName : undefined,
      fileType: P.isString(raw.FileType) ? raw.FileType : undefined,
      mimeType: P.isString(raw.MIMEType) ? raw.MIMEType : undefined,
      fileSize: P.isString(raw.FileSize) ? raw.FileSize : undefined,
      imageWidth: P.isNumber(raw.ImageWidth) ? raw.ImageWidth : undefined,
      imageHeight: P.isNumber(raw.ImageHeight) ? raw.ImageHeight : undefined,
      make: P.isString(raw.Make) ? raw.Make : undefined,
      model: P.isString(raw.Model) ? raw.Model : undefined,
      software: P.isString(raw.Software) ? raw.Software : undefined,
      dateTimeOriginal: P.isString(raw.DateTimeOriginal) ? raw.DateTimeOriginal : undefined,
      createDate: P.isString(raw.CreateDate) ? raw.CreateDate : undefined,
      modifyDate: P.isString(raw.ModifyDate) ? raw.ModifyDate : undefined,
      gpsLatitude: P.isNumber(raw.GPSLatitude) ? raw.GPSLatitude : undefined,
      gpsLongitude: P.isNumber(raw.GPSLongitude) ? raw.GPSLongitude : undefined,
      gpsAltitude: P.isNumber(raw.GPSAltitude) ? raw.GPSAltitude : undefined,
      orientation: raw.Orientation,
      raw: raw as Record<string, unknown>,
    });
  }
}
export const constEmptyExifMetadata = thunk<ExifMetadataValue>(R.empty());
/**
 * Parse raw EXIF data from ExifTool JSON output.
 * Handles the array format that ExifTool returns with -json flag.
 */
export const parseExifToolOutput = (data: unknown): ExifMetadataValue =>
  F.pipe(
    Match.value(data),
    Match.when(A.isArray, (arr) => F.pipe(arr, A.head, O.filter(P.isRecord), O.getOrElse(constEmptyExifMetadata))),
    Match.when(P.isRecord, (obj) => obj as ExifMetadataValue),
    Match.orElse(constEmptyExifMetadata)
  );

/**
 * Get the number of keys in an ExifMetadata raw object.
 */
export const getExifFieldCount = (metadata: ExifMetadata): number => F.pipe(metadata.raw, R.keys, A.length);
