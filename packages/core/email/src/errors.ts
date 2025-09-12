import * as Data from "effect/Data";

export class EmailTemplateRenderError extends Data.TaggedError("EmailTemplateRenderError")<{
  operation: string;
  cause: unknown;
}> {}
