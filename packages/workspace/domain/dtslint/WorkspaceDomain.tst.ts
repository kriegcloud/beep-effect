import { Workspace as WorkspaceEntity } from "@beep/workspace-domain";
import { describe, expect, it } from "tstyche";
import type * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import type {
  ApprovalDecision,
  ApprovalDecision as ApprovalDecisionType,
  CandidateLifecycle,
  CandidateLifecycle as CandidateLifecycleType,
  Message,
  MessageRole,
  MessageRole as MessageRoleType,
  Thread,
  Turn,
  TurnItem,
  TurnItem as TurnItemType,
} from "@beep/workspace-domain";

declare const workspace: WorkspaceEntity;

describe("@beep/workspace-domain", () => {
  it("preserves exported value schema types", () => {
    expect<ApprovalDecision>().type.toBe<ApprovalDecisionType>();
    expect<ApprovalDecisionType>().type.toBe<"pending">();
    expect<CandidateLifecycle>().type.toBe<CandidateLifecycleType>();
    expect<CandidateLifecycleType>().type.toBe<"candidate">();
    expect<MessageRole>().type.toBe<MessageRoleType>();
    expect<MessageRoleType>().type.toBe<"system" | "user" | "assistant" | "agent" | "tool">();
    expect<TurnItem>().type.toBe<TurnItemType>();
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
    expect(WorkspaceEntity.make(workspace)).type.toBe<WorkspaceEntity>();
    expect<WorkspaceEntity["ownerPrincipalFixtureKey"]>().type.toBe<string>();
  });

  it("preserves Thread, Turn, and Message entity metadata literals", () => {
    expect<typeof Thread.definition.entityId>().type.toBe<typeof WorkspaceIdentity.ThreadId>();
    expect<typeof Thread.definition.entityId.tableName>().type.toBe<"workspace_thread">();
    expect<typeof Turn.definition.entityId>().type.toBe<typeof WorkspaceIdentity.TurnId>();
    expect<typeof Turn.definition.entityId.tableName>().type.toBe<"workspace_turn">();
    expect<typeof Turn.definition.persisted.items.storageKind>().type.toBe<"jsonb">();
    expect<typeof Message.definition.entityId>().type.toBe<typeof WorkspaceIdentity.MessageId>();
    expect<typeof Message.definition.entityId.tableName>().type.toBe<"workspace_message">();
    expect<typeof Message.definition.persisted.content.storageKind>().type.toBe<"jsonb">();
  });
});
