import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

/**
 * Tool name was not found in the toolkit.
 */
/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ToolNotFoundError extends TaggedErrorClass<ToolNotFoundError>()("ToolNotFoundError", {
  name: S.String,
  available: S.Array(S.String),
}) {
  static readonly make = (params: Pick<ToolNotFoundError, "name" | "available">) => new ToolNotFoundError(params);
}

/**
 * Tool parameters failed decoding or validation.
 */
/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ToolInputError extends TaggedErrorClass<ToolInputError>()("ToolInputError", {
  name: S.String,
  message: S.String,
  input: S.optional(S.Unknown),
  cause: S.optional(S.Defect),
}) {
  static readonly make = (params: Pick<ToolInputError, "name" | "message" | "input" | "cause">) =>
    new ToolInputError(params);
}

/**
 * Tool output failed validation or encoding.
 */
/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ToolOutputError extends TaggedErrorClass<ToolOutputError>()("ToolOutputError", {
  name: S.String,
  message: S.String,
  output: S.optional(S.Unknown),
  cause: S.optional(S.Defect),
}) {
  static readonly make = (params: Pick<ToolOutputError, "name" | "message" | "output" | "cause">) =>
    new ToolOutputError(params);
}

/**
 * Tool handler failed while executing.
 */
/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ToolHandlerError extends TaggedErrorClass<ToolHandlerError>()("ToolHandlerError", {
  name: S.String,
  message: S.String,
  cause: S.optional(S.Defect),
}) {
  static readonly make = (params: Pick<ToolHandlerError, "name" | "message" | "cause">) => new ToolHandlerError(params);
}

/**
 * Union of all tool-related errors.
 */
/**
 * @since 0.0.0
 * @category DomainModel
 */
export const ToolError = S.Union([ToolNotFoundError, ToolInputError, ToolOutputError, ToolHandlerError]);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ToolError = typeof ToolError.Type;
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ToolErrorEncoded = typeof ToolError.Encoded;
