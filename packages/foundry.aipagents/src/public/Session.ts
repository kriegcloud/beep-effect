/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type * as _Core from "@osdk/foundry.core";
import type {
  SharedClient as $OldClient,
  SharedClientContext as $OldClientContext,
} from "@osdk/shared.client";
import type {
  SharedClient as $Client,
  SharedClientContext as $ClientContext,
} from "@osdk/shared.client2";
import type { FoundryPlatformMethod as $FoundryPlatformMethod } from "@osdk/shared.net.platformapi";
import { foundryPlatformFetch as $foundryPlatformFetch } from "@osdk/shared.net.platformapi";
import type * as _AipAgents from "../_components.js";

//

const _create: $FoundryPlatformMethod<
  (
    agentRid: _AipAgents.AgentRid,
    $body: _AipAgents.CreateSessionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_AipAgents.Session>
> = [1, "/v2/aipAgents/agents/{0}/sessions", 3];

/**
 * Create a new conversation session between the calling user and an Agent.
 * Use `blockingContinue` or `streamingContinue` to start adding exchanges to the session.
 *
 * @beta
 *
 * Required Scopes: [api:aip-agents-write]
 * URL: /v2/aipAgents/agents/{agentRid}/sessions
 */
export function create(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    agentRid: _AipAgents.AgentRid,
    $body: _AipAgents.CreateSessionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_AipAgents.Session> {
  return $foundryPlatformFetch($ctx, _create, ...args);
}

const _deleteSession: $FoundryPlatformMethod<
  (
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [3, "/v2/aipAgents/agents/{0}/sessions/{1}", 2];

/**
 * Delete a conversation session between the calling user and an Agent.
 * Once deleted, the session can no longer be accessed and will not appear in session lists.
 *
 * @beta
 *
 * Required Scopes: [api:aip-agents-write]
 * URL: /v2/aipAgents/agents/{agentRid}/sessions/{sessionRid}
 */
export function deleteSession(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _deleteSession, ...args);
}

const _list: $FoundryPlatformMethod<
  (
    agentRid: _AipAgents.AgentRid,
    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ) => Promise<_AipAgents.ListSessionsResponse>
> = [0, "/v2/aipAgents/agents/{0}/sessions", 2];

/**
 * List all conversation sessions between the calling user and an Agent that was created by this client.
 * This does not list sessions for the user created by other clients.
 * For example, any sessions created by the user in AIP Agent Studio will not be listed here.
 * Sessions are returned in order of most recently updated first.
 *
 * @beta
 *
 * Required Scopes: [api:aip-agents-read]
 * URL: /v2/aipAgents/agents/{agentRid}/sessions
 */
export function list(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    agentRid: _AipAgents.AgentRid,

    $queryParams?: {
      pageSize?: _Core.PageSize | undefined;
      pageToken?: _Core.PageToken | undefined;
      preview?: _Core.PreviewMode | undefined;
    },
  ]
): Promise<_AipAgents.ListSessionsResponse> {
  return $foundryPlatformFetch($ctx, _list, ...args);
}

const _get: $FoundryPlatformMethod<
  (
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_AipAgents.Session>
> = [0, "/v2/aipAgents/agents/{0}/sessions/{1}", 2];

/**
 * Get the details of a conversation session between the calling user and an Agent.
 *
 * @beta
 *
 * Required Scopes: [api:aip-agents-read]
 * URL: /v2/aipAgents/agents/{agentRid}/sessions/{sessionRid}
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,

    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_AipAgents.Session> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _blockingContinue: $FoundryPlatformMethod<
  (
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,
    $body: _AipAgents.BlockingContinueSessionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_AipAgents.SessionExchangeResult>
> = [1, "/v2/aipAgents/agents/{0}/sessions/{1}/blockingContinue", 3];

/**
 * Continue a conversation session with an Agent, or add the first exchange to a session after creation.
 * Adds a new exchange to the session with the provided inputs, and generates a response from the Agent.
 * Blocks on returning the result of the added exchange until the response is fully generated.
 * Streamed responses are also supported; see `streamingContinue` for details.
 * Concurrent requests to continue the same session are not supported.
 * Clients should wait to receive a response before sending the next message.
 *
 * @beta
 *
 * Required Scopes: [api:aip-agents-write]
 * URL: /v2/aipAgents/agents/{agentRid}/sessions/{sessionRid}/blockingContinue
 */
export function blockingContinue(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,
    $body: _AipAgents.BlockingContinueSessionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_AipAgents.SessionExchangeResult> {
  return $foundryPlatformFetch($ctx, _blockingContinue, ...args);
}

const _streamingContinue: $FoundryPlatformMethod<
  (
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,
    $body: _AipAgents.StreamingContinueSessionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<Response>
> = [
  1,
  "/v2/aipAgents/agents/{0}/sessions/{1}/streamingContinue",
  3,
  ,
  "application/octet-stream",
];

/**
 * Continue a conversation session with an Agent, or add the first exchange to a session after creation.
 * Adds a new exchange to the session with the provided inputs, and generates a response from the Agent.
 * Returns a stream of the Agent response text (formatted using markdown) for clients to consume as the response is generated.
 * On completion of the streamed response, clients can load the full details of the exchange that was added to the session by reloading the session content.
 * Streamed exchanges also support cancellation; see `cancel` for details.
 * Concurrent requests to continue the same session are not supported.
 * Clients should wait to receive a response, or cancel the in-progress exchange, before sending the next message.
 *
 * @beta
 *
 * Required Scopes: [api:aip-agents-write]
 * URL: /v2/aipAgents/agents/{agentRid}/sessions/{sessionRid}/streamingContinue
 */
export function streamingContinue(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,
    $body: _AipAgents.StreamingContinueSessionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<Response> {
  return $foundryPlatformFetch($ctx, _streamingContinue, ...args);
}

const _cancel: $FoundryPlatformMethod<
  (
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,
    $body: _AipAgents.CancelSessionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_AipAgents.CancelSessionResponse>
> = [1, "/v2/aipAgents/agents/{0}/sessions/{1}/cancel", 3];

/**
 * Cancel an in-progress streamed exchange with an Agent which was initiated with `streamingContinue`.
 * Canceling an exchange allows clients to prevent the exchange from being added to the session, or to provide a response to replace the Agent-generated response.
 * Note that canceling an exchange does not terminate the stream returned by `streamingContinue`; clients should close the stream on triggering the cancellation request to stop reading from the stream.
 *
 * @beta
 *
 * Required Scopes: [api:aip-agents-write]
 * URL: /v2/aipAgents/agents/{agentRid}/sessions/{sessionRid}/cancel
 */
export function cancel(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,
    $body: _AipAgents.CancelSessionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_AipAgents.CancelSessionResponse> {
  return $foundryPlatformFetch($ctx, _cancel, ...args);
}

const _ragContext: $FoundryPlatformMethod<
  (
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,
    $body: _AipAgents.GetRagContextForSessionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_AipAgents.AgentSessionRagContextResponse>
> = [2, "/v2/aipAgents/agents/{0}/sessions/{1}/ragContext", 3];

/**
 * Retrieve relevant [context](https://www.palantir.com/docs/foundry/agent-studio/core-concepts/#retrieval-context) for a user message from the data sources configured for the session.
 * This allows clients to pre-retrieve context for a user message before sending it to the Agent with the `contextsOverride` option when continuing a session, to allow any pre-processing of the context before sending it to the Agent.
 *
 * @beta
 *
 * Required Scopes: [api:aip-agents-write]
 * URL: /v2/aipAgents/agents/{agentRid}/sessions/{sessionRid}/ragContext
 */
export function ragContext(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,
    $body: _AipAgents.GetRagContextForSessionRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_AipAgents.AgentSessionRagContextResponse> {
  return $foundryPlatformFetch($ctx, _ragContext, ...args);
}

const _updateTitle: $FoundryPlatformMethod<
  (
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,
    $body: _AipAgents.UpdateSessionTitleRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<void>
> = [2, "/v2/aipAgents/agents/{0}/sessions/{1}/updateTitle", 3];

/**
 * Update the title for a session.
 * Use this to set a custom title for a session to help identify it in the list of sessions with an Agent.
 *
 * @beta
 *
 * Required Scopes: [api:aip-agents-write]
 * URL: /v2/aipAgents/agents/{agentRid}/sessions/{sessionRid}/updateTitle
 */
export function updateTitle(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    agentRid: _AipAgents.AgentRid,
    sessionRid: _AipAgents.SessionRid,
    $body: _AipAgents.UpdateSessionTitleRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<void> {
  return $foundryPlatformFetch($ctx, _updateTitle, ...args);
}
