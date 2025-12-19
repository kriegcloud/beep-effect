import * as Data from "effect/Data";

export class UploadError extends Data.TaggedError("UploadError")<{
  readonly message?: string;
  readonly code: string;
  readonly cause?: unknown;
}> {}
