import * as Data from "effect/Data";

export class ExifParseError extends Data.TaggedError("ExifParseError")<{
  readonly message: string;
  readonly cause: unknown;
  readonly fileName?: string | undefined;
  readonly fileType?: string | undefined;
  readonly fileSize?: number | undefined;
  readonly phase?: "read" | "parse" | "decode" | undefined;
}> {}
