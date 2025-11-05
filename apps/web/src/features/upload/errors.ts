import * as Data from "effect/Data";

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly cause?: unknown | undefined;
  readonly fileName?: string | undefined;
  readonly fileType?: string | undefined;
  readonly fileSize?: number | undefined;
  readonly candidateMime?: string | undefined;
  readonly allowedMime?: ReadonlyArray<string> | undefined;
}> {}

export class DetectionError extends Data.TaggedError("DetectionError")<{
  readonly message: string;
  readonly cause?: unknown | undefined;
  readonly fileName?: string | undefined;
  readonly fileType?: string | undefined;
  readonly fileSize?: number | undefined;
  readonly chunkSize?: number | undefined;
}> {}

export class ExifParseError extends Data.TaggedError("ExifParseError")<{
  readonly message: string;
  readonly cause: unknown;
  readonly fileName?: string | undefined;
  readonly fileType?: string | undefined;
  readonly fileSize?: number | undefined;
  readonly phase?: "read" | "parse" | "decode" | undefined;
}> {}
