import { Workspace } from "@beep/shared-domain/identity";
import type { CandidateDraft, CandidateDraftTable, CandidateProject, CandidateProjectTable } from "./proof.ts";
import * as EntitySchema from "./entity-schema.ts";
import type * as S from "effect/Schema";
import * as Schema from "effect/Schema";
import type { Equals } from "effect/Types";

type Expect<T extends true> = T;

type IsFalse<T extends false> = T;

type EntityIdEncoded<Entity extends EntitySchema.EntityIdLike> = S.Codec.Encoded<Entity>;
type CandidateDraftIdEncoded = EntityIdEncoded<typeof Workspace.CandidateDraftId>;
type CandidateProjectIdEncoded = EntityIdEncoded<typeof Workspace.CandidateProjectId>;
type WorkspaceIdEncoded = EntityIdEncoded<typeof Workspace.WorkspaceId>;

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

export type CandidateDraftEncodedIsPersistenceShape = Expect<
  Equals<S.Codec.Encoded<typeof CandidateDraft>, ExpectedCandidateDraftEncoded>
>;

export type CandidateDraftDrizzleSelectIsEncodedShape = Expect<
  Equals<typeof CandidateDraftTable.$inferSelect, ExpectedCandidateDraftSelect>
>;

export type CandidateDraftParentIdIsNullableOnSelect = Expect<
  Equals<typeof CandidateDraftTable.$inferSelect["parentId"], WorkspaceIdEncoded | null>
>;

export type CandidateDraftDrizzleInsertRespectsGeneratedId = Expect<
  Equals<typeof CandidateDraftTable.$inferInsert, ExpectedCandidateDraftInsert>
>;

export type CandidateDraftTableNameComesFromEntityId = Expect<
  Equals<typeof CandidateDraft.definition.tableName, typeof Workspace.CandidateDraftId.tableName>
>;

export type IdentifierTableNameUsesTypedSnakeCase = Expect<
  Equals<typeof candidateDraftIdentifierTableName, "candidate_draft">
>;

export type DefaultColumnNameUsesTypedSnakeCase = Expect<Equals<typeof createdAtColumnName, "created_at">>;

export type ColumnNameOverrideKeepsLiteralType = Expect<Equals<typeof entityTypeColumnName, "entity_type">>;

export type CandidateDraftDecodedIdUsesDraftBrand = Expect<
  Equals<typeof CandidateDraft.Type.id, typeof Workspace.CandidateDraftId.Type>
>;

export type CandidateProjectEncodedIsPersistenceShape = Expect<
  Equals<S.Codec.Encoded<typeof CandidateProject>, ExpectedCandidateProjectEncoded>
>;

export type CandidateProjectDrizzleSelectIsEncodedShape = Expect<
  Equals<typeof CandidateProjectTable.$inferSelect, ExpectedCandidateProjectSelect>
>;

export type CandidateProjectDrizzleInsertRespectsGeneratedId = Expect<
  Equals<typeof CandidateProjectTable.$inferInsert, ExpectedCandidateProjectInsert>
>;

export type CandidateProjectTableNameComesFromEntityId = Expect<
  Equals<typeof CandidateProject.definition.tableName, typeof Workspace.CandidateProjectId.tableName>
>;

export type CandidateProjectDecodedIdUsesProjectBrand = Expect<
  Equals<typeof CandidateProject.Type.id, typeof Workspace.CandidateProjectId.Type>
>;

export type CandidateEntityDecodedIdsStayDistinct = IsFalse<
  Equals<typeof CandidateDraft.Type.id, typeof CandidateProject.Type.id>
>;

const assertDescriptorCompatibility = <
  const Fields extends EntitySchema.Fields,
  const Persisted extends EntitySchema.PersistedFor<Fields>,
>(
  _input: EntitySchema.ClassInput<Fields, Persisted>
) => undefined;

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

assertDescriptorCompatibility({
  fields: {
    name: Schema.String,
  },
  persisted: {
    // @ts-expect-error String encoded fields cannot be projected as integer storage.
    name: EntitySchema.persist.int(),
  },
});

assertDescriptorCompatibility({
  fields: {
    id: Workspace.CandidateDraftId,
  },
  persisted: {
    // @ts-expect-error Number-encoded entity ids cannot be projected as text storage.
    id: EntitySchema.persist.text(),
  },
});

assertDescriptorCompatibility({
  fields: {
    maybeName: Schema.OptionFromUndefinedOr(Schema.String),
  },
  persisted: {
    // @ts-expect-error Persisted row fields must encode absence as SQL null, not undefined.
    maybeName: EntitySchema.persist.text(),
  },
});

assertDescriptorCompatibility({
  fields: {
    maybeName: Schema.OptionFromNullishOr(Schema.String),
  },
  persisted: {
    // @ts-expect-error Persisted selected-row fields must not encode SQL absence as undefined.
    maybeName: EntitySchema.persist.text(),
  },
});

assertDescriptorCompatibility({
  fields: {
    maybeName: Schema.optionalKey(Schema.String),
  },
  persisted: {
    // @ts-expect-error Persisted selected-row fields cannot encode missing keys.
    maybeName: EntitySchema.persist.text(),
  },
});

assertDescriptorCompatibility({
  fields: {
    maybeName: Schema.optional(Schema.String),
  },
  persisted: {
    // @ts-expect-error Persisted selected-row fields cannot encode undefined or missing keys.
    maybeName: EntitySchema.persist.text(),
  },
});

assertDescriptorCompatibility({
  fields: {
    maybeName: Schema.OptionFromOptionalKey(Schema.String),
  },
  persisted: {
    // @ts-expect-error Persisted selected-row fields cannot encode missing keys.
    maybeName: EntitySchema.persist.text(),
  },
});

assertDescriptorCompatibility({
  fields: {
    maybeName: Schema.OptionFromOptional(Schema.String),
  },
  persisted: {
    // @ts-expect-error Persisted selected-row fields cannot encode undefined or missing keys.
    maybeName: EntitySchema.persist.text(),
  },
});

assertDescriptorCompatibility({
  fields: {
    maybeName: Schema.OptionFromOptionalNullOr(Schema.String),
  },
  persisted: {
    // @ts-expect-error Persisted selected-row fields cannot encode undefined or missing keys.
    maybeName: EntitySchema.persist.text(),
  },
});

assertDescriptorCompatibility({
  fields: {
    metadata: Schema.Record(Schema.String, Schema.Unknown),
  },
  persisted: {
    // @ts-expect-error Unknown records are not JSON-compatible enough for jsonb projection.
    metadata: EntitySchema.persist.jsonb(),
  },
});

assertDescriptorCompatibility({
  fields: {
    name: Schema.String,
  },
  persisted: {
    // @ts-expect-error Text fields must not use jsonb as a catch-all escape hatch.
    name: EntitySchema.persist.jsonb(),
  },
});

assertDescriptorCompatibility({
  fields: {
    name: Schema.String,
  },
  persisted: {
    name: EntitySchema.persist.text(),
    // @ts-expect-error Persisted maps cannot contain keys missing from fields.
    drifted: EntitySchema.persist.text(),
  },
});

assertDescriptorCompatibility({
  fields: {
    age: Schema.Int,
    name: Schema.String,
  },
  // @ts-expect-error Persisted maps must cover every field key.
  persisted: {
    name: EntitySchema.persist.text(),
  },
});
