import * as Data from "effect/Data";

export class MetadataParseError extends Data.TaggedError("MetadataParseError")<{
  readonly message: string;
  readonly cause: unknown;
  readonly fileName?: string | undefined;
  readonly fileType?: string | undefined;
  readonly fileSize?: number | undefined;
  readonly phase?: "read" | "parse" | "decode" | undefined;
}> {}

export class FileReadError extends Data.TaggedError("FileReadError")<{
  readonly message: string;
  readonly cause: unknown;
  readonly fileName?: string | undefined;
  readonly fileType?: string | undefined;
  readonly fileSize?: number | undefined;
  readonly phase?: "read" | "parse" | "decode" | undefined;
}> {}
