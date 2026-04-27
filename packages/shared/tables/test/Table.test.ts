import { $SharedDomainId } from "@beep/identity/packages";
import * as EntityId from "@beep/shared-domain/entity/EntityId";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import { EntityRef } from "@beep/shared-domain/entity/EntityRef";
import { Principal } from "@beep/shared-domain/entity/Principal";
import {
  Ed25519Signature,
  EncryptionKeyId,
  HybridLogicalClock,
  Sha256,
  VectorClock,
} from "@beep/shared-domain/entity/primitives";
import * as Shared from "@beep/shared-domain/identity/Shared";
import * as Table from "@beep/shared-tables/table/Table";
import { describe, expect, it } from "@effect/vitest";
import { getTableColumns } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("tables/test/Table");
const makeSharedId = EntityId.factory("shared", $I);
const DocumentId = makeSharedId("document");

const StorageMixin = EntityMixin.make($I`StorageMixin`)(
  {
    blobValue: S.Uint8Array,
    boolValue: S.Boolean,
    computedEntityId: Shared.ActivityId,
    contextEntityId: Shared.AgentId,
    defaultedEntityId: Shared.AgentVersionId,
    derivedEntityId: Shared.TeamId,
    encryptedBy: EncryptionKeyId,
    entityRefValue: EntityRef,
    hashValue: Sha256,
    hlcValue: HybridLogicalClock,
    incrementedEntityId: Shared.ConnectorAccountId,
    intValue: S.Number,
    jsonValue: S.Record(S.String, S.Unknown),
    literalValue: S.Literal("Document"),
    principalValue: Principal,
    providedEntityId: Shared.UserId,
    semanticVersionValue: S.String,
    signatureValue: Ed25519Signature,
    textValue: S.String,
    timestampValue: S.Number,
    updatedEntityId: Shared.LocalMachineId,
    vectorClockValue: VectorClock,
  },
  {
    description: "Covers every storage kind used by Table.make.",
    fields: {
      blobValue: {
        columnName: "blob_value",
        description: "Binary value.",
        nullable: false,
        storageKind: "blob",
        valueStrategy: "provided",
      },
      boolValue: {
        columnName: "bool_value",
        description: "Boolean value.",
        nullable: false,
        storageKind: "bool",
        valueStrategy: "provided",
      },
      computedEntityId: {
        columnName: "computed_entity_id",
        description: "Computed entity id.",
        nullable: false,
        storageKind: "entityId",
        valueStrategy: "computedByService",
      },
      contextEntityId: {
        columnName: "context_entity_id",
        description: "Context entity id.",
        nullable: false,
        storageKind: "entityId",
        valueStrategy: "providedByContext",
      },
      defaultedEntityId: {
        columnName: "defaulted_entity_id",
        description: "Defaulted entity id.",
        nullable: false,
        storageKind: "entityId",
        valueStrategy: "defaultedOnInsert",
      },
      derivedEntityId: {
        columnName: "derived_entity_id",
        description: "Derived entity id.",
        nullable: false,
        storageKind: "entityId",
        valueStrategy: "derived",
      },
      encryptedBy: {
        columnName: "encrypted_by",
        description: "Encryption key.",
        nullable: false,
        storageKind: "encryptionKeyId",
        valueStrategy: "provided",
      },
      entityRefValue: {
        columnName: "entity_ref_value",
        description: "Entity reference.",
        nullable: false,
        storageKind: "entityRef",
        valueStrategy: "provided",
      },
      hashValue: {
        columnName: "hash_value",
        description: "Content hash.",
        nullable: false,
        storageKind: "sha256",
        valueStrategy: "computedByService",
      },
      hlcValue: {
        columnName: "hlc_value",
        description: "Hybrid logical clock.",
        nullable: false,
        storageKind: "hybridLogicalClock",
        valueStrategy: "updatedOnWrite",
      },
      incrementedEntityId: {
        columnName: "incremented_entity_id",
        description: "Incremented entity id.",
        nullable: false,
        storageKind: "entityId",
        valueStrategy: "incrementedOnWrite",
      },
      intValue: {
        columnName: "int_value",
        description: "Integer value.",
        nullable: false,
        storageKind: "int",
        valueStrategy: "provided",
      },
      jsonValue: {
        columnName: "json_value",
        description: "JSON value.",
        indexHints: [EntityMixin.IndexHint.gin],
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
      literalValue: {
        columnName: "literal_value",
        description: "Literal value.",
        indexHints: [
          EntityMixin.IndexHint.btree,
          EntityMixin.IndexHint.gin,
          EntityMixin.IndexHint.hash,
          EntityMixin.IndexHint.lookup,
          EntityMixin.IndexHint.unique,
        ],
        nullable: false,
        storageKind: "literal",
        valueStrategy: "derived",
      },
      principalValue: {
        columnName: "principal_value",
        description: "Principal value.",
        nullable: false,
        storageKind: "principal",
        valueStrategy: "providedByContext",
      },
      providedEntityId: {
        columnName: "provided_entity_id",
        description: "Provided entity id.",
        nullable: true,
        storageKind: "entityId",
        valueStrategy: "provided",
      },
      semanticVersionValue: {
        columnName: "semantic_version_value",
        description: "Semantic version.",
        nullable: false,
        storageKind: "semanticVersion",
        valueStrategy: "provided",
      },
      signatureValue: {
        columnName: "signature_value",
        description: "Signature value.",
        nullable: false,
        storageKind: "signature",
        valueStrategy: "computedByService",
      },
      textValue: {
        columnName: "text_value",
        description: "Text value.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      timestampValue: {
        columnName: "timestamp_value",
        description: "Timestamp value.",
        nullable: false,
        storageKind: "timestampMillis",
        valueStrategy: "updatedOnWrite",
      },
      updatedEntityId: {
        columnName: "updated_entity_id",
        description: "Updated entity id.",
        nullable: false,
        storageKind: "entityId",
        valueStrategy: "updatedOnWrite",
      },
      vectorClockValue: {
        columnName: "vector_clock_value",
        description: "Vector clock.",
        nullable: false,
        storageKind: "vectorClock",
        valueStrategy: "updatedOnWrite",
      },
    },
  }
);

const StoragePack = EntityMixin.pack(StorageMixin);

const indexConfigNamed = (name: string) => (table: ReturnType<typeof Table.make>) =>
  pipe(
    getTableConfig(table).indexes,
    A.findFirst((indexConfig) => indexConfig.config.name === name)
  );

describe("Table.make", () => {
  it("creates no-mixin PGLite/Postgres tables with shared entity metadata", () => {
    const table = Table.make(Shared.OrganizationId);
    const columns = getTableColumns(table);
    const config = getTableConfig(table);

    expect(table.definition.tableName).toBe("shared_organization");
    expect(table.definition.entityId).toBe(Shared.OrganizationId);
    expect(table.definition.fieldMap.id.columnName).toBe("id");
    expect(config.name).toBe("shared_organization");
    expect(columns.id.name).toBe("id");
    expect(columns.id.primary).toBe(true);
    expect(columns.id.hasDefault).toBe(true);
    expect(columns.id.columnType).toBe("PgSerial");
    expect(columns.entityType.name).toBe("entity_type");
    expect(columns.entityType.notNull).toBe(true);
    expect("literalValue" in columns).toBe(false);
  });

  it("maps every shared storage kind to the expected pg-core column", () => {
    const table = Table.make(DocumentId, StoragePack);
    const columns = getTableColumns(table);

    expect(columns.blobValue.columnType).toBe("PgBytea");
    expect(columns.boolValue.columnType).toBe("PgBoolean");
    expect(columns.computedEntityId.columnType).toBe("PgInteger");
    expect(columns.defaultedEntityId.columnType).toBe("PgInteger");
    expect(columns.derivedEntityId.columnType).toBe("PgInteger");
    expect(columns.incrementedEntityId.columnType).toBe("PgInteger");
    expect(columns.providedEntityId.columnType).toBe("PgInteger");
    expect(columns.contextEntityId.columnType).toBe("PgInteger");
    expect(columns.updatedEntityId.columnType).toBe("PgInteger");
    expect(columns.entityRefValue.columnType).toBe("PgJsonb");
    expect(columns.jsonValue.columnType).toBe("PgJsonb");
    expect(columns.principalValue.columnType).toBe("PgJsonb");
    expect(columns.vectorClockValue.columnType).toBe("PgJsonb");
    expect(columns.encryptedBy.columnType).toBe("PgText");
    expect(columns.hashValue.columnType).toBe("PgText");
    expect(columns.hlcValue.columnType).toBe("PgText");
    expect(columns.literalValue.columnType).toBe("PgText");
    expect(columns.semanticVersionValue.columnType).toBe("PgText");
    expect(columns.signatureValue.columnType).toBe("PgText");
    expect(columns.textValue.columnType).toBe("PgText");
    expect(columns.intValue.columnType).toBe("PgInteger");
    expect(columns.timestampValue.columnType).toBe("PgBigInt53");
  });

  it("preserves nullability and generated primary-key behavior", () => {
    const table = Table.make(DocumentId, StoragePack);
    const columns = getTableColumns(table);

    expect(columns.id.primary).toBe(true);
    expect(columns.id.notNull).toBe(true);
    expect(columns.id.hasDefault).toBe(true);
    expect(columns.providedEntityId.notNull).toBe(false);
    expect(columns.textValue.notNull).toBe(true);
    expect(columns.timestampValue.dataType).toBe("number int53");
  });

  it("builds configured indexes and unique indexes from descriptor hints", () => {
    const table = Table.make(DocumentId, StoragePack);
    const btreeIndex = indexConfigNamed("shared_document_literal_value_btree_idx")(table);
    const ginIndex = indexConfigNamed("shared_document_json_value_gin_idx")(table);
    const unsupportedGinIndex = indexConfigNamed("shared_document_literal_value_gin_idx")(table);
    const hashIndex = indexConfigNamed("shared_document_literal_value_hash_idx")(table);
    const lookupIndex = indexConfigNamed("shared_document_literal_value_lookup_idx")(table);
    const uniqueIndex = indexConfigNamed("shared_document_literal_value_unique_idx")(table);

    expect(O.getOrThrow(btreeIndex).config.method).toBe("btree");
    expect(O.getOrThrow(ginIndex).config.method).toBe("gin");
    expect(O.getOrThrow(hashIndex).config.method).toBe("hash");
    expect(O.isNone(unsupportedGinIndex)).toBe(true);
    expect(O.isNone(lookupIndex)).toBe(true);
    expect(O.getOrThrow(uniqueIndex).config.unique).toBe(true);
    expect(O.getOrThrow(uniqueIndex).config.columns[0]?.name).toBe("literal_value");
  });
});
