/**
 * SDK-facing runtime contracts for agent capability clients.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { TaggedErrorClass } from "@beep/schema";
import type { Effect } from "effect";
import * as S from "effect/Schema";

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Scope for an SDK request.
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeScope extends S.Class<RuntimeScope>("@beep/agent-capability-use-cases/RuntimeScope")({
  organizationId: S.String,
  threadId: S.String,
  workspaceId: S.String,
}) {}

/**
 * Request for an evidence-bounded context packet.
 *
 * @category queries
 * @since 0.0.0
 */
export class GetContextPacket extends S.Class<GetContextPacket>("@beep/agent-capability-use-cases/GetContextPacket")({
  artifactId: S.String,
  scenarioId: S.String,
  scope: RuntimeScope,
}) {}

/**
 * Context packet returned to SDK clients.
 *
 * @category models
 * @since 0.0.0
 */
export class SdkContextPacket extends S.Class<SdkContextPacket>("@beep/agent-capability-use-cases/SdkContextPacket")({
  activities: S.Array(UnknownRecord),
  approvalGates: S.Array(S.String),
  candidateClaims: S.Array(S.String),
  candidateDrafts: S.Array(S.String),
  candidateTasks: S.Array(S.String),
  contextPacketId: S.String,
  exclusions: S.Array(S.String),
  generatedAt: S.String,
  principals: S.Array(S.String),
  request: UnknownRecord,
  scenarioId: S.String,
  schemaVersion: S.String,
  scope: UnknownRecord,
  sourceArtifacts: S.Array(UnknownRecord),
  usage: S.Array(UnknownRecord),
  verticalContext: S.Array(UnknownRecord),
}) {}

/**
 * Batch of candidate outputs proposed by an agent run.
 *
 * @category models
 * @since 0.0.0
 */
export class CandidateOutputSet extends S.Class<CandidateOutputSet>(
  "@beep/agent-capability-use-cases/CandidateOutputSet"
)({
  approvalGates: S.Array(UnknownRecord),
  candidateProject: UnknownRecord,
  claims: S.Array(UnknownRecord),
  contextPacket: SdkContextPacket,
  drafts: S.Array(UnknownRecord),
  scenarioId: S.String,
  tasks: S.Array(UnknownRecord),
}) {}

/**
 * Command for proposing candidate work through the SDK facade.
 *
 * @category commands
 * @since 0.0.0
 */
export class ProposeCandidateOutputSet extends S.Class<ProposeCandidateOutputSet>(
  "@beep/agent-capability-use-cases/ProposeCandidateOutputSet"
)({
  outputSet: CandidateOutputSet,
  producedByPrincipalId: S.String,
  scope: RuntimeScope,
}) {}

/**
 * Validation failure for deterministic fixture runs.
 *
 * @category errors
 * @since 0.0.0
 */
export class RuntimeFixtureValidationError extends TaggedErrorClass<RuntimeFixtureValidationError>(
  "@beep/agent-capability-use-cases/RuntimeFixtureValidationError"
)("RuntimeFixtureValidationError", {
  message: S.String,
}) {}

/**
 * SDK facade shape exposed to clients and adapters.
 *
 * @category services
 * @since 0.0.0
 */
export interface ProfessionalRuntimeSdk {
  readonly getContextPacket: (
    query: GetContextPacket
  ) => Effect.Effect<SdkContextPacket, RuntimeFixtureValidationError>;
  readonly proposeCandidateOutputSet: (
    command: ProposeCandidateOutputSet
  ) => Effect.Effect<CandidateOutputSet, RuntimeFixtureValidationError>;
}
