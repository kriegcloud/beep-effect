/**
 * Gateway HTTP error types.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";
import { HttpApiSchema } from "effect/unstable/httpapi";

/**
 * @since 0.1.0
 * @category errors
 */
export class GatewayBadRequest extends Schema.TaggedErrorClass<GatewayBadRequest>()("GatewayBadRequest", {
  message: Schema.String,
}) {
  static readonly status = HttpApiSchema.status(400);
}

/**
 * @since 0.1.0
 * @category errors
 */
export class GatewayNotFound extends Schema.TaggedErrorClass<GatewayNotFound>()("GatewayNotFound", {
  message: Schema.String,
}) {
  static readonly status = HttpApiSchema.status(404);
}

/**
 * @since 0.1.0
 * @category errors
 */
export class GatewayTimeout extends Schema.TaggedErrorClass<GatewayTimeout>()("GatewayTimeout", {
  message: Schema.String,
}) {
  static readonly status = HttpApiSchema.status(504);
}

/**
 * @since 0.1.0
 * @category errors
 */
export class GatewayInternalError extends Schema.TaggedErrorClass<GatewayInternalError>()("GatewayInternalError", {
  message: Schema.String,
}) {
  static readonly status = HttpApiSchema.status(500);
}
