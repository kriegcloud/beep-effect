import type * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import {
  type ApprovalDecision,
  type ApprovalDecision as ApprovalDecisionType,
  type CandidateLifecycle,
  type CandidateLifecycle as CandidateLifecycleType,
  Workspace as WorkspaceEntity,
} from "@beep/workspace-domain";
import { describe, expect, it } from "tstyche";

declare const workspace: WorkspaceEntity;

describe("@beep/workspace-domain", () => {
  it("preserves exported value schema types", () => {
    expect<ApprovalDecision>().type.toBe<ApprovalDecisionType>();
    expect<ApprovalDecisionType>().type.toBe<"pending">();
    expect<CandidateLifecycle>().type.toBe<CandidateLifecycleType>();
    expect<CandidateLifecycleType>().type.toBe<"candidate">();
  });

  it("preserves Workspace BaseEntity identity wiring", () => {
    expect(WorkspaceEntity.definition.entityId).type.toBe<typeof WorkspaceIdentity.WorkspaceId>();
    expect<typeof WorkspaceEntity.definition.entityId.tableName>().type.toBe<"workspace_workspace">();
    expect<typeof WorkspaceEntity.definition.entityId.entityType>().type.toBe<"WorkspaceWorkspace">();
    expect<typeof WorkspaceEntity.definition.persisted.ownerPrincipalFixtureKey.storageKind>().type.toBe<"text">();
    expect<
      typeof WorkspaceEntity.definition.persisted.organizationFixtureKey.columnName
    >().type.toBe<"organization_fixture_key">();
  });

  it("preserves decode and constructor types", () => {
    expect<typeof WorkspaceEntity.Encoded>().type.toBeAssignableTo<typeof WorkspaceEntity.Encoded>();
    expect(new WorkspaceEntity(workspace)).type.toBe<WorkspaceEntity>();
    expect<WorkspaceEntity["ownerPrincipalFixtureKey"]>().type.toBe<string>();
  });
});
