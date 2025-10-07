import { type ParseResult, Schema } from "effect";

export class MutatorAuthError extends Schema.TaggedError<MutatorAuthError>()("MutatorAuthError", {
  authData: Schema.Unknown,
  message: Schema.String,
}) {}

export class MutatorError extends Schema.TaggedError<MutatorError>()("MutatorError", {
  cause: Schema.optional(Schema.Unknown),
  input: Schema.Unknown,
  message: Schema.String,
  operation: Schema.Literal("delete", "insert", "update", "upsert"),
  orgId: Schema.String,
  tableName: Schema.String,
  userId: Schema.String,
}) {}

export type MutationErrorTypes = MutatorError | MutatorAuthError | ParseResult.ParseError;
