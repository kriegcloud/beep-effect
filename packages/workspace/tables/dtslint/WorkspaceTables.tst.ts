import { describe, expect, it } from "tstyche";
import type { EntityTable } from "@beep/drizzle";
import type * as CandidateDraft from "@beep/workspace-domain/entities/CandidateDraft";
import type * as CandidateProject from "@beep/workspace-domain/entities/CandidateProject";
import type { DbSchema } from "@beep/workspace-tables";
import type * as CandidateDraftTables from "@beep/workspace-tables/entities/CandidateDraft";
import type * as CandidateProjectTables from "@beep/workspace-tables/entities/CandidateProject";

describe("WorkspaceTables types", () => {
  it("exports the DbSchema type from the package entrypoint", () => {
    expect<DbSchema>().type.toBe<{
      readonly candidateDraft: typeof CandidateDraftTables.Table;
      readonly candidateProject: typeof CandidateProjectTables.Table;
    }>();
  });

  it("preserves CandidateDraft table and descriptor metadata literals", () => {
    expect<typeof CandidateDraftTables.Table>().type.toBeAssignableTo<
      EntityTable.TableFor<typeof CandidateDraft.CandidateDraft>
    >();
    expect<typeof CandidateDraftTables.Table.definition.tableName>().type.toBe<"workspace_candidate_draft">();
    expect<typeof CandidateDraftTables.Table.definition.entityId.entityType>().type.toBe<"WorkspaceCandidateDraft">();
    expect<typeof CandidateDraftTables.Table.definition.persisted.fixtureKey.storageKind>().type.toBe<"text">();
    expect<typeof CandidateDraftTables.Table.definition.persisted.lifecycle.storageKind>().type.toBe<"literal">();
    expect<typeof CandidateDraftTables.Table.definition.persisted.snapshot.storageKind>().type.toBe<"jsonb">();
  });

  it("preserves CandidateProject table and descriptor metadata literals", () => {
    expect<typeof CandidateProjectTables.Table>().type.toBeAssignableTo<
      EntityTable.TableFor<typeof CandidateProject.CandidateProject>
    >();
    expect<typeof CandidateProjectTables.Table.definition.tableName>().type.toBe<"workspace_candidate_project">();
    expect<
      typeof CandidateProjectTables.Table.definition.entityId.entityType
    >().type.toBe<"WorkspaceCandidateProject">();
    expect<typeof CandidateProjectTables.Table.definition.persisted.fixtureKey.storageKind>().type.toBe<"text">();
    expect<typeof CandidateProjectTables.Table.definition.persisted.lifecycle.storageKind>().type.toBe<"literal">();
    expect<typeof CandidateProjectTables.Table.definition.persisted.snapshot.storageKind>().type.toBe<"jsonb">();
  });
});
