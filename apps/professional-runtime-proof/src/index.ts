/**
 * App-level proof harness package for the Agentic Professional Runtime.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { Agent } from "@beep/agent-capability-domain/entities/Agent";
import { makeInMemoryProfessionalRuntimeSdk, type RuntimeFixtureInput } from "@beep/agent-capability-use-cases/proof";
import {
  CandidateOutputSet,
  GetContextPacket,
  ProposeCandidateOutputSet,
  RuntimeScope,
} from "@beep/agent-capability-use-cases/public";
import { Activity } from "@beep/epistemic-domain/entities/Activity";
import { CandidateClaim } from "@beep/epistemic-domain/entities/CandidateClaim";
import { UsageRecord } from "@beep/epistemic-domain/entities/UsageRecord";
import { LegalClient } from "@beep/law-practice-domain/entities/LegalClient";
import { LegalContact } from "@beep/law-practice-domain/entities/LegalContact";
import { Matter } from "@beep/law-practice-domain/entities/Matter";
import { PatentAsset } from "@beep/law-practice-domain/entities/PatentAsset";
import { Membership } from "@beep/tenancy-domain/entities/Membership";
import { Organization } from "@beep/tenancy-domain/entities/Organization";
import { Principal } from "@beep/tenancy-domain/entities/Principal";
import { User } from "@beep/tenancy-domain/entities/User";
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
import { Effect } from "effect";
import * as S from "effect/Schema";

/**
 * Package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/professional-runtime-proof"
 *
 * console.log(VERSION)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

class MissingRuntimeAgentPrincipalError extends S.TaggedErrorClass<MissingRuntimeAgentPrincipalError>(
  "MissingRuntimeAgentPrincipalError"
)("MissingRuntimeAgentPrincipalError", {
  message: S.String,
  scenarioId: S.String,
}) {}

const UnknownRecord = S.Record(S.String, S.Unknown);

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
  kind: S.Union([S.Literal("solo_practice"), S.Literal("wealth_firm")]),
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
    readonly entityId: {
      readonly entityType: string;
    };
  };
}

const fixtureRoot = new URL(
  "../../../initiatives/agentic-professional-runtime/fixtures/runtime-data-loop/",
  import.meta.url
);

const readJson = async <A>(schema: S.Decoder<A, never>, scenarioId: string, fileName: string): Promise<A> =>
  S.decodeUnknownSync(schema)(await Bun.file(new URL(`${scenarioId}/${fileName}`, fixtureRoot)).json());

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
 * @category helpers
 * @since 0.0.0
 */
export const toPlain = <A>(value: A): unknown => JSON.parse(JSON.stringify(value));
const toSnapshot = (value: unknown): typeof UnknownRecord.Type => S.decodeUnknownSync(UnknownRecord)(toPlain(value));

const decodeFixtureModel = <A>(schema: S.Top): ((input: unknown) => A) =>
  Reflect.apply(S.decodeUnknownSync, undefined, [schema]);

const decodeOrganization = decodeFixtureModel(Organization);
const decodeUser = decodeFixtureModel(User);
const decodeMembership = decodeFixtureModel(Membership);
const decodePrincipal = decodeFixtureModel(Principal);
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
const entityTypeOf = (model: EntityModel): string => model.definition.entityId.entityType;
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

const runtimeScopeFrom = (seed: SeedFixture, email: EmailFixture): RuntimeScope =>
  new RuntimeScope({
    organizationId: seed.organization.organizationId,
    threadId: email.threadId,
    workspaceId: seed.workspace.workspaceId,
  });

const runtimeAgentPrincipalId = (seed: SeedFixture): string => {
  const principal = seed.principals.find((candidate) => candidate.agentId === seed.agent.agentId);

  if (principal === undefined) {
    throw new MissingRuntimeAgentPrincipalError({
      message: `${seed.scenarioId}: missing runtime agent principal`,
      scenarioId: seed.scenarioId,
    });
  }

  return principal.principalId;
};

const decodeSeedModels = (seed: SeedFixture, email: EmailFixture, body: string): void => {
  decodeOrganization({
    ...entityAuditFields,
    entityType: entityTypeOf(Organization),
    fixtureKey: seed.organization.organizationId,
    id: 1,
    kind: seed.organization.kind,
    licenseTier: seed.organization.licenseTier,
    name: seed.organization.name,
  });
  seed.users.forEach((user, index) =>
    decodeUser({
      ...entityAuditFields,
      displayName: user.displayName,
      entityType: entityTypeOf(User),
      fixtureKey: user.userId,
      id: index + 2,
      role: user.role,
    })
  );
  seed.memberships.forEach((membership, index) =>
    decodeMembership({
      ...entityAuditFields,
      entityType: entityTypeOf(Membership),
      fixtureKey: membership.membershipId,
      id: index + 10,
      organizationFixtureKey: membership.organizationId,
      role: membership.role,
      status: membership.status,
      userFixtureKey: membership.userId,
    })
  );
  seed.principals.forEach((principal, index) => {
    const optionalAgent = principal.agentId === undefined ? {} : { agentFixtureKey: principal.agentId };
    const optionalUser = principal.userId === undefined ? {} : { userFixtureKey: principal.userId };

    decodePrincipal({
      ...entityAuditFields,
      ...optionalAgent,
      ...optionalUser,
      entityType: entityTypeOf(Principal),
      fixtureKey: principal.principalId,
      id: index + 20,
      kind: principal.kind,
    });
  });
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
  output.claims.forEach((claim, index) =>
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
  output.tasks.forEach((task, index) =>
    decodeCandidateTask({
      ...entityAuditFields,
      entityType: entityTypeOf(CandidateTask),
      fixtureKey: task.taskId,
      id: index + 130,
      lifecycle: task.lifecycle,
      snapshot: toSnapshot(task),
    })
  );
  output.drafts.forEach((draft, index) =>
    decodeCandidateDraft({
      ...entityAuditFields,
      entityType: entityTypeOf(CandidateDraft),
      fixtureKey: draft.draftId,
      id: index + 140,
      lifecycle: draft.lifecycle,
      snapshot: toSnapshot(draft),
    })
  );
  output.approvalGates.forEach((gate, index) =>
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
  output.contextPacket.activities.forEach((activity, index) =>
    decodeActivity({
      ...entityAuditFields,
      entityType: entityTypeOf(Activity),
      fixtureKey: activity.activityId,
      id: index + 170,
      snapshot: toSnapshot(activity),
    })
  );
  output.contextPacket.usage.forEach((usage, index) =>
    decodeUsageRecord({
      ...entityAuditFields,
      entityType: entityTypeOf(UsageRecord),
      fixtureKey: usage.usageRecordId,
      id: index + 180,
      snapshot: toSnapshot(usage),
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
export const runProfessionalRuntimeScenario = async (scenarioId: ScenarioId) => {
  const seed = await readJson(SeedFixture, scenarioId, "seed.json");
  const email = await readJson(EmailFixture, scenarioId, "input.email.json");
  const body = await readBody(scenarioId);
  const expectedApprovalGates = await readJson(ExpectedApprovalGates, scenarioId, "expected.approval-gates.json");
  const expectedClaims = await readJson(ExpectedClaims, scenarioId, "expected.claims.json");
  const expectedContextPacket = await readJson(ExpectedContextPacket, scenarioId, "expected.context-packet.json");
  const expectedDrafts = await readJson(ExpectedDrafts, scenarioId, "expected.drafts.json");
  const expectedTasks = await readJson(ExpectedTasks, scenarioId, "expected.tasks.json");

  decodeSeedModels(seed, email, body);
  decodeVerticalModels(seed);

  const input = { body, email, seed } satisfies RuntimeFixtureInput;
  const scope = runtimeScopeFrom(seed, email);
  const sdk = makeInMemoryProfessionalRuntimeSdk([input]);
  const contextPacket = await Effect.runPromise(
    sdk.getContextPacket(new GetContextPacket({ artifactId: email.artifactId, scenarioId, scope }))
  );
  const outputSet = decodeCandidateOutputSet({
    approvalGates: expectedApprovalGates.approvalGates,
    candidateProject: expectedTasks.candidateProject,
    claims: expectedClaims.claims,
    contextPacket,
    drafts: expectedDrafts.drafts,
    scenarioId,
    tasks: expectedTasks.tasks,
  });
  const output = await Effect.runPromise(
    sdk.proposeCandidateOutputSet(
      new ProposeCandidateOutputSet({
        outputSet,
        producedByPrincipalId: runtimeAgentPrincipalId(seed),
        scope,
      })
    )
  );
  decodeCandidateModels(output);

  return {
    expectedApprovalGates,
    expectedClaims,
    expectedContextPacket,
    expectedDrafts,
    expectedTasks,
    output,
  };
};
