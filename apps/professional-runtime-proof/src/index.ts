/**
 * App-level proof harness package for the Agentic Professional Runtime.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { Agent } from "@beep/agents-domain/entities/Agent";
import { makeInMemoryProfessionalRuntimeSdk } from "@beep/agents-use-cases/proof";
import {
  CandidateOutputSet,
  GetContextPacket,
  ProposeCandidateOutputSet,
  RuntimeScope,
} from "@beep/agents-use-cases/public";
import { Activity } from "@beep/epistemic-domain/entities/Activity";
import { CandidateClaim } from "@beep/epistemic-domain/entities/CandidateClaim";
import { UsageRecord } from "@beep/epistemic-domain/entities/UsageRecord";
import { LegalClient } from "@beep/law-practice-domain/entities/LegalClient";
import { LegalContact } from "@beep/law-practice-domain/entities/LegalContact";
import { Matter } from "@beep/law-practice-domain/entities/Matter";
import { PatentAsset } from "@beep/law-practice-domain/entities/PatentAsset";
import { LiteralKit, UnknownRecord } from "@beep/schema";
import { Model as Membership } from "@beep/shared-domain/entities/Membership";
import { Model as Organization } from "@beep/shared-domain/entities/Organization";
import { Model as User } from "@beep/shared-domain/entities/User";
import { A, O, Str } from "@beep/utils";
import { Account } from "@beep/wealth-management-domain/entities/Account";
import { Household } from "@beep/wealth-management-domain/entities/Household";
import { Party } from "@beep/wealth-management-domain/entities/Party";
import { WealthClient } from "@beep/wealth-management-domain/entities/WealthClient";
import { ApprovalGate } from "@beep/workspace-domain/entities/ApprovalGate";
import { CandidateDraft } from "@beep/workspace-domain/entities/CandidateDraft";
import { CandidateProject } from "@beep/workspace-domain/entities/CandidateProject";
import { CandidateTask } from "@beep/workspace-domain/entities/CandidateTask";
import { ContextPacket } from "@beep/workspace-domain/entities/ContextPacket";
import { EmailArtifact } from "@beep/workspace-domain/entities/EmailArtifact";
import { Workspace } from "@beep/workspace-domain/entities/Workspace";
import { Effect, pipe } from "effect";
import * as S from "effect/Schema";
import type { RuntimeFixtureInput } from "@beep/agents-use-cases/proof";

class MissingRuntimeAgentPrincipalError extends S.TaggedErrorClass<MissingRuntimeAgentPrincipalError>(
  "MissingRuntimeAgentPrincipalError"
)("MissingRuntimeAgentPrincipalError", {
  message: S.String,
  scenarioId: S.String,
}) {}

class MissingRuntimeUsageActivityError extends S.TaggedErrorClass<MissingRuntimeUsageActivityError>(
  "MissingRuntimeUsageActivityError"
)("MissingRuntimeUsageActivityError", {
  message: S.String,
  scenarioId: S.String,
}) {}

class MissingRuntimeEntityModelMetadataError extends S.TaggedErrorClass<MissingRuntimeEntityModelMetadataError>(
  "MissingRuntimeEntityModelMetadataError"
)("MissingRuntimeEntityModelMetadataError", {
  message: S.String,
}) {}

class SeedAgentFixture extends S.Class<SeedAgentFixture>("SeedAgentFixture")({
  agentId: S.String,
  mode: S.Literal("deterministic_fixture"),
  name: S.String,
  skillId: S.String,
}) {}

class SeedMembershipFixture extends S.Class<SeedMembershipFixture>("SeedMembershipFixture")({
  membershipId: S.String,
  organizationId: S.String,
  role: S.String,
  status: S.String,
  userId: S.String,
}) {}

class SeedOrganizationFixture extends S.Class<SeedOrganizationFixture>("SeedOrganizationFixture")({
  kind: LiteralKit(["solo_practice", "wealth_firm"]),
  licenseTier: S.String,
  name: S.String,
  organizationId: S.String,
}) {}

class SeedPrincipalFixture extends S.Class<SeedPrincipalFixture>("SeedPrincipalFixture")({
  agentId: S.optionalKey(S.String),
  kind: S.String,
  principalId: S.String,
  userId: S.optionalKey(S.String),
}) {}

class SeedUserFixture extends S.Class<SeedUserFixture>("SeedUserFixture")({
  displayName: S.String,
  role: S.String,
  userId: S.String,
}) {}

class SeedWorkspaceFixture extends S.Class<SeedWorkspaceFixture>("SeedWorkspaceFixture")({
  name: S.String,
  organizationId: S.String,
  ownerPrincipalId: S.String,
  workspaceId: S.String,
}) {}

class SeedFixture extends S.Class<SeedFixture>("SeedFixture")({
  agent: SeedAgentFixture,
  memberships: S.Array(SeedMembershipFixture),
  organization: SeedOrganizationFixture,
  principals: S.Array(SeedPrincipalFixture),
  scenarioId: S.String,
  users: S.Array(SeedUserFixture),
  verticalContext: S.Record(S.String, S.Record(S.String, S.String)),
  workspace: SeedWorkspaceFixture,
}) {}

class EmailFixture extends S.Class<EmailFixture>("EmailFixture")({
  artifactId: S.String,
  from: UnknownRecord,
  receivedAt: S.String,
  scenarioId: S.String,
  sourceSpans: S.Array(S.String),
  subject: S.String,
  threadId: S.String,
  to: S.Array(UnknownRecord),
}) {}

class ExpectedClaims extends S.Class<ExpectedClaims>("ExpectedClaims")({
  claims: S.Array(UnknownRecord),
}) {}

class ExpectedTasks extends S.Class<ExpectedTasks>("ExpectedTasks")({
  candidateProject: UnknownRecord,
  tasks: S.Array(UnknownRecord),
}) {}

class ExpectedDrafts extends S.Class<ExpectedDrafts>("ExpectedDrafts")({
  drafts: S.Array(UnknownRecord),
}) {}

class ExpectedApprovalGates extends S.Class<ExpectedApprovalGates>("ExpectedApprovalGates")({
  approvalGates: S.Array(UnknownRecord),
}) {}

const ExpectedContextPacket = UnknownRecord;

/**
 * Deterministic proof scenario identifiers.
 *
 * @example
 * ```ts
 * import type { ScenarioId } from "@beep/professional-runtime-proof"
 *
 * const scenarioId: ScenarioId = "law-patent-intake"
 * console.log(scenarioId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ScenarioId = "law-patent-intake" | "wealth-cash-request";
interface EntityModel {
  readonly definition: {
    readonly entityId?: {
      readonly entityType: string;
    };
  };
}

const fixtureRoot = new URL("../../../goals/agentic-professional-runtime/fixtures/runtime-data-loop/", import.meta.url);

const readJson = <A>(schema: S.Decoder<A>, scenarioId: string, fileName: string): Promise<A> =>
  Bun.file(new URL(`${scenarioId}/${fileName}`, fixtureRoot))
    .json()
    .then((value) => S.decodeUnknownSync(schema)(value));

const readBody = (scenarioId: string): Promise<string> =>
  Bun.file(new URL(`${scenarioId}/body.md`, fixtureRoot)).text();

/**
 * Convert decoded Schema class instances into JSON-comparable plain data.
 *
 * @example
 * ```ts
 * import { toPlain } from "@beep/professional-runtime-proof"
 *
 * console.log(toPlain({ ok: true }))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
// TODO(effect-native-migration): model schema
export const toPlain = <A>(value: A): unknown =>
  S.decodeUnknownSync(S.UnknownFromJsonString)(S.encodeUnknownSync(S.UnknownFromJsonString)(value));
const toSnapshot = (value: unknown): UnknownRecord => S.decodeUnknownSync(UnknownRecord)(toPlain(value));

const decodeFixtureModel = <A>(schema: S.Top): ((input: unknown) => A) =>
  Reflect.apply(S.decodeUnknownSync, undefined, [schema]);

const decodeOrganization = decodeFixtureModel(Organization);
const decodeUser = decodeFixtureModel(User);
const decodeMembership = decodeFixtureModel(Membership);
const decodeWorkspace = decodeFixtureModel(Workspace);
const decodeEmailArtifact = decodeFixtureModel(EmailArtifact);
const decodeAgent = decodeFixtureModel(Agent);
const decodeLegalClient = decodeFixtureModel(LegalClient);
const decodeLegalContact = decodeFixtureModel(LegalContact);
const decodeMatter = decodeFixtureModel(Matter);
const decodePatentAsset = decodeFixtureModel(PatentAsset);
const decodeHousehold = decodeFixtureModel(Household);
const decodeWealthClient = decodeFixtureModel(WealthClient);
const decodeParty = decodeFixtureModel(Party);
const decodeAccount = decodeFixtureModel(Account);
const decodeCandidateClaim = decodeFixtureModel(CandidateClaim);
const decodeCandidateProject = decodeFixtureModel(CandidateProject);
const decodeCandidateTask = decodeFixtureModel(CandidateTask);
const decodeCandidateDraft = decodeFixtureModel(CandidateDraft);
const decodeApprovalGate = decodeFixtureModel(ApprovalGate);
const decodeContextPacket = decodeFixtureModel(ContextPacket);
const decodeActivity = decodeFixtureModel(Activity);
const decodeUsageRecord = decodeFixtureModel(UsageRecord);
const decodeCandidateOutputSet = S.decodeUnknownSync(CandidateOutputSet);
const entityTypeOf = (model: EntityModel): string => {
  const entityId = model.definition.entityId;

  if (entityId === undefined) {
    throw MissingRuntimeEntityModelMetadataError.make({
      message: "Runtime proof entity model is missing entity-id metadata.",
    });
  }

  return entityId.entityType;
};
const runtimeSystemPrincipal = {
  component: "Runtime",
  kind: "System",
} as const;
const entityAuditFields = {
  createdAt: 1,
  createdByPrincipal: runtimeSystemPrincipal,
  orgId: 1,
  rowVersion: 1,
  schemaVersion: "0.0.0",
  source: "Agent",
  updatedAt: 1,
  updatedByPrincipal: runtimeSystemPrincipal,
} as const;
const organizationSettings = {
  allowAgentActions: true,
  defaultRetentionDays: 90,
} as const;

const userEntityIdByFixtureKey = (users: ReadonlyArray<SeedUserFixture>, userId: string): number | undefined =>
  pipe(
    users,
    A.findFirstIndex((user) => user.userId === userId),
    O.map((index) => index + 2),
    O.getOrUndefined
  );

const membershipRoleFrom = (role: string): "member" | "owner" => (role === "owner_attorney" ? "owner" : "member");

const runtimeScopeFrom = (seed: SeedFixture, email: EmailFixture): RuntimeScope =>
  RuntimeScope.make({
    organizationId: seed.organization.organizationId,
    threadId: email.threadId,
    workspaceId: seed.workspace.workspaceId,
  });

const runtimeAgentPrincipalId = (seed: SeedFixture): string =>
  pipe(
    seed.principals,
    A.findFirst((candidate) => candidate.agentId === seed.agent.agentId),
    O.map((principal) => principal.principalId),
    O.getOrThrowWith(() =>
      MissingRuntimeAgentPrincipalError.make({
        message: `${seed.scenarioId}: missing runtime agent principal`,
        scenarioId: seed.scenarioId,
      })
    )
  );

const candidateProposalActivityEntityId = (output: CandidateOutputSet): number =>
  pipe(
    output.contextPacket.activities,
    A.findFirstIndex((activity) => activity.activityType === "candidate_work_proposed"),
    O.map((index) => index + 170),
    O.getOrThrowWith(() =>
      MissingRuntimeUsageActivityError.make({
        message: `${output.scenarioId}: missing candidate proposal activity for usage attribution`,
        scenarioId: output.scenarioId,
      })
    )
  );

const decodeSeedModels = (seed: SeedFixture, email: EmailFixture, body: string): void => {
  decodeOrganization({
    ...entityAuditFields,
    entityType: entityTypeOf(Organization),
    id: 1,
    legalName: seed.organization.name,
    licenseTier: seed.organization.licenseTier,
    name: seed.organization.name,
    parentOrgId: null,
    settings: organizationSettings,
    slug: Str.toSlug(seed.organization.name),
  });
  A.forEach(seed.users, (user, index) =>
    decodeUser({
      ...entityAuditFields,
      displayName: user.displayName,
      entityType: entityTypeOf(User),
      id: index + 2,
    })
  );
  A.forEach(seed.memberships, (membership, index) =>
    decodeMembership({
      ...entityAuditFields,
      entityType: entityTypeOf(Membership),
      id: index + 10,
      role: membershipRoleFrom(membership.role),
      status: membership.status,
      userId: userEntityIdByFixtureKey(seed.users, membership.userId),
    })
  );
  decodeWorkspace({
    ...entityAuditFields,
    entityType: entityTypeOf(Workspace),
    fixtureKey: seed.workspace.workspaceId,
    id: 30,
    name: seed.workspace.name,
    organizationFixtureKey: seed.workspace.organizationId,
    ownerPrincipalFixtureKey: seed.workspace.ownerPrincipalId,
  });
  decodeEmailArtifact({
    ...entityAuditFields,
    artifactFixtureKey: email.artifactId,
    body,
    entityType: entityTypeOf(EmailArtifact),
    from: email.from,
    id: 31,
    receivedAt: email.receivedAt,
    sourceSpans: email.sourceSpans,
    subject: email.subject,
    threadFixtureKey: email.threadId,
    to: email.to,
  });
  decodeAgent({
    ...entityAuditFields,
    entityType: entityTypeOf(Agent),
    fixtureKey: seed.agent.agentId,
    id: 40,
    mode: seed.agent.mode,
    name: seed.agent.name,
    skillFixtureKey: seed.agent.skillId,
  });
};

const decodeVerticalModels = (seed: SeedFixture): void => {
  if (seed.scenarioId === "law-patent-intake") {
    const legalClient = seed.verticalContext.legalClient;
    const contact = seed.verticalContext.contact;
    const matter = seed.verticalContext.matter;
    const patentAsset = seed.verticalContext.patentAsset;

    decodeLegalClient({
      ...entityAuditFields,
      displayName: legalClient.displayName,
      entityType: entityTypeOf(LegalClient),
      fixtureKey: legalClient.legalClientId,
      id: 50,
      status: legalClient.status,
    });
    decodeLegalContact({
      ...entityAuditFields,
      displayName: contact.displayName,
      entityType: entityTypeOf(LegalContact),
      fixtureKey: contact.contactId,
      id: 51,
      legalClientFixtureKey: contact.legalClientId,
      role: contact.role,
    });
    decodeMatter({
      ...entityAuditFields,
      displayName: matter.displayName,
      entityType: entityTypeOf(Matter),
      fixtureKey: matter.matterId,
      id: 52,
      legalClientFixtureKey: matter.legalClientId,
      matterType: matter.matterType,
    });
    decodePatentAsset({
      ...entityAuditFields,
      entityType: entityTypeOf(PatentAsset),
      fixtureKey: patentAsset.patentAssetId,
      id: 53,
      matterFixtureKey: patentAsset.matterId,
      status: patentAsset.status,
      title: patentAsset.title,
    });
    return;
  }

  const household = seed.verticalContext.household;
  const client = seed.verticalContext.client;
  const party = seed.verticalContext.party;
  const account = seed.verticalContext.account;

  decodeHousehold({
    ...entityAuditFields,
    displayName: household.displayName,
    entityType: entityTypeOf(Household),
    fixtureKey: household.householdId,
    id: 60,
    status: household.status,
  });
  decodeWealthClient({
    ...entityAuditFields,
    displayName: client.displayName,
    entityType: entityTypeOf(WealthClient),
    fixtureKey: client.clientId,
    householdFixtureKey: client.householdId,
    id: 61,
    partyFixtureKey: client.partyId,
    status: client.status,
  });
  decodeParty({
    ...entityAuditFields,
    displayName: party.displayName,
    entityType: entityTypeOf(Party),
    fixtureKey: party.partyId,
    id: 62,
    partyType: party.partyType,
  });
  decodeAccount({
    ...entityAuditFields,
    accountType: account.accountType,
    entityType: entityTypeOf(Account),
    externalLabel: account.externalLabel,
    fixtureKey: account.accountId,
    householdFixtureKey: account.householdId,
    id: 63,
  });
};

const decodeCandidateModels = (output: CandidateOutputSet): void => {
  const usageActivityId = candidateProposalActivityEntityId(output);

  A.forEach(output.claims, (claim, index) =>
    decodeCandidateClaim({
      ...entityAuditFields,
      entityType: entityTypeOf(CandidateClaim),
      fixtureKey: claim.claimId,
      id: index + 100,
      lifecycle: claim.lifecycle,
      snapshot: toSnapshot(claim),
    })
  );
  decodeCandidateProject({
    ...entityAuditFields,
    entityType: entityTypeOf(CandidateProject),
    fixtureKey: output.candidateProject.projectId,
    id: 120,
    lifecycle: output.candidateProject.lifecycle,
    snapshot: toSnapshot(output.candidateProject),
  });
  A.forEach(output.tasks, (task, index) =>
    decodeCandidateTask({
      ...entityAuditFields,
      entityType: entityTypeOf(CandidateTask),
      fixtureKey: task.taskId,
      id: index + 130,
      lifecycle: task.lifecycle,
      snapshot: toSnapshot(task),
    })
  );
  A.forEach(output.drafts, (draft, index) =>
    decodeCandidateDraft({
      ...entityAuditFields,
      entityType: entityTypeOf(CandidateDraft),
      fixtureKey: draft.draftId,
      id: index + 140,
      lifecycle: draft.lifecycle,
      snapshot: toSnapshot(draft),
    })
  );
  A.forEach(output.approvalGates, (gate, index) =>
    decodeApprovalGate({
      ...entityAuditFields,
      decision: gate.decision,
      entityType: entityTypeOf(ApprovalGate),
      fixtureKey: gate.approvalGateId,
      id: index + 150,
      lifecycle: gate.lifecycle,
      snapshot: toSnapshot(gate),
    })
  );
  decodeContextPacket({
    ...entityAuditFields,
    entityType: entityTypeOf(ContextPacket),
    fixtureKey: output.contextPacket.contextPacketId,
    id: 160,
    scenarioFixtureKey: output.scenarioId,
    snapshot: toSnapshot(output.contextPacket),
  });
  A.forEach(output.contextPacket.activities, (activity, index) =>
    decodeActivity({
      ...entityAuditFields,
      entityType: entityTypeOf(Activity),
      fixtureKey: activity.activityId,
      id: index + 170,
      snapshot: toSnapshot(activity),
    })
  );
  A.forEach(output.contextPacket.usage, (usage, index) =>
    decodeUsageRecord({
      ...entityAuditFields,
      activityId: usageActivityId,
      actor: runtimeSystemPrincipal,
      costUsdApproxMicros: null,
      credentialReference: null,
      entityType: entityTypeOf(UsageRecord),
      fixtureKey: usage.usageRecordId,
      id: index + 180,
      inputTokens: null,
      latencyMillis: null,
      metadata: toSnapshot(usage),
      model: usage.model,
      outputTokens: null,
      provider: usage.provider,
      snapshot: toSnapshot(usage),
      totalTokens: null,
      unitCount: null,
    })
  );
};

/**
 * Run one deterministic professional-runtime proof scenario end to end.
 *
 * @example
 * ```ts
 * import { runProfessionalRuntimeScenario } from "@beep/professional-runtime-proof"
 *
 * const result = await runProfessionalRuntimeScenario("law-patent-intake")
 * console.log(result.output.scenarioId)
 * ```
 *
 * @category workflows
 * @since 0.0.0
 */
export const runProfessionalRuntimeScenario = (scenarioId: ScenarioId) =>
  Promise.all([
    readJson(SeedFixture, scenarioId, "seed.json"),
    readJson(EmailFixture, scenarioId, "input.email.json"),
    readBody(scenarioId),
    readJson(ExpectedApprovalGates, scenarioId, "expected.approval-gates.json"),
    readJson(ExpectedClaims, scenarioId, "expected.claims.json"),
    readJson(ExpectedContextPacket, scenarioId, "expected.context-packet.json"),
    readJson(ExpectedDrafts, scenarioId, "expected.drafts.json"),
    readJson(ExpectedTasks, scenarioId, "expected.tasks.json"),
  ]).then(
    ([
      seed,
      email,
      body,
      expectedApprovalGates,
      expectedClaims,
      expectedContextPacket,
      expectedDrafts,
      expectedTasks,
    ]) => {
      decodeSeedModels(seed, email, body);
      decodeVerticalModels(seed);

      const input = { body, email, seed } satisfies RuntimeFixtureInput;
      const scope = runtimeScopeFrom(seed, email);
      const sdk = makeInMemoryProfessionalRuntimeSdk([input]);

      return Effect.runPromise(
        sdk.getContextPacket(GetContextPacket.make({ artifactId: email.artifactId, scenarioId, scope }))
      ).then((contextPacket) => {
        const outputSet = decodeCandidateOutputSet({
          approvalGates: expectedApprovalGates.approvalGates,
          candidateProject: expectedTasks.candidateProject,
          claims: expectedClaims.claims,
          contextPacket,
          drafts: expectedDrafts.drafts,
          scenarioId,
          tasks: expectedTasks.tasks,
        });

        return Effect.runPromise(
          sdk.proposeCandidateOutputSet(
            ProposeCandidateOutputSet.make({
              outputSet,
              producedByPrincipalId: runtimeAgentPrincipalId(seed),
              scope,
            })
          )
        ).then((output) => {
          decodeCandidateModels(output);

          return {
            expectedApprovalGates,
            expectedClaims,
            expectedContextPacket,
            expectedDrafts,
            expectedTasks,
            output,
          };
        });
      });
    }
  );
