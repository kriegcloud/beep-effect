import type * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import {
  type ApprovalDecision,
  type ApprovalDecision as ApprovalDecisionType,
  type CandidateLifecycle,
  type CandidateLifecycle as CandidateLifecycleType,
  Workspace as WorkspaceEntity,
} from "@beep/workspace-domain";
import { describe, expect, it } from "tstyche";

declare const workspace: typeof WorkspaceEntity.Type;

describe("@beep/workspace-domain", () => {
  it("preserves exported value schema types", () => {
    expect<typeof ApprovalDecision.Type>().type.toBe<ApprovalDecisionType>();
    expect<ApprovalDecisionType>().type.toBe<"pending">();
    expect<typeof CandidateLifecycle.Type>().type.toBe<CandidateLifecycleType>();
    expect<CandidateLifecycleType>().type.toBe<"candidate">();
  });

  it("preserves Workspace BaseEntity identity wiring", () => {
    expect(WorkspaceEntity.definition.entityId).type.toBe<typeof WorkspaceIdentity.WorkspaceId>();
    expect<typeof WorkspaceEntity.definition.entityId.tableName>().type.toBe<"workspace_workspace">();
    expect<typeof WorkspaceEntity.definition.entityId.entityType>().type.toBe<"WorkspaceWorkspace">();
    expect<typeof WorkspaceEntity.definition.fieldMap.ownerPrincipalFixtureKey.storageKind>().type.toBe<"text">();
    expect<
      typeof WorkspaceEntity.definition.fieldMap.organizationFixtureKey.columnName
    >().type.toBe<"organization_fixture_key">();
  });

  it("preserves decode and constructor types", () => {
    expect<typeof WorkspaceEntity.Encoded>().type.toBeAssignableTo<typeof WorkspaceEntity.Encoded>();
    expect(new WorkspaceEntity(workspace)).type.toBe<WorkspaceEntity>();
    expect<WorkspaceEntity["ownerPrincipalFixtureKey"]>().type.toBe<string>();
  });
});
