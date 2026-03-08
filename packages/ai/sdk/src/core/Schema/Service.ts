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
    description: "Tenant slug used to scope SDK sessions, storage, and API requests.",
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
export class QueryInput extends S.Class<QueryInput>($I`QueryInput`)(
  {
    prompt: S.Union([S.String, S.Array(SDKUserMessage)]),
    options: S.optional(Options),
  },
  $I.annote("QueryInput", {
    description: "Request payload for running an SDK query with an optional execution configuration.",
  })
) {}
/**
 * @since 0.0.0
 */
export type QueryInputEncoded = typeof QueryInput.Encoded;

/**
 * @since 0.0.0
 */
export class QueryResultOutput extends S.Class<QueryResultOutput>($I`QueryResultOutput`)(
  {
    result: S.String,
    metadata: S.optional(SDKResultSuccess),
  },
  $I.annote("QueryResultOutput", {
    description: "Synchronous query result text with optional SDK success metadata.",
  })
) {}
/**
 * @since 0.0.0
 */
export type QueryResultOutputEncoded = typeof QueryResultOutput.Encoded;

/**
 * @since 0.0.0
 */
export class SessionCreateInput extends S.Class<SessionCreateInput>($I`SessionCreateInput`)(
  {
    options: SDKSessionOptions,
    tenant: S.optional(Tenant),
  },
  $I.annote("SessionCreateInput", {
    description: "Request payload for creating a session with options and optional tenant scoping.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SessionCreateInputEncoded = typeof SessionCreateInput.Encoded;

/**
 * @since 0.0.0
 */
export class SessionCreateOutput extends S.Class<SessionCreateOutput>($I`SessionCreateOutput`)(
  {
    sessionId: S.String,
  },
  $I.annote("SessionCreateOutput", {
    description: "Session creation response containing the allocated session identifier.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SessionCreateOutputEncoded = typeof SessionCreateOutput.Encoded;

/**
 * @since 0.0.0
 */
export class SessionSendInput extends S.Class<SessionSendInput>($I`SessionSendInput`)(
  {
    message: S.Union([S.String, SDKUserMessage]),
    tenant: S.optional(Tenant),
  },
  $I.annote("SessionSendInput", {
    description: "Message payload sent to an existing session with optional tenant scoping.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SessionSendInputEncoded = typeof SessionSendInput.Encoded;

/**
 * @since 0.0.0
 */
export class SessionInfo extends S.Class<SessionInfo>($I`SessionInfo`)(
  {
    sessionId: S.String,
    tenant: S.optional(Tenant),
    createdAt: S.DateTimeUtcFromMillis,
    lastUsedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("SessionInfo", {
    description: "Session metadata returned by the SDK session service.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SessionInfoEncoded = typeof SessionInfo.Encoded;

/**
 * @since 0.0.0
 */
export class QueryStreamQuery extends S.Class<QueryStreamQuery>($I`QueryStreamQuery`)(
  {
    prompt: S.String,
  },
  $I.annote("QueryStreamQuery", {
    description: "Query parameters for streaming a one-shot prompt over the agent HTTP API.",
  })
) {}
/**
 * @since 0.0.0
 */
export type QueryStreamQueryEncoded = typeof QueryStreamQuery.Encoded;

/**
 * @since 0.0.0
 */
export class SessionTenantScope extends S.Class<SessionTenantScope>($I`SessionTenantScope`)(
  {
    tenant: S.optional(Tenant),
  },
  $I.annote("SessionTenantScope", {
    description: "Tenant selector used to scope session operations without a message payload.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SessionTenantScopeEncoded = typeof SessionTenantScope.Encoded;

/**
 * @since 0.0.0
 */
export class SessionPathParams extends S.Class<SessionPathParams>($I`SessionPathParams`)(
  {
    id: S.String,
  },
  $I.annote("SessionPathParams", {
    description: "Route params selecting a session by its public session identifier.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SessionPathParamsEncoded = typeof SessionPathParams.Encoded;

/**
 * @since 0.0.0
 */
export class SessionSelection extends S.Class<SessionSelection>($I`SessionSelection`)(
  {
    sessionId: S.String,
    tenant: S.optional(Tenant),
  },
  $I.annote("SessionSelection", {
    description: "RPC payload selecting a session and optional tenant for read or close operations.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SessionSelectionEncoded = typeof SessionSelection.Encoded;

/**
 * @since 0.0.0
 */
export class ResumeSessionInput extends S.Class<ResumeSessionInput>($I`ResumeSessionInput`)(
  {
    sessionId: S.String,
    options: SDKSessionOptions,
    tenant: S.optional(Tenant),
  },
  $I.annote("ResumeSessionInput", {
    description: "RPC payload for resuming an existing session with explicit session options.",
  })
) {}
/**
 * @since 0.0.0
 */
export type ResumeSessionInputEncoded = typeof ResumeSessionInput.Encoded;

/**
 * @since 0.0.0
 */
export class SessionSendRequest extends S.Class<SessionSendRequest>($I`SessionSendRequest`)(
  {
    sessionId: S.String,
    message: S.Union([S.String, SDKUserMessage]),
    tenant: S.optional(Tenant),
  },
  $I.annote("SessionSendRequest", {
    description: "RPC payload for sending a message to a selected session.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SessionSendRequestEncoded = typeof SessionSendRequest.Encoded;
