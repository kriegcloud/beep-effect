import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { ApprovalDecision, CandidateLifecycle, Workspace as WorkspaceEntity } from "@beep/workspace-domain";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const systemPrincipal = { kind: "System", component: "Runtime" } as const;

const baseEntityInput = (entityType: string, id: number) => ({
  createdAt: id,
  createdByPrincipal: systemPrincipal,
  entityType,
  id,
  orgId: 1,
  rowVersion: 1,
  schemaVersion: "0.0.0",
  source: "System",
  updatedAt: id + 1,
  updatedByPrincipal: systemPrincipal,
});

describe("@beep/workspace-domain", () => {
  it("exports value schemas from the package identity", () => {
    expect(ApprovalDecision.is.pending("pending")).toBe(true);
    expect(CandidateLifecycle.is.candidate("candidate")).toBe(true);
  });

  it("wires Workspace to the workspace BaseEntity identity", () => {
    expect(WorkspaceEntity.definition.entityId).toBe(WorkspaceIdentity.WorkspaceId);
    expect(WorkspaceEntity.definition.entityId.tableName).toBe("workspace_workspace");
    expect(WorkspaceEntity.definition.entityId.entityType).toBe("WorkspaceWorkspace");
    expect(WorkspaceEntity.definition.persisted.id.storageKind).toBe("entityId");
    expect(WorkspaceEntity.definition.persisted.ownerPrincipalFixtureKey.columnName).toBe(
      "owner_principal_fixture_key"
    );
  });

  it("decodes and constructs a Workspace row", () => {
    const decoded = S.decodeUnknownSync(WorkspaceEntity)({
      ...baseEntityInput("WorkspaceWorkspace", 2),
      fixtureKey: "workspace.acme",
      name: "Acme Workspace",
      organizationFixtureKey: "org.acme",
      ownerPrincipalFixtureKey: "principal.owner",
    });
    const constructed = new WorkspaceEntity(decoded);

    expect(decoded).toBeInstanceOf(WorkspaceEntity);
    expect(constructed).toBeInstanceOf(WorkspaceEntity);
    expect(constructed.entityType).toBe("WorkspaceWorkspace");
    expect(constructed.organizationFixtureKey).toBe("org.acme");
    expect(constructed.ownerPrincipalFixtureKey).toBe("principal.owner");
  });
});
