import type * as EntityId from "@beep/shared-domain/entity/EntityId";
import * as Identity from "@beep/shared-domain/identity";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit } from "effect";
import { cast } from "effect/Function";
import * as S from "effect/Schema";

type IdentitySpec = {
  readonly brand: string;
  readonly description: string;
  readonly entityType: string;
  readonly label: string;
  readonly name: string;
  readonly resource: string;
  readonly schema: EntityId.Any;
  readonly slice: string;
  readonly tableName: string;
};

const specs = [
  {
    brand: "AgentCapabilityAgentId",
    description: "Identifier for an agent capability agent entity.",
    entityType: "AgentCapabilityAgent",
    label: "AgentCapability.AgentId",
    name: "agent",
    resource: "agent_capability.agent",
    schema: Identity.AgentCapability.AgentId,
    slice: "agent_capability",
    tableName: "agent_capability_agent",
  },
  {
    brand: "AgentCapabilitySkillId",
    description: "Identifier for an agent capability skill entity.",
    entityType: "AgentCapabilitySkill",
    label: "AgentCapability.SkillId",
    name: "skill",
    resource: "agent_capability.skill",
    schema: Identity.AgentCapability.SkillId,
    slice: "agent_capability",
    tableName: "agent_capability_skill",
  },
  {
    brand: "FixtureLabSpecimenSpecimenId",
    description: "Identifier for a fixture-lab specimen entity.",
    entityType: "FixtureLabSpecimenSpecimen",
    label: "FixtureLabSpecimen.SpecimenId",
    name: "specimen",
    resource: "fixture_lab_specimen.specimen",
    schema: Identity.FixtureLabSpecimen.SpecimenId,
    slice: "fixture_lab_specimen",
    tableName: "fixture_lab_specimen_specimen",
  },
  {
    brand: "EpistemicCandidateClaimId",
    description: "Identifier for a candidate claim entity.",
    entityType: "EpistemicCandidateClaim",
    label: "Epistemic.CandidateClaimId",
    name: "candidate_claim",
    resource: "epistemic.candidate_claim",
    schema: Identity.Epistemic.CandidateClaimId,
    slice: "epistemic",
    tableName: "epistemic_candidate_claim",
  },
  {
    brand: "EpistemicEvidenceId",
    description: "Identifier for an evidence entity.",
    entityType: "EpistemicEvidence",
    label: "Epistemic.EvidenceId",
    name: "evidence",
    resource: "epistemic.evidence",
    schema: Identity.Epistemic.EvidenceId,
    slice: "epistemic",
    tableName: "epistemic_evidence",
  },
  {
    brand: "EpistemicActivityId",
    description: "Identifier for a provenance activity entity.",
    entityType: "EpistemicActivity",
    label: "Epistemic.ActivityId",
    name: "activity",
    resource: "epistemic.activity",
    schema: Identity.Epistemic.ActivityId,
    slice: "epistemic",
    tableName: "epistemic_activity",
  },
  {
    brand: "EpistemicUsageRecordId",
    description: "Identifier for a usage attribution record entity.",
    entityType: "EpistemicUsageRecord",
    label: "Epistemic.UsageRecordId",
    name: "usage_record",
    resource: "epistemic.usage_record",
    schema: Identity.Epistemic.UsageRecordId,
    slice: "epistemic",
    tableName: "epistemic_usage_record",
  },
  {
    brand: "LawPracticeLegalClientId",
    description: "Identifier for a law-practice legal client entity.",
    entityType: "LawPracticeLegalClient",
    label: "LawPractice.LegalClientId",
    name: "legal_client",
    resource: "law_practice.legal_client",
    schema: Identity.LawPractice.LegalClientId,
    slice: "law_practice",
    tableName: "law_practice_legal_client",
  },
  {
    brand: "LawPracticeLegalContactId",
    description: "Identifier for a law-practice legal contact entity.",
    entityType: "LawPracticeLegalContact",
    label: "LawPractice.LegalContactId",
    name: "legal_contact",
    resource: "law_practice.legal_contact",
    schema: Identity.LawPractice.LegalContactId,
    slice: "law_practice",
    tableName: "law_practice_legal_contact",
  },
  {
    brand: "LawPracticeMatterId",
    description: "Identifier for a law-practice matter entity.",
    entityType: "LawPracticeMatter",
    label: "LawPractice.MatterId",
    name: "matter",
    resource: "law_practice.matter",
    schema: Identity.LawPractice.MatterId,
    slice: "law_practice",
    tableName: "law_practice_matter",
  },
  {
    brand: "LawPracticePatentAssetId",
    description: "Identifier for a law-practice patent asset entity.",
    entityType: "LawPracticePatentAsset",
    label: "LawPractice.PatentAssetId",
    name: "patent_asset",
    resource: "law_practice.patent_asset",
    schema: Identity.LawPractice.PatentAssetId,
    slice: "law_practice",
    tableName: "law_practice_patent_asset",
  },
  {
    brand: "TenancyOrganizationId",
    description: "Identifier for a tenancy organization entity.",
    entityType: "TenancyOrganization",
    label: "Tenancy.OrganizationId",
    name: "organization",
    resource: "tenancy.organization",
    schema: Identity.Tenancy.OrganizationId,
    slice: "tenancy",
    tableName: "tenancy_organization",
  },
  {
    brand: "TenancyUserId",
    description: "Identifier for a tenancy user entity.",
    entityType: "TenancyUser",
    label: "Tenancy.UserId",
    name: "user",
    resource: "tenancy.user",
    schema: Identity.Tenancy.UserId,
    slice: "tenancy",
    tableName: "tenancy_user",
  },
  {
    brand: "TenancyMembershipId",
    description: "Identifier for a tenancy membership entity.",
    entityType: "TenancyMembership",
    label: "Tenancy.MembershipId",
    name: "membership",
    resource: "tenancy.membership",
    schema: Identity.Tenancy.MembershipId,
    slice: "tenancy",
    tableName: "tenancy_membership",
  },
  {
    brand: "TenancyPrincipalId",
    description: "Identifier for a tenancy principal entity.",
    entityType: "TenancyPrincipal",
    label: "Tenancy.PrincipalId",
    name: "principal",
    resource: "tenancy.principal",
    schema: Identity.Tenancy.PrincipalId,
    slice: "tenancy",
    tableName: "tenancy_principal",
  },
  {
    brand: "WealthManagementHouseholdId",
    description: "Identifier for a wealth-management household entity.",
    entityType: "WealthManagementHousehold",
    label: "WealthManagement.HouseholdId",
    name: "household",
    resource: "wealth_management.household",
    schema: Identity.WealthManagement.HouseholdId,
    slice: "wealth_management",
    tableName: "wealth_management_household",
  },
  {
    brand: "WealthManagementWealthClientId",
    description: "Identifier for a wealth-management client entity.",
    entityType: "WealthManagementWealthClient",
    label: "WealthManagement.WealthClientId",
    name: "wealth_client",
    resource: "wealth_management.wealth_client",
    schema: Identity.WealthManagement.WealthClientId,
    slice: "wealth_management",
    tableName: "wealth_management_wealth_client",
  },
  {
    brand: "WealthManagementPartyId",
    description: "Identifier for a wealth-management party entity.",
    entityType: "WealthManagementParty",
    label: "WealthManagement.PartyId",
    name: "party",
    resource: "wealth_management.party",
    schema: Identity.WealthManagement.PartyId,
    slice: "wealth_management",
    tableName: "wealth_management_party",
  },
  {
    brand: "WealthManagementAccountId",
    description: "Identifier for a wealth-management account entity.",
    entityType: "WealthManagementAccount",
    label: "WealthManagement.AccountId",
    name: "account",
    resource: "wealth_management.account",
    schema: Identity.WealthManagement.AccountId,
    slice: "wealth_management",
    tableName: "wealth_management_account",
  },
  {
    brand: "WorkspaceWorkspaceId",
    description: "Identifier for a workspace entity.",
    entityType: "WorkspaceWorkspace",
    label: "Workspace.WorkspaceId",
    name: "workspace",
    resource: "workspace.workspace",
    schema: Identity.Workspace.WorkspaceId,
    slice: "workspace",
    tableName: "workspace_workspace",
  },
  {
    brand: "WorkspaceEmailArtifactId",
    description: "Identifier for a normalized email artifact entity.",
    entityType: "WorkspaceEmailArtifact",
    label: "Workspace.EmailArtifactId",
    name: "email_artifact",
    resource: "workspace.email_artifact",
    schema: Identity.Workspace.EmailArtifactId,
    slice: "workspace",
    tableName: "workspace_email_artifact",
  },
  {
    brand: "WorkspaceCandidateProjectId",
    description: "Identifier for a candidate project entity.",
    entityType: "WorkspaceCandidateProject",
    label: "Workspace.CandidateProjectId",
    name: "candidate_project",
    resource: "workspace.candidate_project",
    schema: Identity.Workspace.CandidateProjectId,
    slice: "workspace",
    tableName: "workspace_candidate_project",
  },
  {
    brand: "WorkspaceCandidateTaskId",
    description: "Identifier for a candidate task entity.",
    entityType: "WorkspaceCandidateTask",
    label: "Workspace.CandidateTaskId",
    name: "candidate_task",
    resource: "workspace.candidate_task",
    schema: Identity.Workspace.CandidateTaskId,
    slice: "workspace",
    tableName: "workspace_candidate_task",
  },
  {
    brand: "WorkspaceCandidateDraftId",
    description: "Identifier for a candidate draft entity.",
    entityType: "WorkspaceCandidateDraft",
    label: "Workspace.CandidateDraftId",
    name: "candidate_draft",
    resource: "workspace.candidate_draft",
    schema: Identity.Workspace.CandidateDraftId,
    slice: "workspace",
    tableName: "workspace_candidate_draft",
  },
  {
    brand: "WorkspaceApprovalGateId",
    description: "Identifier for an approval gate entity.",
    entityType: "WorkspaceApprovalGate",
    label: "Workspace.ApprovalGateId",
    name: "approval_gate",
    resource: "workspace.approval_gate",
    schema: Identity.Workspace.ApprovalGateId,
    slice: "workspace",
    tableName: "workspace_approval_gate",
  },
  {
    brand: "WorkspaceContextPacketId",
    description: "Identifier for a bounded context packet entity.",
    entityType: "WorkspaceContextPacket",
    label: "Workspace.ContextPacketId",
    name: "context_packet",
    resource: "workspace.context_packet",
    schema: Identity.Workspace.ContextPacketId,
    slice: "workspace",
    tableName: "workspace_context_packet",
  },
] satisfies ReadonlyArray<IdentitySpec>;

const expectFailure = Effect.fn("expectFailure")(function* <A, E>(effect: Effect.Effect<A, E, never>) {
  const exit = yield* Effect.exit(effect);
  expect(Exit.isFailure(exit)).toBe(true);
});

describe("P3 identity namespaces", () => {
  it("expose deterministic entity-id metadata", () => {
    for (const spec of specs) {
      expect(spec.schema.brand, spec.label).toBe(spec.brand);
      expect(spec.schema.entityType, spec.label).toBe(spec.entityType);
      expect(spec.schema.resource, spec.label).toBe(spec.resource);
      expect(spec.schema.slice, spec.label).toBe(spec.slice);
      expect(spec.schema.tableName, spec.label).toBe(spec.tableName);
      expect(spec.schema.definition.description, spec.label).toBe(spec.description);
      expect(spec.schema.definition.name, spec.label).toBe(spec.name);
    }
  });

  it.effect("decode positive integer ids and reject invalid ids", () =>
    Effect.gen(function* () {
      for (const spec of specs) {
        const decode = S.decodeUnknownEffect(spec.schema);

        expect(yield* decode(1), spec.label).toBe(1);
        expect(spec.schema.equivalence(cast(1), cast(1)), spec.label).toBe(true);
        expect(spec.schema.equivalence(cast(1), cast(2)), spec.label).toBe(false);
        yield* expectFailure(decode(0));
      }
    })
  );
});
