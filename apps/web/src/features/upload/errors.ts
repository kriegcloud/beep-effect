import { $WebId } from "@beep/identity/packages";
import * as Data from "effect/Data";

const $I = $WebId.create("features/upload/errors");

export class ValidationError extends Data.TaggedError($I`ValidationError`)<{
  readonly message: string;
  readonly cause?: unknown | undefined;
  readonly fileName?: string | undefined;
  readonly fileType?: string | undefined;
  readonly fileSize?: number | undefined;
  readonly candidateMime?: string | undefined;
  readonly allowedMime?: ReadonlyArray<string> | undefined;
}> {}

export class DetectionError extends Data.TaggedError($I`DetectionError`)<{
  readonly message: string;
  readonly cause?: unknown | undefined;
  readonly fileName?: string | undefined;
  readonly fileType?: string | undefined;
  readonly fileSize?: number | undefined;
  readonly chunkSize?: number | undefined;
}> {}

export class MetadataParseError extends Data.TaggedError($I`MetadataParseError`)<{
  readonly message: string;
  readonly cause: unknown;
  readonly fileName?: string | undefined;
  readonly fileType?: string | undefined;
  readonly fileSize?: number | undefined;
  readonly phase?: "read" | "parse" | "decode" | undefined;
}> {}
