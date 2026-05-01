/**
 * Deterministic fixture SDK facade for the Agentic Professional Runtime proof.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { Effect, HashMap, HashSet } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import type { ProposeCandidateOutputSet } from "./ProfessionalRuntime.commands.js";
import type {
  CandidateOutputSet,
  RuntimeEvidenceRef,
  RuntimeScope,
  SdkContextPacket,
} from "./ProfessionalRuntime.contracts.js";
import { ProfessionalRuntimeValidationError } from "./ProfessionalRuntime.errors.js";
import type { RuntimeFixtureInput } from "./ProfessionalRuntime.fixtures.js";
import { runRuntimeFixture } from "./ProfessionalRuntime.fixtures.js";
import type { GetContextPacket } from "./ProfessionalRuntime.queries.js";
import type { ProfessionalRuntimeSdk } from "./ProfessionalRuntime.service.js";

const failValidation = (message: string): Effect.Effect<never, ProfessionalRuntimeValidationError> =>
  Effect.fail(new ProfessionalRuntimeValidationError({ message }));

const ensure = (condition: boolean, message: string): Effect.Effect<void, ProfessionalRuntimeValidationError> =>
  condition ? Effect.void : failValidation(message);

const fixtureForScenario = (
  fixtures: ReadonlyArray<RuntimeFixtureInput>,
  scenarioId: string
): Effect.Effect<RuntimeFixtureInput, ProfessionalRuntimeValidationError> =>
  O.match(
    A.findFirst(fixtures, (fixture) => fixture.email.scenarioId === scenarioId),
    {
      onNone: () => failValidation(`Unknown runtime fixture scenario: ${scenarioId}`),
      onSome: Effect.succeed,
    }
  );

const outputForScenario = (
  fixtures: ReadonlyArray<RuntimeFixtureInput>,
  scenarioId: string
): Effect.Effect<CandidateOutputSet, ProfessionalRuntimeValidationError> =>
  Effect.flatMap(fixtureForScenario(fixtures, scenarioId), runRuntimeFixture);

const sameScope = (left: RuntimeScope, right: RuntimeScope): boolean =>
  left.organizationId === right.organizationId &&
  left.threadId === right.threadId &&
  left.workspaceId === right.workspaceId;

const sameOrderedStrings = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const toPlainJson = (value: unknown): string => JSON.stringify(value);

const spanIdsFromEvidence = (evidence: RuntimeEvidenceRef): ReadonlyArray<string> => [
  ...(evidence.spanId === undefined ? [] : [evidence.spanId]),
  ...(evidence.spanIds ?? []),
];

const collectEvidence = (outputSet: CandidateOutputSet): ReadonlyArray<RuntimeEvidenceRef> => [
  ...outputSet.claims.flatMap((claim) => claim.evidence),
  ...outputSet.candidateProject.evidence,
  ...outputSet.tasks.flatMap((task) => task.evidence),
  ...outputSet.drafts.flatMap((draft) => draft.evidence),
  ...outputSet.approvalGates.flatMap((gate) => gate.evidence),
];

const collectCandidateIds = (outputSet: CandidateOutputSet): HashSet.HashSet<string> =>
  HashSet.fromIterable([
    ...outputSet.claims.map((claim) => claim.claimId),
    ...outputSet.tasks.map((task) => task.taskId),
    ...outputSet.drafts.map((draft) => draft.draftId),
  ]);

const collectSourceArtifactSpans = (packet: SdkContextPacket): HashMap.HashMap<string, HashSet.HashSet<string>> =>
  HashMap.fromIterable(
    packet.sourceArtifacts.map((artifact) => [
      artifact.artifactId,
      HashSet.fromIterable(artifact.spanRefs.map((spanRef) => spanRef.spanId)),
    ])
  );

const pushEvidenceIssues = (
  issues: Array<string>,
  outputSet: CandidateOutputSet,
  sourceArtifactSpans: HashMap.HashMap<string, HashSet.HashSet<string>>
): void => {
  for (const evidence of collectEvidence(outputSet)) {
    const spanIds = spanIdsFromEvidence(evidence);
    const knownSpans = HashMap.get(sourceArtifactSpans, evidence.artifactId);

    if (spanIds.length === 0) {
      issues.push(`evidence for ${evidence.artifactId} does not reference any spans`);
      continue;
    }

    if (O.isNone(knownSpans)) {
      issues.push(`evidence references unknown artifact ${evidence.artifactId}`);
      continue;
    }

    for (const spanId of spanIds) {
      if (!HashSet.has(knownSpans.value, spanId)) {
        issues.push(`evidence references unknown span ${evidence.artifactId}#${spanId}`);
      }
    }
  }
};

const collectOutputIssues = (outputSet: CandidateOutputSet, producedByPrincipalId: string): ReadonlyArray<string> => {
  const issues: Array<string> = [];
  const principalIds = HashSet.fromIterable(outputSet.contextPacket.principals);
  const sourceArtifactSpans = collectSourceArtifactSpans(outputSet.contextPacket);
  const candidateIds = collectCandidateIds(outputSet);
  const claimIds = outputSet.claims.map((claim) => claim.claimId);
  const taskIds = outputSet.tasks.map((task) => task.taskId);
  const draftIds = outputSet.drafts.map((draft) => draft.draftId);
  const gateIds = outputSet.approvalGates.map((gate) => gate.approvalGateId);

  if (outputSet.contextPacket.scenarioId !== outputSet.scenarioId) {
    issues.push(`context packet scenario ${outputSet.contextPacket.scenarioId} does not match ${outputSet.scenarioId}`);
  }

  if (outputSet.contextPacket.request.artifactId !== outputSet.contextPacket.sourceArtifacts[0]?.artifactId) {
    issues.push("context packet request artifact is not declared as a source artifact");
  }

  if (!HashSet.has(principalIds, producedByPrincipalId)) {
    issues.push(`producing principal ${producedByPrincipalId} is missing from context packet principals`);
  }

  for (const claim of outputSet.claims) {
    if (claim.producedByPrincipalId !== producedByPrincipalId) {
      issues.push(`${claim.claimId} was produced by ${claim.producedByPrincipalId}, not ${producedByPrincipalId}`);
    }
  }

  for (const draft of outputSet.drafts) {
    if (draft.producedByPrincipalId !== producedByPrincipalId) {
      issues.push(`${draft.draftId} was produced by ${draft.producedByPrincipalId}, not ${producedByPrincipalId}`);
    }
  }

  for (const task of outputSet.tasks) {
    if (!HashSet.has(principalIds, task.assigneePrincipalId)) {
      issues.push(`${task.taskId} assignee ${task.assigneePrincipalId} is missing from context packet principals`);
    }
  }

  for (const gate of outputSet.approvalGates) {
    if (!HashSet.has(principalIds, gate.reviewerPrincipalId)) {
      issues.push(
        `${gate.approvalGateId} reviewer ${gate.reviewerPrincipalId} is missing from context packet principals`
      );
    }

    for (const candidateRef of gate.candidateRefs) {
      if (!HashSet.has(candidateIds, candidateRef)) {
        issues.push(`${gate.approvalGateId} references unknown candidate ${candidateRef}`);
      }
    }
  }

  for (const activity of outputSet.contextPacket.activities) {
    if (!HashSet.has(principalIds, activity.principalId)) {
      issues.push(`${activity.activityId} principal ${activity.principalId} is missing from context packet principals`);
    }
  }

  if (!sameOrderedStrings(outputSet.contextPacket.candidateClaims, claimIds)) {
    issues.push("context packet candidate claim refs do not match claims");
  }

  if (!sameOrderedStrings(outputSet.contextPacket.candidateTasks, taskIds)) {
    issues.push("context packet candidate task refs do not match tasks");
  }

  if (!sameOrderedStrings(outputSet.contextPacket.candidateDrafts, draftIds)) {
    issues.push("context packet candidate draft refs do not match drafts");
  }

  if (!sameOrderedStrings(outputSet.contextPacket.approvalGates, gateIds)) {
    issues.push("context packet approval gate refs do not match approval gates");
  }

  pushEvidenceIssues(issues, outputSet, sourceArtifactSpans);

  return issues;
};

const validateOutputSet = (
  outputSet: CandidateOutputSet,
  producedByPrincipalId: string
): Effect.Effect<void, ProfessionalRuntimeValidationError> => {
  const issues = collectOutputIssues(outputSet, producedByPrincipalId);

  return issues.length === 0 ? Effect.void : failValidation(`${outputSet.scenarioId}: ${issues.join("; ")}`);
};

/**
 * Create an in-memory SDK facade over deterministic runtime fixture inputs.
 *
 * @example
 * ```ts
 * import { makeInMemoryProfessionalRuntimeSdk } from "@beep/agent-capability-use-cases/proof"
 *
 * console.log(makeInMemoryProfessionalRuntimeSdk)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeInMemoryProfessionalRuntimeSdk = (
  fixtures: ReadonlyArray<RuntimeFixtureInput>
): ProfessionalRuntimeSdk => ({
  getContextPacket: Effect.fn("ProfessionalRuntimeSdk.getContextPacket")(function* (query: GetContextPacket) {
    const outputSet = yield* outputForScenario(fixtures, query.scenarioId);

    yield* ensure(
      outputSet.contextPacket.request.artifactId === query.artifactId,
      `${query.scenarioId}: context packet artifact ${outputSet.contextPacket.request.artifactId} does not match ${query.artifactId}`
    );
    yield* ensure(
      sameScope(outputSet.contextPacket.scope, query.scope),
      `${query.scenarioId}: context packet scope does not match query scope`
    );

    return outputSet.contextPacket;
  }),
  proposeCandidateOutputSet: Effect.fn("ProfessionalRuntimeSdk.proposeCandidateOutputSet")(function* (
    command: ProposeCandidateOutputSet
  ) {
    const generatedOutputSet = yield* outputForScenario(fixtures, command.outputSet.scenarioId);

    yield* ensure(
      sameScope(command.outputSet.contextPacket.scope, command.scope),
      `${command.outputSet.scenarioId}: proposed output scope does not match command scope`
    );
    yield* validateOutputSet(command.outputSet, command.producedByPrincipalId);
    yield* ensure(
      toPlainJson(command.outputSet) === toPlainJson(generatedOutputSet),
      `${command.outputSet.scenarioId}: proposed output set does not match deterministic fixture output`
    );

    return command.outputSet;
  }),
});
