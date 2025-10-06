import * as Data from "effect/Data";

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly fileName?: string;
  readonly fileType?: string;
  readonly fileSize?: number;
  readonly candidateMime?: string;
  readonly allowedMime?: ReadonlyArray<string>;
}> {}

export class DetectionError extends Data.TaggedError("DetectionError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly fileName?: string;
  readonly fileType?: string;
  readonly fileSize?: number;
  readonly chunkSize?: number;
}> {}

export class ExifParseError extends Data.TaggedError("ExifParseError")<{
  readonly message: string;
  readonly cause: unknown;
  readonly fileName?: string;
  readonly fileType?: string;
  readonly fileSize?: number;
  readonly phase?: "read" | "parse" | "decode";
}> {}
