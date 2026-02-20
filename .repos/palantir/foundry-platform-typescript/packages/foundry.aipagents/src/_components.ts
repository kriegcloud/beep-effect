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
import type * as _Functions from "@osdk/foundry.functions";
import type * as _Ontologies from "@osdk/foundry.ontologies";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * Log Safety: UNSAFE
 */
export interface Agent {
  rid: AgentRid;
  version: AgentVersionString;
  metadata: AgentMetadata;
  parameters: Record<ParameterId, Parameter>;
}

/**
 * The final answer for an exchange. Responses are formatted using markdown.
 *
 * Log Safety: UNSAFE
 */
export type AgentMarkdownResponse = LooselyBrandedString<
  "AgentMarkdownResponse"
>;

/**
 * Metadata for an Agent.
 *
 * Log Safety: UNSAFE
 */
export interface AgentMetadata {
  displayName: string;
  description?: string;
  inputPlaceholder?: string;
  suggestedPrompts: Array<string>;
}

/**
 * An RID identifying an AIP Agent created in AIP Agent Studio.
 *
 * Log Safety: SAFE
 */
export type AgentRid = LooselyBrandedString<"AgentRid">;

/**
 * Context retrieved from an Agent's configured context data sources which was relevant to the supplied user message.
 *
 * Log Safety: UNSAFE
 */
export interface AgentSessionRagContextResponse {
  objectContexts: Array<ObjectContext>;
  functionRetrievedContexts: Array<FunctionRetrievedContext>;
}

/**
   * A page of results for sessions across all accessible Agents for the calling user.
Sessions are returned in order of most recently updated first.
   *
   * Log Safety: UNSAFE
   */
export interface AgentsSessionsPage {
  nextPageToken?: _Core.PageToken;
  data: Array<Session>;
}

/**
 * Log Safety: SAFE
 */
export interface AgentVersion {
  string: AgentVersionString;
  version: AgentVersionDetails;
}

/**
 * Semantic version details for an Agent.
 *
 * Log Safety: SAFE
 */
export interface AgentVersionDetails {
  major: number;
  minor: number;
}

/**
 * The semantic version of the Agent, formatted as "majorVersion.minorVersion".
 *
 * Log Safety: SAFE
 */
export type AgentVersionString = LooselyBrandedString<"AgentVersionString">;

/**
 * Log Safety: UNSAFE
 */
export interface BlockingContinueSessionRequest {
  userInput: UserTextInput;
  parameterInputs: Record<ParameterId, ParameterValue>;
  contextsOverride?: Array<InputContext>;
  sessionTraceId?: SessionTraceId;
}

/**
 * Log Safety: UNSAFE
 */
export interface CancelSessionRequest {
  messageId: MessageId;
  response?: AgentMarkdownResponse;
}

/**
 * Log Safety: UNSAFE
 */
export interface CancelSessionResponse {
  result?: SessionExchangeResult;
}

/**
 * Log Safety: UNSAFE
 */
export interface Content {
  exchanges: Array<SessionExchange>;
}

/**
 * Log Safety: SAFE
 */
export interface CreateSessionRequest {
  agentVersion?: AgentVersionString;
}

/**
 * The failed output of a tool call.
 *
 * Log Safety: UNSAFE
 */
export interface FailureToolCallOutput {
  correctionMessage: string;
}

/**
 * Context retrieved from running a function to include as additional context in the prompt to the Agent.
 *
 * Log Safety: UNSAFE
 */
export interface FunctionRetrievedContext {
  functionRid: _Functions.FunctionRid;
  functionVersion: _Functions.FunctionVersion;
  retrievedPrompt: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface GetRagContextForSessionRequest {
  userInput: UserTextInput;
  parameterInputs: Record<ParameterId, ParameterValue>;
}

/**
 * Custom retrieved context to provide to an Agent for continuing a session.
 *
 * Log Safety: UNSAFE
 */
export type InputContext =
  | ({ type: "functionRetrievedContext" } & FunctionRetrievedContext)
  | ({ type: "objectContext" } & ObjectContext);

/**
 * Log Safety: UNSAFE
 */
export interface ListAgentVersionsResponse {
  data: Array<AgentVersion>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListSessionsResponse {
  data: Array<Session>;
  nextPageToken?: _Core.PageToken;
}

/**
   * An ephemeral client-generated Universally Unique Identifier (UUID) to identify a message for streamed session responses.
This can be used by clients to cancel a streamed exchange.
   *
   * Log Safety: SAFE
   */
export type MessageId = string;

/**
 * Details of relevant retrieved object instances for a user's message to include as additional context in the prompt to the Agent.
 *
 * Log Safety: SAFE
 */
export interface ObjectContext {
  objectRids: Array<_Ontologies.ObjectRid>;
  propertyTypeRids: Array<_Ontologies.PropertyTypeRid>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ObjectSetParameter {
  expectedObjectTypes: Array<_Ontologies.ObjectTypeId>;
}

/**
 * A value passed for ObjectSetParameter application variable types.
 *
 * Log Safety: UNSAFE
 */
export interface ObjectSetParameterValue {
  objectSet: _Ontologies.ObjectSet;
  ontology: _Ontologies.OntologyIdentifier;
}

/**
 * Log Safety: SAFE
 */
export interface ObjectSetParameterValueUpdate {
  value: _Ontologies.ObjectSetRid;
}

/**
 * A variable configured in the application state of an Agent in AIP Agent Studio.
 *
 * Log Safety: UNSAFE
 */
export interface Parameter {
  parameterType: ParameterType;
  access: ParameterAccessMode;
  description?: string;
}

/**
   * READ_ONLY: Allows the variable to be read by the Agent, but the Agent cannot generate updates for it.
READ_WRITE: Allows the variable to be read and updated by the Agent.
   *
   * Log Safety: SAFE
   */
export type ParameterAccessMode = "READ_ONLY" | "READ_WRITE";

/**
 * The unique identifier for a variable configured in the application state of an Agent in AIP Agent Studio.
 *
 * Log Safety: UNSAFE
 */
export type ParameterId = LooselyBrandedString<"ParameterId">;

/**
 * Log Safety: UNSAFE
 */
export type ParameterType =
  | ({ type: "string" } & StringParameter)
  | ({ type: "objectSet" } & ObjectSetParameter);

/**
 * The value provided for a variable configured in the application state of an Agent.
 *
 * Log Safety: UNSAFE
 */
export type ParameterValue =
  | ({ type: "string" } & StringParameterValue)
  | ({ type: "objectSet" } & ObjectSetParameterValue);

/**
   * A value update for an application variable generated by the Agent.
For StringParameter types, this will be the updated string value.
For ObjectSetParameter types, this will be a Resource Identifier (RID) for the updated object set.
   *
   * Log Safety: UNSAFE
   */
export type ParameterValueUpdate =
  | ({ type: "string" } & StringParameterValue)
  | ({ type: "objectSet" } & ObjectSetParameterValueUpdate);

/**
 * A Resource Identifier (RID) that was passed as input to a tool.
 *
 * Log Safety: UNSAFE
 */
export interface RidToolInputValue {
  rid: string;
}

/**
 * A Resource Identifier (RID) value that was returned from a tool.
 *
 * Log Safety: UNSAFE
 */
export interface RidToolOutputValue {
  rid: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface Session {
  rid: SessionRid;
  metadata: SessionMetadata;
  agentRid: AgentRid;
  agentVersion: AgentVersionString;
}

/**
 * Represents an individual exchange between a user and an Agent in a conversation session.
 *
 * Log Safety: UNSAFE
 */
export interface SessionExchange {
  userInput: UserTextInput;
  contexts?: SessionExchangeContexts;
  result: SessionExchangeResult;
}

/**
 * Retrieved context which was passed to the Agent as input for the exchange.
 *
 * Log Safety: UNSAFE
 */
export interface SessionExchangeContexts {
  objectContexts: Array<ObjectContext>;
  functionRetrievedContexts: Array<FunctionRetrievedContext>;
}

/**
 * The returned result from the Agent for a session exchange.
 *
 * Log Safety: UNSAFE
 */
export interface SessionExchangeResult {
  agentMarkdownResponse: AgentMarkdownResponse;
  parameterUpdates: Record<ParameterId, ParameterValueUpdate>;
  totalTokensUsed?: number;
  interruptedOutput: boolean;
  sessionTraceId: SessionTraceId;
}

/**
 * Metadata for a conversation session with an Agent.
 *
 * Log Safety: UNSAFE
 */
export interface SessionMetadata {
  title: string;
  createdTime: string;
  updatedTime: string;
  messageCount: number;
  estimatedExpiresTime: string;
}

/**
 * The Resource Identifier (RID) of the conversation session.
 *
 * Log Safety: SAFE
 */
export type SessionRid = LooselyBrandedString<"SessionRid">;

/**
 * Log Safety: UNSAFE
 */
export interface SessionTrace {
  id: SessionTraceId;
  status: SessionTraceStatus;
  contexts?: SessionExchangeContexts;
  toolCallGroups: Array<ToolCallGroup>;
}

/**
   * The unique identifier for a trace. The trace lists the sequence of steps that an Agent took to arrive at an
answer. For example, a trace may include steps such as context retrieval and tool calls.
   *
   * Log Safety: SAFE
   */
export type SessionTraceId = string;

/**
 * Log Safety: SAFE
 */
export type SessionTraceStatus = "IN_PROGRESS" | "COMPLETE";

/**
 * Log Safety: UNSAFE
 */
export interface StreamingContinueSessionRequest {
  userInput: UserTextInput;
  parameterInputs: Record<ParameterId, ParameterValue>;
  contextsOverride?: Array<InputContext>;
  messageId?: MessageId;
  sessionTraceId?: SessionTraceId;
}

/**
 * Log Safety: UNSAFE
 */
export interface StringParameter {
  defaultValue?: string;
}

/**
 * A value passed for StringParameter application variable types.
 *
 * Log Safety: UNSAFE
 */
export interface StringParameterValue {
  value: string;
}

/**
 * A string value that was passed as input to a tool.
 *
 * Log Safety: UNSAFE
 */
export interface StringToolInputValue {
  value: string;
}

/**
 * A string value that was returned from a tool.
 *
 * Log Safety: UNSAFE
 */
export interface StringToolOutputValue {
  value: string;
}

/**
 * The successful output of a tool call.
 *
 * Log Safety: UNSAFE
 */
export interface SuccessToolCallOutput {
  output: ToolOutputValue;
}

/**
 * A tool call with its input and output.
 *
 * Log Safety: UNSAFE
 */
export interface ToolCall {
  toolMetadata: ToolMetadata;
  input: ToolCallInput;
  output?: ToolCallOutput;
}

/**
 * List of tool calls that were triggered at the same point in the trace for the agent response generation.
 *
 * Log Safety: UNSAFE
 */
export interface ToolCallGroup {
  toolCalls: Array<ToolCall>;
}

/**
 * Input parameters for a tool call.
 *
 * Log Safety: UNSAFE
 */
export interface ToolCallInput {
  thought?: string;
  inputs: Record<ToolInputName, ToolInputValue>;
}

/**
 * The output of a tool call.
 *
 * Log Safety: UNSAFE
 */
export type ToolCallOutput =
  | ({ type: "success" } & SuccessToolCallOutput)
  | ({ type: "failure" } & FailureToolCallOutput);

/**
 * The name of a tool input parameter.
 *
 * Log Safety: UNSAFE
 */
export type ToolInputName = LooselyBrandedString<"ToolInputName">;

/**
 * A tool input value, which can be either a string or a Resource Identifier (RID).
 *
 * Log Safety: UNSAFE
 */
export type ToolInputValue =
  | ({ type: "string" } & StringToolInputValue)
  | ({ type: "rid" } & RidToolInputValue);

/**
 * Details about the used tool.
 *
 * Log Safety: UNSAFE
 */
export interface ToolMetadata {
  name: string;
  type: ToolType;
}

/**
 * A tool output value, which can be either a string or a Resource Identifier (RID).
 *
 * Log Safety: UNSAFE
 */
export type ToolOutputValue =
  | ({ type: "string" } & StringToolOutputValue)
  | ({ type: "rid" } & RidToolOutputValue);

/**
 * Log Safety: SAFE
 */
export type ToolType =
  | "FUNCTION"
  | "ACTION"
  | "ONTOLOGY_SEMANTIC_SEARCH"
  | "OBJECT_QUERY"
  | "UPDATE_APPLICATION_VARIABLE"
  | "REQUEST_CLARIFICATION"
  | "OBJECT_QUERY_WITH_SQL"
  | "CODE_EXECUTION";

/**
 * Log Safety: UNSAFE
 */
export interface UpdateSessionTitleRequest {
  title: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface UserTextInput {
  text: string;
}
