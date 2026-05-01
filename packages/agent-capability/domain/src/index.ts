/**
 * Agent capability domain models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { LiteralKit } from "@beep/schema";
import { EntityIdValue } from "@beep/shared-domain/entity/EntityId";
import * as S from "effect/Schema";

/**
 * Agent mode used by the deterministic proof.
 *
 * @category models
 * @since 0.0.0
 */
export const AgentMode = LiteralKit(["deterministic_fixture"] as const);

/**
 * Agent definition available to the runtime proof.
 *
 * @category models
 * @since 0.0.0
 */
export class Agent extends S.Class<Agent>("@beep/agent-capability-domain/Agent")({
  fixtureKey: S.String,
  id: EntityIdValue,
  mode: AgentMode,
  name: S.String,
  skillFixtureKey: S.String,
}) {}

/**
 * Skill definition used by an agent.
 *
 * @category models
 * @since 0.0.0
 */
export class Skill extends S.Class<Skill>("@beep/agent-capability-domain/Skill")({
  fixtureKey: S.String,
  id: EntityIdValue,
  name: S.String,
}) {}
