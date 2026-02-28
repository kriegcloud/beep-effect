import * as S from "effect/Schema";
import { withIdentifier } from "./Annotations.js";
import { SDKResultSuccess, SDKUserMessage } from "./Message.js";
import { Options } from "./Options.js";
import { SDKSessionOptions } from "./Session.js";

/**
 * @since 0.0.0
 */
export const Tenant = withIdentifier(S.String, "Tenant");

/**
 * @since 0.0.0
 */
export type Tenant = typeof Tenant.Type;
/**
 * @since 0.0.0
 */
export type TenantEncoded = typeof Tenant.Encoded;

/**
 * @since 0.0.0
 */
export const QueryInput = withIdentifier(
  S.Struct({
    prompt: S.Union([S.String, S.Array(SDKUserMessage)]),
    options: S.optional(Options),
  }),
  "QueryInput"
);

/**
 * @since 0.0.0
 */
export type QueryInput = typeof QueryInput.Type;
/**
 * @since 0.0.0
 */
export type QueryInputEncoded = typeof QueryInput.Encoded;

/**
 * @since 0.0.0
 */
export const QueryResultOutput = withIdentifier(
  S.Struct({
    result: S.String,
    metadata: S.optional(SDKResultSuccess),
  }),
  "QueryResultOutput"
);

/**
 * @since 0.0.0
 */
export type QueryResultOutput = typeof QueryResultOutput.Type;
/**
 * @since 0.0.0
 */
export type QueryResultOutputEncoded = typeof QueryResultOutput.Encoded;

/**
 * @since 0.0.0
 */
export const SessionCreateInput = withIdentifier(
  S.Struct({
    options: SDKSessionOptions,
    tenant: S.optional(Tenant),
  }),
  "SessionCreateInput"
);

/**
 * @since 0.0.0
 */
export type SessionCreateInput = typeof SessionCreateInput.Type;
/**
 * @since 0.0.0
 */
export type SessionCreateInputEncoded = typeof SessionCreateInput.Encoded;

/**
 * @since 0.0.0
 */
export const SessionCreateOutput = withIdentifier(
  S.Struct({
    sessionId: S.String,
  }),
  "SessionCreateOutput"
);

/**
 * @since 0.0.0
 */
export type SessionCreateOutput = typeof SessionCreateOutput.Type;
/**
 * @since 0.0.0
 */
export type SessionCreateOutputEncoded = typeof SessionCreateOutput.Encoded;

/**
 * @since 0.0.0
 */
export const SessionSendInput = withIdentifier(
  S.Struct({
    message: S.Union([S.String, SDKUserMessage]),
    tenant: S.optional(Tenant),
  }),
  "SessionSendInput"
);

/**
 * @since 0.0.0
 */
export type SessionSendInput = typeof SessionSendInput.Type;
/**
 * @since 0.0.0
 */
export type SessionSendInputEncoded = typeof SessionSendInput.Encoded;

/**
 * @since 0.0.0
 */
export const SessionInfo = withIdentifier(
  S.Struct({
    sessionId: S.String,
    tenant: S.optional(Tenant),
    createdAt: S.Number,
    lastUsedAt: S.Number,
  }),
  "SessionInfo"
);

/**
 * @since 0.0.0
 */
export type SessionInfo = typeof SessionInfo.Type;
/**
 * @since 0.0.0
 */
export type SessionInfoEncoded = typeof SessionInfo.Encoded;
