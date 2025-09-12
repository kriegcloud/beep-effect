import * as Data from "effect/Data";

export class ExifParseError extends Data.TaggedError("ExifParseError")<{
  readonly message: string;
  readonly cause: unknown;
  readonly fileName?: string;
  readonly fileType?: string;
  readonly fileSize?: number;
  readonly phase?: "read" | "parse" | "decode";
}> {}

export class FileReadError extends Data.TaggedError("FileReadError")<{
  readonly message: string;
  readonly cause: unknown;
  readonly fileName?: string;
  readonly fileType?: string;
  readonly fileSize?: number;
  readonly phase?: "read" | "parse" | "decode";
}> {}
