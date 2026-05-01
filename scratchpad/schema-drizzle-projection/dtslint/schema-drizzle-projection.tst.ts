import { Workspace } from "@beep/shared-domain/identity";
import { describe, expect, it } from "tstyche";
import type * as S from "effect/Schema";
import * as Schema from "effect/Schema";
import {
  CandidateDraft,
  CandidateDraftTable,
  CandidateProject,
  CandidateProjectTable,
} from "../proof.ts";
import * as EntitySchema from "../entity-schema.ts";

type EntityIdEncoded<Entity extends EntitySchema.EntityIdLike> = S.Codec.Encoded<EntitySchema.EntityIdSchema<Entity>>;
type CandidateDraftIdEncoded = EntityIdEncoded<typeof Workspace.CandidateDraftId>;
type CandidateProjectIdEncoded = EntityIdEncoded<typeof Workspace.CandidateProjectId>;
type WorkspaceIdEncoded = EntityIdEncoded<typeof Workspace.WorkspaceId>;

type ExpectedCandidateDraftEncoded = {
  readonly id: CandidateDraftIdEncoded;
  readonly entityType: "WorkspaceCandidateDraft";
  readonly createdAt: number;
  readonly rowVersion: number;
  readonly fixtureKey: string;
  readonly lifecycle: "draft" | "ready" | "approved";
  readonly snapshot: S.JsonObject;
  readonly parentId: WorkspaceIdEncoded | null;
};

type ExpectedCandidateDraftSelect = {
  id: CandidateDraftIdEncoded;
  entityType: "WorkspaceCandidateDraft";
  createdAt: number;
  rowVersion: number;
  fixtureKey: string;
  lifecycle: "draft" | "ready" | "approved";
  snapshot: S.JsonObject;
  parentId: WorkspaceIdEncoded | null;
};

type ExpectedCandidateDraftInsert = {
  id?: CandidateDraftIdEncoded | undefined;
  entityType: "WorkspaceCandidateDraft";
  createdAt: number;
  rowVersion: number;
  fixtureKey: string;
  lifecycle: "draft" | "ready" | "approved";
  snapshot: S.JsonObject;
  parentId?: WorkspaceIdEncoded | null | undefined;
};

type ExpectedCandidateProjectEncoded = {
  readonly id: CandidateProjectIdEncoded;
  readonly entityType: "WorkspaceCandidateProject";
  readonly createdAt: number;
  readonly rowVersion: number;
  readonly title: string;
  readonly status: "proposed" | "active" | "archived";
  readonly sourceDraftId: CandidateDraftIdEncoded | null;
  readonly snapshot: S.JsonObject;
};

type ExpectedCandidateProjectSelect = {
  id: CandidateProjectIdEncoded;
  entityType: "WorkspaceCandidateProject";
  createdAt: number;
  rowVersion: number;
  title: string;
  status: "proposed" | "active" | "archived";
  sourceDraftId: CandidateDraftIdEncoded | null;
  snapshot: S.JsonObject;
};

type ExpectedCandidateProjectInsert = {
  id?: CandidateProjectIdEncoded | undefined;
  entityType: "WorkspaceCandidateProject";
  createdAt: number;
  rowVersion: number;
  title: string;
  status: "proposed" | "active" | "archived";
  sourceDraftId?: CandidateDraftIdEncoded | null | undefined;
  snapshot: S.JsonObject;
};

const candidateDraftIdentifierTableName = EntitySchema.tableNameFromIdentifier(
  "@beep/scratchpad/schema-drizzle-projection/CandidateDraft"
);
const createdAtColumnName = EntitySchema.columnNameFor("createdAt", EntitySchema.persist.timestampMillis());
const entityTypeColumnName = EntitySchema.columnNameFor(
  "entityType",
  EntitySchema.persist.literal({
    columnName: "entity_type",
    valueStrategy: "derived",
  })
);

type AnyDescriptor = EntitySchema.PersistDescriptorByValueStrategy<EntitySchema.PersistDescriptor>;
type GeneratedEntityIdDescriptor = Extract<
  AnyDescriptor,
  { readonly storageKind: "entityId"; readonly valueStrategy: "generatedOnInsert" }
>;

const assertDescriptorCompatibility = <
  const Fields extends EntitySchema.Fields,
  const Persisted extends EntitySchema.PersistedFor<Fields>,
>(
  _input: EntitySchema.ClassInput<Fields, Persisted>
) => undefined;

describe("schema-to-drizzle projection scratchpad", () => {
  it("keeps decoded and encoded entity sides distinct and branded", () => {
    expect<typeof CandidateDraft.Encoded>().type.toBe<ExpectedCandidateDraftEncoded>();
    expect<typeof CandidateProject.Encoded>().type.toBe<ExpectedCandidateProjectEncoded>();
    expect<typeof CandidateDraft.Type.id>().type.toBe<typeof Workspace.CandidateDraftId.Type>();
    expect<typeof CandidateProject.Type.id>().type.toBe<typeof Workspace.CandidateProjectId.Type>();
    expect<typeof CandidateDraft.Type.id>().type.not.toBe<typeof CandidateProject.Type.id>();
  });

  it("projects Drizzle table select and insert shapes from the encoded side", () => {
    expect<typeof CandidateDraftTable.$inferSelect>().type.toBe<ExpectedCandidateDraftSelect>();
    expect<typeof CandidateDraftTable.$inferInsert>().type.toBe<ExpectedCandidateDraftInsert>();
    expect<typeof CandidateProjectTable.$inferSelect>().type.toBe<ExpectedCandidateProjectSelect>();
    expect<typeof CandidateProjectTable.$inferInsert>().type.toBe<ExpectedCandidateProjectInsert>();
  });

  it("preserves identity-derived table and column literals", () => {
    expect<typeof CandidateDraft.definition.tableName>().type.toBe<typeof Workspace.CandidateDraftId.tableName>();
    expect<typeof CandidateProject.definition.tableName>().type.toBe<typeof Workspace.CandidateProjectId.tableName>();
    expect<typeof CandidateDraft.definition.persisted.entityType.columnName>().type.toBe<"entity_type">();
    expect<typeof CandidateDraft.definition.persisted.parentId.storageKind>().type.toBe<"entityId">();
    expect<typeof candidateDraftIdentifierTableName>().type.toBe<"candidate_draft">();
    expect<typeof createdAtColumnName>().type.toBe<"created_at">();
    expect<typeof entityTypeColumnName>().type.toBe<"entity_type">();
  });

  it("exposes schema-backed descriptor discriminants for narrowing", () => {
    expect<GeneratedEntityIdDescriptor["storageKind"]>().type.toBe<"entityId">();
    expect<GeneratedEntityIdDescriptor["valueStrategy"]>().type.toBe<"generatedOnInsert">();
    expect(EntitySchema.PersistDescriptor.cases.entityId).type.not.toBe<never>();
    expect(EntitySchema.PersistDescriptor.guards.entityId).type.not.toBe<never>();
    expect(EntitySchema.PersistDescriptor.match).type.not.toBe<never>();
  });

  it("accepts descriptors compatible with encoded schema fields", () => {
    assertDescriptorCompatibility({
      fields: {
        name: Schema.String,
      },
      persisted: {
        name: EntitySchema.persist.text(),
      },
    });

    assertDescriptorCompatibility({
      fields: {
        nullableName: Schema.NullOr(Schema.String),
        optionalName: Schema.OptionFromNullOr(Schema.String),
        snapshot: Schema.Record(Schema.String, Schema.Json),
      },
      persisted: {
        nullableName: EntitySchema.persist.text(),
        optionalName: EntitySchema.persist.text(),
        snapshot: EntitySchema.persist.jsonb(),
      },
    });
  });

  it("rejects descriptors that drift from encoded schema fields", () => {
    assertDescriptorCompatibility({
      fields: {
        name: Schema.String,
      },
      persisted: {
        // @ts-expect-error!
        name: EntitySchema.persist.int(),
      },
    });

    assertDescriptorCompatibility({
      fields: {
        id: EntitySchema.entityId(Workspace.CandidateDraftId),
      },
      persisted: {
        // @ts-expect-error!
        id: EntitySchema.persist.text(),
      },
    });

    assertDescriptorCompatibility({
      fields: {
        maybeName: Schema.OptionFromUndefinedOr(Schema.String),
      },
      persisted: {
        // @ts-expect-error!
        maybeName: EntitySchema.persist.text(),
      },
    });

    assertDescriptorCompatibility({
      fields: {
        maybeName: Schema.OptionFromOptionalKey(Schema.String),
      },
      persisted: {
        // @ts-expect-error!
        maybeName: EntitySchema.persist.text(),
      },
    });

    assertDescriptorCompatibility({
      fields: {
        maybeName: Schema.OptionFromOptional(Schema.String),
      },
      persisted: {
        // @ts-expect-error!
        maybeName: EntitySchema.persist.text(),
      },
    });

    assertDescriptorCompatibility({
      fields: {
        maybeName: Schema.OptionFromNullishOr(Schema.String),
      },
      persisted: {
        // @ts-expect-error!
        maybeName: EntitySchema.persist.text(),
      },
    });

    assertDescriptorCompatibility({
      fields: {
        maybeName: Schema.OptionFromOptionalNullOr(Schema.String),
      },
      persisted: {
        // @ts-expect-error!
        maybeName: EntitySchema.persist.text(),
      },
    });

    assertDescriptorCompatibility({
      fields: {
        metadata: Schema.Record(Schema.String, Schema.Unknown),
      },
      persisted: {
        // @ts-expect-error!
        metadata: EntitySchema.persist.jsonb(),
      },
    });

    assertDescriptorCompatibility({
      fields: {
        name: Schema.String,
      },
      persisted: {
        // @ts-expect-error!
        name: EntitySchema.persist.jsonb(),
      },
    });

    assertDescriptorCompatibility({
      fields: {
        name: Schema.String,
      },
      persisted: {
        name: EntitySchema.persist.text(),
        // @ts-expect-error!
        drifted: EntitySchema.persist.text(),
      },
    });

    assertDescriptorCompatibility({
      fields: {
        age: Schema.Int,
        name: Schema.String,
      },
      // @ts-expect-error!
      persisted: {
        name: EntitySchema.persist.text(),
      },
    });
  });
});
