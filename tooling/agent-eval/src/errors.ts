/**
 * Typed errors for the agent-eval package.
 *
 * @since 0.0.0
 * @module
 */

import { $AgentEvalId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $AgentEvalId.create("errors");

/**
 * Raised when decoding JSON or structured payloads fails.
 *
 * @since 0.0.0
 * @category errors
 */
export class AgentEvalDecodeError extends S.TaggedErrorClass<AgentEvalDecodeError>($I`AgentEvalDecodeError`)(
  "AgentEvalDecodeError",
  {
    message: S.String,
    source: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annote("AgentEvalDecodeError", {
    title: "Agent Eval Decode Error",
    description: "Failed to decode structured input for agent-eval operations.",
  })
) {}

/**
 * Raised when benchmark configuration is invalid.
 *
 * @since 0.0.0
 * @category errors
 */
export class AgentEvalConfigError extends S.TaggedErrorClass<AgentEvalConfigError>($I`AgentEvalConfigError`)(
  "AgentEvalConfigError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annote("AgentEvalConfigError", {
    title: "Agent Eval Config Error",
    description: "Benchmark configuration is invalid or inconsistent.",
  })
) {}

/**
 * Raised when runtime invariants are violated.
 *
 * @since 0.0.0
 * @category errors
 */
export class AgentEvalInvariantError extends S.TaggedErrorClass<AgentEvalInvariantError>($I`AgentEvalInvariantError`)(
  "AgentEvalInvariantError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annote("AgentEvalInvariantError", {
    title: "Agent Eval Invariant Error",
    description: "An internal invariant was violated during agent-eval execution.",
  })
) {}

/**
 * Raised when Graphiti MCP protocol expectations are not met.
 *
 * @since 0.0.0
 * @category errors
 */
export class AgentEvalProtocolError extends S.TaggedErrorClass<AgentEvalProtocolError>($I`AgentEvalProtocolError`)(
  "AgentEvalProtocolError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annote("AgentEvalProtocolError", {
    title: "Agent Eval Protocol Error",
    description: "Graphiti MCP protocol response was missing required fields.",
  })
) {}
