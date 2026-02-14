import * as Schema from "effect/Schema"

export class SandboxError extends Schema.TaggedError<SandboxError>()(
  "SandboxError",
  {
    message: Schema.String,
    operation: Schema.String,
    provider: Schema.Literal("local", "cloudflare"),
    cause: Schema.optional(Schema.Defect)
  }
) {}
