/**
 * Template for Todox Agent Configuration
 *
 * Use this template when creating new agent configurations in Phase 4.
 *
 * @category Templates
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { AgentConfig } from "./agent-config.template";
 *
 * const myAgent = S.decodeUnknownSync(AgentConfig)({
 *   id: "agent-123",
 *   orgId: "org-456",
 *   name: "Email Assistant",
 *   systemPrompt: "You are a helpful email assistant for wealth management...",
 *   contextSources: [
 *     { type: "workspace", sourceId: "ws-789" },
 *     { type: "database", sourceId: "db-clients" },
 *   ],
 *   toolPermissions: [
 *     { toolId: "email.draft", enabled: true, requiresApproval: false },
 *     { toolId: "email.send", enabled: true, requiresApproval: true },
 *   ],
 *   triggers: [
 *     { type: "manual", config: {} },
 *   ],
 * });
 * ```
 */

import * as S from "effect/Schema";

/**
 * Context source types that agents can access
 */
export const ContextSourceType = S.Literal("workspace", "database", "email");
export type ContextSourceType = S.Schema.Type<typeof ContextSourceType>;

/**
 * Trigger types for agent automation
 */
export const TriggerType = S.Literal("manual", "schedule", "event");
export type TriggerType = S.Schema.Type<typeof TriggerType>;

/**
 * Context source configuration
 *
 * Defines what data sources an agent can access for context.
 */
export class ContextSource extends S.Class<ContextSource>("ContextSource")({
  type: ContextSourceType,
  sourceId: S.String,
}) {}

/**
 * Tool permission configuration
 *
 * Controls which tools an agent can use and whether approval is required.
 */
export class ToolPermission extends S.Class<ToolPermission>("ToolPermission")({
  toolId: S.String,
  enabled: S.Boolean,
  requiresApproval: S.Boolean,
}) {}

/**
 * Automation trigger configuration
 *
 * Defines when an agent should be activated automatically.
 */
export class AgentTrigger extends S.Class<AgentTrigger>("AgentTrigger")({
  type: TriggerType,
  config: S.Record({ key: S.String, value: S.Unknown }),
}) {}

/**
 * Agent personality settings
 *
 * Controls the agent's communication style.
 */
export class PersonalitySettings extends S.Class<PersonalitySettings>(
  "PersonalitySettings"
)({
  tone: S.optional(S.Literal("formal", "friendly", "professional")),
  verbosity: S.optional(S.Literal("concise", "detailed")),
}) {}

/**
 * Complete agent configuration schema
 *
 * This is the primary schema for defining AI agents in Todox.
 * All agent configurations must conform to this schema.
 *
 * @example
 * ```typescript
 * const decoded = yield* S.decodeUnknown(AgentConfig)(rawConfig);
 * ```
 */
export class AgentConfig extends S.Class<AgentConfig>("AgentConfig")({
  /** Unique identifier for the agent */
  id: S.String,

  /** Organization that owns this agent */
  orgId: S.String,

  /** Human-readable name for the agent */
  name: S.String,

  /** Base system prompt that defines agent behavior */
  systemPrompt: S.String,

  /** Optional personality configuration */
  personality: S.optional(PersonalitySettings),

  /** Data sources the agent can access for context */
  contextSources: S.Array(ContextSource),

  /** Tools the agent is allowed to use */
  toolPermissions: S.Array(ToolPermission),

  /** Automation triggers for the agent */
  triggers: S.Array(AgentTrigger),

  /** Optional description for UI display */
  description: S.optional(S.String),

  /** Optional avatar URL for UI display */
  avatarUrl: S.optional(S.String),

  /** Whether the agent is active */
  isActive: S.optional(S.Boolean),
}) {}

/**
 * Request payload for creating a new agent
 */
export class CreateAgentPayload extends S.Class<CreateAgentPayload>(
  "CreateAgentPayload"
)({
  orgId: S.String,
  name: S.String,
  systemPrompt: S.String,
  personality: S.optional(PersonalitySettings),
  contextSources: S.Array(ContextSource),
  toolPermissions: S.Array(ToolPermission),
  triggers: S.Array(AgentTrigger),
  description: S.optional(S.String),
  avatarUrl: S.optional(S.String),
}) {}

/**
 * Request payload for updating an existing agent
 */
export class UpdateAgentPayload extends S.Class<UpdateAgentPayload>(
  "UpdateAgentPayload"
)({
  name: S.optional(S.String),
  systemPrompt: S.optional(S.String),
  personality: S.optional(PersonalitySettings),
  contextSources: S.optional(S.Array(ContextSource)),
  toolPermissions: S.optional(S.Array(ToolPermission)),
  triggers: S.optional(S.Array(AgentTrigger)),
  description: S.optional(S.String),
  avatarUrl: S.optional(S.String),
  isActive: S.optional(S.Boolean),
}) {}
