import { $AiSdkId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { SDKResultSuccess, SDKUserMessage } from "./Message.js";
import { Options } from "./Options.js";
import { SDKSessionOptions } from "./Session.js";

const $I = $AiSdkId.create("core/Schema/Service");

/**
 * @since 0.0.0
 */
export const Tenant = S.String.annotate(
  $I.annote("Tenant", {
    description: "Schema for Tenant.",
  })
);

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
export const QueryInput = S.Struct({
  prompt: S.Union([S.String, S.Array(SDKUserMessage)]),
  options: S.optional(Options),
}).annotate(
  $I.annote("QueryInput", {
    description: "Schema for QueryInput.",
  })
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
export const QueryResultOutput = S.Struct({
  result: S.String,
  metadata: S.optional(SDKResultSuccess),
}).annotate(
  $I.annote("QueryResultOutput", {
    description: "Schema for QueryResultOutput.",
  })
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
export const SessionCreateInput = S.Struct({
  options: SDKSessionOptions,
  tenant: S.optional(Tenant),
}).annotate(
  $I.annote("SessionCreateInput", {
    description: "Schema for SessionCreateInput.",
  })
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
export const SessionCreateOutput = S.Struct({
  sessionId: S.String,
}).annotate(
  $I.annote("SessionCreateOutput", {
    description: "Schema for SessionCreateOutput.",
  })
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
export const SessionSendInput = S.Struct({
  message: S.Union([S.String, SDKUserMessage]),
  tenant: S.optional(Tenant),
}).annotate(
  $I.annote("SessionSendInput", {
    description: "Schema for SessionSendInput.",
  })
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
export const SessionInfo = S.Struct({
  sessionId: S.String,
  tenant: S.optional(Tenant),
  createdAt: S.DateTimeUtcFromMillis,
  lastUsedAt: S.DateTimeUtcFromMillis,
}).annotate(
  $I.annote("SessionInfo", {
    description: "Schema for SessionInfo.",
  })
);

/**
 * @since 0.0.0
 */
export type SessionInfo = typeof SessionInfo.Type;
/**
 * @since 0.0.0
 */
export type SessionInfoEncoded = typeof SessionInfo.Encoded;
