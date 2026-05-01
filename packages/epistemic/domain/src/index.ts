/**
 * Epistemic domain models for claims, evidence, activities, and usage.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { LiteralKit } from "@beep/schema";
import { EntityIdValue } from "@beep/shared-domain/entity/EntityId";
import * as S from "effect/Schema";

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Candidate lifecycle vocabulary for claim outputs.
 *
 * @category models
 * @since 0.0.0
 */
export const ClaimLifecycle = LiteralKit(["candidate"] as const);

/**
 * Candidate claim proposed by an agent with source evidence.
 *
 * @category models
 * @since 0.0.0
 */
export class CandidateClaim extends S.Class<CandidateClaim>("@beep/epistemic-domain/CandidateClaim")({
  fixtureKey: S.String,
  id: EntityIdValue,
  lifecycle: ClaimLifecycle,
  snapshot: UnknownRecord,
}) {}

/**
 * Source span evidence reference.
 *
 * @category models
 * @since 0.0.0
 */
export class Evidence extends S.Class<Evidence>("@beep/epistemic-domain/Evidence")({
  artifactFixtureKey: S.String,
  id: EntityIdValue,
  spanFixtureKey: S.String,
}) {}

/**
 * Provenance activity produced by the runtime proof.
 *
 * @category models
 * @since 0.0.0
 */
export class Activity extends S.Class<Activity>("@beep/epistemic-domain/Activity")({
  fixtureKey: S.String,
  id: EntityIdValue,
  snapshot: UnknownRecord,
}) {}

/**
 * Usage attribution record for a fixture agent run.
 *
 * @category models
 * @since 0.0.0
 */
export class UsageRecord extends S.Class<UsageRecord>("@beep/epistemic-domain/UsageRecord")({
  fixtureKey: S.String,
  id: EntityIdValue,
  snapshot: UnknownRecord,
}) {}
