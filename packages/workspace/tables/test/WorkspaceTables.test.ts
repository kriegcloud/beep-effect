import { CandidateDraft as CandidateDraftModel } from "@beep/workspace-domain/entities/CandidateDraft";
import { CandidateProject as CandidateProjectModel } from "@beep/workspace-domain/entities/CandidateProject";
import { Message as MessageModel } from "@beep/workspace-domain/entities/Message";
import { Thread as ThreadModel } from "@beep/workspace-domain/entities/Thread";
import { Turn as TurnModel } from "@beep/workspace-domain/entities/Turn";
import { DbSchema, Entities } from "@beep/workspace-tables";
import * as CandidateDraft from "@beep/workspace-tables/entities/CandidateDraft";
import * as CandidateProject from "@beep/workspace-tables/entities/CandidateProject";
import * as Message from "@beep/workspace-tables/entities/Message";
import * as Thread from "@beep/workspace-tables/entities/Thread";
import * as Turn from "@beep/workspace-tables/entities/Turn";
import { describe, expect, it } from "@effect/vitest";
import { getColumns } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";

const expectBaseProjectionColumns = (table: typeof CandidateDraft.Table | typeof CandidateProject.Table) => {
  const columns = getColumns(table);

  expect(columns.id.name).toBe("id");
  expect(columns.id.primary).toBe(true);
  expect(columns.id.columnType).toBe("PgSerial");
  expect(columns.entityType.name).toBe("entity_type");
  expect(columns.entityType.notNull).toBe(true);
  expect(columns.fixtureKey.name).toBe("fixture_key");
  expect(columns.fixtureKey.columnType).toBe("PgText");
  expect(columns.lifecycle.name).toBe("lifecycle");
  expect(columns.lifecycle.columnType).toBe("PgText");
  expect(columns.snapshot.name).toBe("snapshot");
  expect(columns.snapshot.columnType).toBe("PgJsonb");
};

describe("WorkspaceTables", () => {
  it("materializes CandidateDraft metadata without executing a live database", () => {
    const config = getTableConfig(CandidateDraft.Table);

    expect(CandidateDraft.Table.definition.tableName).toBe("workspace_candidate_draft");
    expect(CandidateDraft.Table.definition.entityId.entityType).toBe("WorkspaceCandidateDraft");
    expect(CandidateDraft.Table.entitySchema).toBe(CandidateDraftModel);
    expect(config.name).toBe("workspace_candidate_draft");
    expectBaseProjectionColumns(CandidateDraft.Table);
  });

  it("materializes CandidateProject metadata without executing a live database", () => {
    const config = getTableConfig(CandidateProject.Table);

    expect(CandidateProject.Table.definition.tableName).toBe("workspace_candidate_project");
    expect(CandidateProject.Table.definition.entityId.entityType).toBe("WorkspaceCandidateProject");
    expect(CandidateProject.Table.entitySchema).toBe(CandidateProjectModel);
    expect(config.name).toBe("workspace_candidate_project");
    expectBaseProjectionColumns(CandidateProject.Table);
  });

  it("exports the metadata aggregate and entity namespaces", () => {
    expect(DbSchema.candidateDraft).toBe(CandidateDraft.Table);
    expect(DbSchema.candidateProject).toBe(CandidateProject.Table);
    expect(DbSchema.message).toBe(Message.Table);
    expect(DbSchema.thread).toBe(Thread.Table);
    expect(DbSchema.turn).toBe(Turn.Table);
    expect(Entities.CandidateDraft.Table).toBe(CandidateDraft.Table);
    expect(Entities.CandidateProject.Table).toBe(CandidateProject.Table);
    expect(Entities.Message.Table).toBe(Message.Table);
    expect(Entities.Thread.Table).toBe(Thread.Table);
    expect(Entities.Turn.Table).toBe(Turn.Table);
  });

  it("materializes Thread, Turn, and Message metadata without executing a live database", () => {
    expect(getTableConfig(Thread.Table).name).toBe("workspace_thread");
    expect(Thread.Table.entitySchema).toBe(ThreadModel);
    expect(getColumns(Thread.Table).workspaceId.name).toBe("workspace_id");

    expect(getTableConfig(Turn.Table).name).toBe("workspace_turn");
    expect(Turn.Table.entitySchema).toBe(TurnModel);
    expect(getColumns(Turn.Table).parentTurnId.name).toBe("parent_turn_id");
    expect(getColumns(Turn.Table).items.columnType).toBe("PgJsonb");

    expect(getTableConfig(Message.Table).name).toBe("workspace_message");
    expect(Message.Table.entitySchema).toBe(MessageModel);
    expect(getColumns(Message.Table).content.columnType).toBe("PgJsonb");
    expect(getColumns(Message.Table).role.name).toBe("role");
  });
});
