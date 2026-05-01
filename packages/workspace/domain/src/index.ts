/**
 * Workspace domain models for the Agentic Professional Runtime.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { LiteralKit } from "@beep/schema";
import { EntityIdValue } from "@beep/shared-domain/entity/EntityId";
import * as S from "effect/Schema";

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Candidate lifecycle vocabulary for proof outputs.
 *
 * @category models
 * @since 0.0.0
 */
export const CandidateLifecycle = LiteralKit(["candidate"] as const);

/**
 * Review decision vocabulary for approval gates.
 *
 * @category models
 * @since 0.0.0
 */
export const ApprovalDecision = LiteralKit(["pending"] as const);

/**
 * User or team work area.
 *
 * @category models
 * @since 0.0.0
 */
export class Workspace extends S.Class<Workspace>("@beep/workspace-domain/Workspace")({
  fixtureKey: S.String,
  id: EntityIdValue,
  name: S.String,
  organizationFixtureKey: S.String,
  ownerPrincipalFixtureKey: S.String,
}) {}

/**
 * Normalized email artifact imported into a workspace thread.
 *
 * @category models
 * @since 0.0.0
 */
export class EmailArtifact extends S.Class<EmailArtifact>("@beep/workspace-domain/EmailArtifact")({
  artifactFixtureKey: S.String,
  body: S.String,
  from: UnknownRecord,
  id: EntityIdValue,
  receivedAt: S.String,
  sourceSpans: S.Array(S.String),
  subject: S.String,
  threadFixtureKey: S.String,
  to: S.Array(UnknownRecord),
}) {}

/**
 * Candidate project proposed by an agent.
 *
 * @category models
 * @since 0.0.0
 */
export class CandidateProject extends S.Class<CandidateProject>("@beep/workspace-domain/CandidateProject")({
  fixtureKey: S.String,
  id: EntityIdValue,
  lifecycle: CandidateLifecycle,
  snapshot: UnknownRecord,
}) {}

/**
 * Candidate task proposed by an agent.
 *
 * @category models
 * @since 0.0.0
 */
export class CandidateTask extends S.Class<CandidateTask>("@beep/workspace-domain/CandidateTask")({
  fixtureKey: S.String,
  id: EntityIdValue,
  lifecycle: CandidateLifecycle,
  snapshot: UnknownRecord,
}) {}

/**
 * Candidate draft artifact proposed by an agent.
 *
 * @category models
 * @since 0.0.0
 */
export class CandidateDraft extends S.Class<CandidateDraft>("@beep/workspace-domain/CandidateDraft")({
  fixtureKey: S.String,
  id: EntityIdValue,
  lifecycle: CandidateLifecycle,
  snapshot: UnknownRecord,
}) {}

/**
 * Human approval gate for candidate work.
 *
 * @category models
 * @since 0.0.0
 */
export class ApprovalGate extends S.Class<ApprovalGate>("@beep/workspace-domain/ApprovalGate")({
  decision: ApprovalDecision,
  fixtureKey: S.String,
  id: EntityIdValue,
  lifecycle: CandidateLifecycle,
  snapshot: UnknownRecord,
}) {}

/**
 * Bounded context packet returned through the SDK facade.
 *
 * @category models
 * @since 0.0.0
 */
export class ContextPacket extends S.Class<ContextPacket>("@beep/workspace-domain/ContextPacket")({
  fixtureKey: S.String,
  id: EntityIdValue,
  scenarioFixtureKey: S.String,
  snapshot: UnknownRecord,
}) {}
