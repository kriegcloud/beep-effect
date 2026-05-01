import { Agent } from "@beep/agent-capability-domain";
import type { CandidateOutputSet } from "@beep/agent-capability-use-cases/public";
import { type RuntimeFixtureInput, runRuntimeFixture } from "@beep/agent-capability-use-cases/test";
import { Activity, CandidateClaim, UsageRecord } from "@beep/epistemic-domain";
import { LegalClient, LegalContact, Matter, PatentAsset } from "@beep/law-practice-domain";
import { Membership, Organization, Principal, User } from "@beep/tenancy-domain";
import { Account, Household, Party, WealthClient } from "@beep/wealth-management-domain";
import {
  ApprovalGate,
  CandidateDraft,
  CandidateProject,
  CandidateTask,
  ContextPacket,
  EmailArtifact,
  Workspace,
} from "@beep/workspace-domain";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

interface SeedFixture {
  readonly agent: {
    readonly agentId: string;
    readonly mode: "deterministic_fixture";
    readonly name: string;
    readonly skillId: string;
  };
  readonly memberships: ReadonlyArray<{
    readonly membershipId: string;
    readonly organizationId: string;
    readonly role: string;
    readonly status: string;
    readonly userId: string;
  }>;
  readonly organization: {
    readonly kind: "solo_practice" | "wealth_firm";
    readonly licenseTier: string;
    readonly name: string;
    readonly organizationId: string;
  };
  readonly principals: ReadonlyArray<{
    readonly agentId?: string;
    readonly kind: string;
    readonly principalId: string;
    readonly userId?: string;
  }>;
  readonly scenarioId: string;
  readonly users: ReadonlyArray<{
    readonly displayName: string;
    readonly role: string;
    readonly userId: string;
  }>;
  readonly verticalContext: Record<string, Record<string, string>>;
  readonly workspace: {
    readonly name: string;
    readonly organizationId: string;
    readonly ownerPrincipalId: string;
    readonly workspaceId: string;
  };
}

interface EmailFixture {
  readonly artifactId: string;
  readonly from: Record<string, unknown>;
  readonly receivedAt: string;
  readonly scenarioId: string;
  readonly sourceSpans: ReadonlyArray<string>;
  readonly subject: string;
  readonly threadId: string;
  readonly to: ReadonlyArray<Record<string, unknown>>;
}

interface ExpectedClaims {
  readonly claims: ReadonlyArray<Record<string, unknown>>;
}

interface ExpectedTasks {
  readonly candidateProject: Record<string, unknown>;
  readonly tasks: ReadonlyArray<Record<string, unknown>>;
}

interface ExpectedDrafts {
  readonly drafts: ReadonlyArray<Record<string, unknown>>;
}

interface ExpectedApprovalGates {
  readonly approvalGates: ReadonlyArray<Record<string, unknown>>;
}

interface ExpectedContextPacket {
  readonly [key: string]: unknown;
}

const fixtureRoot = new URL(
  "../../../initiatives/agentic-professional-runtime/fixtures/runtime-data-loop/",
  import.meta.url
);

const readJson = async <A>(scenarioId: string, fileName: string): Promise<A> =>
  (await Bun.file(new URL(`${scenarioId}/${fileName}`, fixtureRoot)).json()) as A;

const readBody = (scenarioId: string): Promise<string> =>
  Bun.file(new URL(`${scenarioId}/body.md`, fixtureRoot)).text();

const toPlain = <A>(value: A): unknown => JSON.parse(JSON.stringify(value));

const decodeOrganization = S.decodeUnknownSync(Organization);
const decodeUser = S.decodeUnknownSync(User);
const decodeMembership = S.decodeUnknownSync(Membership);
const decodePrincipal = S.decodeUnknownSync(Principal);
const decodeWorkspace = S.decodeUnknownSync(Workspace);
const decodeEmailArtifact = S.decodeUnknownSync(EmailArtifact);
const decodeAgent = S.decodeUnknownSync(Agent);
const decodeLegalClient = S.decodeUnknownSync(LegalClient);
const decodeLegalContact = S.decodeUnknownSync(LegalContact);
const decodeMatter = S.decodeUnknownSync(Matter);
const decodePatentAsset = S.decodeUnknownSync(PatentAsset);
const decodeHousehold = S.decodeUnknownSync(Household);
const decodeWealthClient = S.decodeUnknownSync(WealthClient);
const decodeParty = S.decodeUnknownSync(Party);
const decodeAccount = S.decodeUnknownSync(Account);
const decodeCandidateClaim = S.decodeUnknownSync(CandidateClaim);
const decodeCandidateProject = S.decodeUnknownSync(CandidateProject);
const decodeCandidateTask = S.decodeUnknownSync(CandidateTask);
const decodeCandidateDraft = S.decodeUnknownSync(CandidateDraft);
const decodeApprovalGate = S.decodeUnknownSync(ApprovalGate);
const decodeContextPacket = S.decodeUnknownSync(ContextPacket);
const decodeActivity = S.decodeUnknownSync(Activity);
const decodeUsageRecord = S.decodeUnknownSync(UsageRecord);

const keyAt = <A extends Record<string, unknown>>(record: A, key: string): string => String(record[key]);

const decodeSeedModels = (seed: SeedFixture, email: EmailFixture, body: string): void => {
  decodeOrganization({
    fixtureKey: seed.organization.organizationId,
    id: 1,
    kind: seed.organization.kind,
    licenseTier: seed.organization.licenseTier,
    name: seed.organization.name,
  });
  seed.users.forEach((user, index) =>
    decodeUser({
      displayName: user.displayName,
      fixtureKey: user.userId,
      id: index + 2,
      role: user.role,
    })
  );
  seed.memberships.forEach((membership, index) =>
    decodeMembership({
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
      ...optionalAgent,
      ...optionalUser,
      fixtureKey: principal.principalId,
      id: index + 20,
      kind: principal.kind,
    });
  });
  decodeWorkspace({
    fixtureKey: seed.workspace.workspaceId,
    id: 30,
    name: seed.workspace.name,
    organizationFixtureKey: seed.workspace.organizationId,
    ownerPrincipalFixtureKey: seed.workspace.ownerPrincipalId,
  });
  decodeEmailArtifact({
    artifactFixtureKey: email.artifactId,
    body,
    from: email.from,
    id: 31,
    receivedAt: email.receivedAt,
    sourceSpans: email.sourceSpans,
    subject: email.subject,
    threadFixtureKey: email.threadId,
    to: email.to,
  });
  decodeAgent({
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
      displayName: legalClient.displayName,
      fixtureKey: legalClient.legalClientId,
      id: 50,
      status: legalClient.status,
    });
    decodeLegalContact({
      displayName: contact.displayName,
      fixtureKey: contact.contactId,
      id: 51,
      legalClientFixtureKey: contact.legalClientId,
      role: contact.role,
    });
    decodeMatter({
      displayName: matter.displayName,
      fixtureKey: matter.matterId,
      id: 52,
      legalClientFixtureKey: matter.legalClientId,
      matterType: matter.matterType,
    });
    decodePatentAsset({
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
    displayName: household.displayName,
    fixtureKey: household.householdId,
    id: 60,
    status: household.status,
  });
  decodeWealthClient({
    displayName: client.displayName,
    fixtureKey: client.clientId,
    householdFixtureKey: client.householdId,
    id: 61,
    partyFixtureKey: client.partyId,
    status: client.status,
  });
  decodeParty({
    displayName: party.displayName,
    fixtureKey: party.partyId,
    id: 62,
    partyType: party.partyType,
  });
  decodeAccount({
    accountType: account.accountType,
    externalLabel: account.externalLabel,
    fixtureKey: account.accountId,
    householdFixtureKey: account.householdId,
    id: 63,
  });
};

const decodeCandidateModels = (output: CandidateOutputSet): void => {
  output.claims.forEach((claim, index) =>
    decodeCandidateClaim({
      fixtureKey: keyAt(claim, "claimId"),
      id: index + 100,
      lifecycle: keyAt(claim, "lifecycle"),
      snapshot: claim,
    })
  );
  decodeCandidateProject({
    fixtureKey: keyAt(output.candidateProject, "projectId"),
    id: 120,
    lifecycle: keyAt(output.candidateProject, "lifecycle"),
    snapshot: output.candidateProject,
  });
  output.tasks.forEach((task, index) =>
    decodeCandidateTask({
      fixtureKey: keyAt(task, "taskId"),
      id: index + 130,
      lifecycle: keyAt(task, "lifecycle"),
      snapshot: task,
    })
  );
  output.drafts.forEach((draft, index) =>
    decodeCandidateDraft({
      fixtureKey: keyAt(draft, "draftId"),
      id: index + 140,
      lifecycle: keyAt(draft, "lifecycle"),
      snapshot: draft,
    })
  );
  output.approvalGates.forEach((gate, index) =>
    decodeApprovalGate({
      decision: keyAt(gate, "decision"),
      fixtureKey: keyAt(gate, "approvalGateId"),
      id: index + 150,
      lifecycle: keyAt(gate, "lifecycle"),
      snapshot: gate,
    })
  );
  decodeContextPacket({
    fixtureKey: output.contextPacket.contextPacketId,
    id: 160,
    scenarioFixtureKey: output.scenarioId,
    snapshot: output.contextPacket,
  });
  output.contextPacket.activities.forEach((activity, index) =>
    decodeActivity({
      fixtureKey: keyAt(activity, "activityId"),
      id: index + 170,
      snapshot: activity,
    })
  );
  output.contextPacket.usage.forEach((usage, index) =>
    decodeUsageRecord({
      fixtureKey: keyAt(usage, "usageRecordId"),
      id: index + 180,
      snapshot: usage,
    })
  );
};

const runScenario = async (scenarioId: "law-patent-intake" | "wealth-cash-request") => {
  const seed = await readJson<SeedFixture>(scenarioId, "seed.json");
  const email = await readJson<EmailFixture>(scenarioId, "input.email.json");
  const body = await readBody(scenarioId);

  decodeSeedModels(seed, email, body);
  decodeVerticalModels(seed);

  const output = await Effect.runPromise(runRuntimeFixture({ body, email, seed } satisfies RuntimeFixtureInput));
  decodeCandidateModels(output);

  return {
    expectedApprovalGates: await readJson<ExpectedApprovalGates>(scenarioId, "expected.approval-gates.json"),
    expectedClaims: await readJson<ExpectedClaims>(scenarioId, "expected.claims.json"),
    expectedContextPacket: await readJson<ExpectedContextPacket>(scenarioId, "expected.context-packet.json"),
    expectedDrafts: await readJson<ExpectedDrafts>(scenarioId, "expected.drafts.json"),
    expectedTasks: await readJson<ExpectedTasks>(scenarioId, "expected.tasks.json"),
    output,
  };
};

describe("Agentic Professional Runtime data loop", () => {
  it("turns the law patent-intake email into evidenced candidate work", async () => {
    const { expectedApprovalGates, expectedClaims, expectedContextPacket, expectedDrafts, expectedTasks, output } =
      await runScenario("law-patent-intake");

    expect(toPlain(output.claims)).toEqual(expectedClaims.claims);
    expect(toPlain(output.candidateProject)).toEqual(expectedTasks.candidateProject);
    expect(toPlain(output.tasks)).toEqual(expectedTasks.tasks);
    expect(toPlain(output.drafts)).toEqual(expectedDrafts.drafts);
    expect(toPlain(output.approvalGates)).toEqual(expectedApprovalGates.approvalGates);
    expect(toPlain(output.contextPacket)).toEqual(expectedContextPacket);
  });

  it("turns the wealth cash-request email into evidenced candidate work", async () => {
    const { expectedApprovalGates, expectedClaims, expectedContextPacket, expectedDrafts, expectedTasks, output } =
      await runScenario("wealth-cash-request");

    expect(toPlain(output.claims)).toEqual(expectedClaims.claims);
    expect(toPlain(output.candidateProject)).toEqual(expectedTasks.candidateProject);
    expect(toPlain(output.tasks)).toEqual(expectedTasks.tasks);
    expect(toPlain(output.drafts)).toEqual(expectedDrafts.drafts);
    expect(toPlain(output.approvalGates)).toEqual(expectedApprovalGates.approvalGates);
    expect(toPlain(output.contextPacket)).toEqual(expectedContextPacket);
  });
});
