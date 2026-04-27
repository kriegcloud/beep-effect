import { $SharedDomainId } from "@beep/identity/packages";
import * as BaseEntity from "@beep/shared-domain/entity/BaseEntity";
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
import { bigint, boolean, bytea, integer, jsonb, pgTable, serial, text } from "drizzle-orm/pg-core";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import * as Table from "../src/table/Table.ts";

const $I = $SharedDomainId.create("tables/dtslint/Table");

const ProvenanceMixin = EntityMixin.make($I`ProvenanceMixin`)(
  {
    attributedToPrincipal: Principal,
    sourceActivityId: S.OptionFromOptionalKey(Shared.ActivityId),
  },
  {
    description: "Type-test provenance fields.",
    fields: {
      attributedToPrincipal: {
        columnName: "attributed_to_principal",
        description: "Principal associated with the entity.",
        nullable: false,
        storageKind: "principal",
        valueStrategy: "providedByContext",
      },
      sourceActivityId: {
        columnName: "source_activity_id",
        description: "Activity that produced the entity.",
        nullable: true,
        storageKind: "entityId",
        valueStrategy: "provided",
      },
    },
  }
);

const LifecycleMixin = EntityMixin.make($I`LifecycleMixin`)(
  {
    archivedAt: S.OptionFromOptionalKey(S.Number),
    lifecycleState: S.Literals(["Active", "Archived"]),
  },
  {
    description: "Type-test lifecycle fields.",
    fields: {
      archivedAt: {
        columnName: "archived_at",
        description: "Epoch-millis archive timestamp.",
        nullable: true,
        storageKind: "timestampMillis",
        valueStrategy: "updatedOnWrite",
      },
      lifecycleState: {
        columnName: "lifecycle_state",
        description: "Lifecycle state.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
    },
  }
);

const BitemporalMixin = EntityMixin.make($I`BitemporalMixin`)(
  {
    validFrom: S.Number,
    validTo: S.OptionFromOptionalKey(S.Number),
  },
  {
    description: "Type-test bitemporal fields.",
    fields: {
      validFrom: {
        columnName: "valid_from",
        description: "Epoch-millis valid-from timestamp.",
        nullable: false,
        storageKind: "timestampMillis",
        valueStrategy: "provided",
      },
      validTo: {
        columnName: "valid_to",
        description: "Epoch-millis valid-to timestamp.",
        nullable: true,
        storageKind: "timestampMillis",
        valueStrategy: "provided",
      },
    },
  }
);

const SyncMixin = EntityMixin.make($I`SyncMixin`)(
  {
    relatedEntity: EntityRef,
    replicaId: S.String,
    syncClock: HybridLogicalClock,
    vectorClock: VectorClock,
  },
  {
    description: "Type-test sync fields.",
    fields: {
      relatedEntity: {
        columnName: "related_entity",
        description: "Related polymorphic entity reference.",
        nullable: false,
        storageKind: "entityRef",
        valueStrategy: "provided",
      },
      replicaId: {
        columnName: "replica_id",
        description: "Replica identifier.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "providedByContext",
      },
      syncClock: {
        columnName: "sync_clock",
        description: "Hybrid logical clock.",
        nullable: false,
        storageKind: "hybridLogicalClock",
        valueStrategy: "updatedOnWrite",
      },
      vectorClock: {
        columnName: "vector_clock",
        description: "Vector clock payload.",
        nullable: false,
        storageKind: "vectorClock",
        valueStrategy: "updatedOnWrite",
      },
    },
  }
);

const IntegrityMixin = EntityMixin.make($I`IntegrityMixin`)(
  {
    contentHash: Sha256,
    integrityPayload: S.Record(S.String, S.Unknown),
    signature: Ed25519Signature,
  },
  {
    description: "Type-test integrity fields.",
    fields: {
      contentHash: {
        columnName: "content_hash",
        description: "SHA-256 content hash.",
        nullable: false,
        storageKind: "sha256",
        valueStrategy: "computedByService",
      },
      integrityPayload: {
        columnName: "integrity_payload",
        description: "Integrity payload.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "computedByService",
      },
      signature: {
        columnName: "signature",
        description: "Ed25519 signature.",
        nullable: false,
        storageKind: "signature",
        valueStrategy: "computedByService",
      },
    },
  }
);

const EncryptionMixin = EntityMixin.make($I`EncryptionMixin`)(
  {
    encrypted: S.Boolean,
    encryptedPayload: S.Uint8Array,
    encryptionKeyId: EncryptionKeyId,
    notes: S.OptionFromOptionalKey(S.String),
  },
  {
    description: "Type-test encryption fields.",
    fields: {
      encrypted: {
        columnName: "encrypted",
        description: "Whether the payload is encrypted.",
        nullable: false,
        storageKind: "bool",
        valueStrategy: "provided",
      },
      encryptedPayload: {
        columnName: "encrypted_payload",
        description: "Encrypted binary payload.",
        nullable: false,
        storageKind: "blob",
        valueStrategy: "provided",
      },
      encryptionKeyId: {
        columnName: "encryption_key_id",
        description: "Encryption key id.",
        nullable: false,
        storageKind: "encryptionKeyId",
        valueStrategy: "provided",
      },
      notes: {
        columnName: "notes",
        description: "Nullable plaintext notes.",
        nullable: true,
        storageKind: "text",
        valueStrategy: "provided",
      },
    },
  }
);

const EveryMixin = EntityMixin.pack(
  ProvenanceMixin,
  LifecycleMixin,
  BitemporalMixin,
  SyncMixin,
  IntegrityMixin,
  EncryptionMixin
);

const FullFieldMap = BaseEntity.fieldMapFor(Shared.OrganizationId, EveryMixin);

class FullEntity extends BaseEntity.BaseEntity.extend<FullEntity>($I`FullEntity`)(
  Shared.OrganizationId,
  EveryMixin,
  {
    displayName: S.String,
  },
  $I.annote("FullEntity", {
    description: "BaseEntity type-test model that consumes every v1 mixin category.",
  })
) {}

const DerivedTable = Table.make(Shared.OrganizationId, EveryMixin);

const ManualColumnBuilders = {
  archivedAt: bigint("archived_at", { mode: "number" }),
  attributedToPrincipal: jsonb("attributed_to_principal").notNull(),
  contentHash: text("content_hash").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  createdByPrincipal: jsonb("created_by_principal").notNull(),
  encrypted: boolean("encrypted").notNull(),
  encryptedPayload: bytea("encrypted_payload").notNull(),
  encryptionKeyId: text("encryption_key_id").notNull(),
  entityType: text("entity_type").notNull(),
  id: serial("id").primaryKey(),
  integrityPayload: jsonb("integrity_payload").notNull(),
  lifecycleState: text("lifecycle_state").notNull(),
  notes: text("notes"),
  orgId: integer("org_id").notNull(),
  relatedEntity: jsonb("related_entity").notNull(),
  replicaId: text("replica_id").notNull(),
  rowVersion: integer("row_version").notNull(),
  schemaVersion: text("schema_version").notNull(),
  signature: text("signature").notNull(),
  source: text("source").notNull(),
  sourceActivityId: integer("source_activity_id"),
  syncClock: text("sync_clock").notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  updatedByPrincipal: jsonb("updated_by_principal").notNull(),
  validFrom: bigint("valid_from", { mode: "number" }).notNull(),
  validTo: bigint("valid_to", { mode: "number" }),
  vectorClock: jsonb("vector_clock").notNull(),
};

const ManualTable = pgTable("shared_organization", ManualColumnBuilders);

type DerivedColumnBuilders = Table.ColumnBuilderMapFor<typeof FullFieldMap>;
type AnyEntityIdDescriptor = Extract<
  EntityMixin.FieldDescriptorByValueStrategy<EntityMixin.FieldDescriptor>,
  { readonly storageKind: "entityId" }
>;
type GeneratedEntityIdDescriptor = Extract<AnyEntityIdDescriptor, { readonly valueStrategy: "generatedOnInsert" }>;

describe("Table.make", () => {
  it("preserves BaseEntity and mixin descriptor literals before table derivation", () => {
    expect<typeof FullEntity.definition.fieldMap.id.storageKind>().type.toBe<"entityId">();
    expect<typeof FullEntity.definition.fieldMap.entityType.storageKind>().type.toBe<"literal">();
    expect<typeof FullEntity.definition.fieldMap.encryptedPayload.storageKind>().type.toBe<"blob">();
    expect<typeof FullEntity.definition.fieldMap.createdAt.columnName>().type.toBe<"created_at">();
    expect<typeof FullEntity.definition.fieldMap.createdAt.nullable>().type.toBe<false>();
    expect<(typeof FullEntity.definition.fieldMap.entityType.indexHints)[0]["kind"]>().type.toBe<"btree">();
    expect<(typeof FullEntity.definition.fieldMap.entityType.indexHints)[1]["kind"]>().type.toBe<"lookup">();
    expect<typeof FullEntity.definition.fieldMap.notes.columnName>().type.toBe<"notes">();
    expect<typeof FullEntity.definition.fieldMap.notes.nullable>().type.toBe<true>();
    expect<typeof FullFieldMap.sourceActivityId.columnName>().type.toBe<"source_activity_id">();
    expect<typeof FullFieldMap.sourceActivityId.nullable>().type.toBe<true>();
    expect<typeof FullFieldMap.encryptedPayload.columnName>().type.toBe<"encrypted_payload">();
    expect<typeof FullFieldMap.encryptedPayload.nullable>().type.toBe<false>();
    expect<GeneratedEntityIdDescriptor["storageKind"]>().type.toBe<"entityId">();
    expect<GeneratedEntityIdDescriptor["valueStrategy"]>().type.toBe<"generatedOnInsert">();
  });

  it("preserves table metadata literals", () => {
    expect<typeof DerivedTable.definition.tableName>().type.toBe<"shared_organization">();
    expect<typeof DerivedTable.definition.entityId.entityType>().type.toBe<"SharedOrganization">();
    expect<typeof DerivedTable.definition.fieldMap.vectorClock.storageKind>().type.toBe<"vectorClock">();
  });

  it("derives the same pre-table Drizzle column builder types as manual builders", () => {
    expect<DerivedColumnBuilders["archivedAt"]>().type.toBe<typeof ManualColumnBuilders.archivedAt>();
    expect<DerivedColumnBuilders["attributedToPrincipal"]>().type.toBe<
      typeof ManualColumnBuilders.attributedToPrincipal
    >();
    expect<DerivedColumnBuilders["contentHash"]>().type.toBe<typeof ManualColumnBuilders.contentHash>();
    expect<DerivedColumnBuilders["createdAt"]>().type.toBe<typeof ManualColumnBuilders.createdAt>();
    expect<DerivedColumnBuilders["createdByPrincipal"]>().type.toBe<typeof ManualColumnBuilders.createdByPrincipal>();
    expect<DerivedColumnBuilders["encrypted"]>().type.toBe<typeof ManualColumnBuilders.encrypted>();
    expect<DerivedColumnBuilders["encryptedPayload"]>().type.toBe<typeof ManualColumnBuilders.encryptedPayload>();
    expect<DerivedColumnBuilders["encryptionKeyId"]>().type.toBe<typeof ManualColumnBuilders.encryptionKeyId>();
    expect<DerivedColumnBuilders["entityType"]>().type.toBe<typeof ManualColumnBuilders.entityType>();
    expect<DerivedColumnBuilders["id"]>().type.toBe<typeof ManualColumnBuilders.id>();
    expect<DerivedColumnBuilders["integrityPayload"]>().type.toBe<typeof ManualColumnBuilders.integrityPayload>();
    expect<DerivedColumnBuilders["lifecycleState"]>().type.toBe<typeof ManualColumnBuilders.lifecycleState>();
    expect<DerivedColumnBuilders["notes"]>().type.toBe<typeof ManualColumnBuilders.notes>();
    expect<DerivedColumnBuilders["orgId"]>().type.toBe<typeof ManualColumnBuilders.orgId>();
    expect<DerivedColumnBuilders["relatedEntity"]>().type.toBe<typeof ManualColumnBuilders.relatedEntity>();
    expect<DerivedColumnBuilders["replicaId"]>().type.toBe<typeof ManualColumnBuilders.replicaId>();
    expect<DerivedColumnBuilders["rowVersion"]>().type.toBe<typeof ManualColumnBuilders.rowVersion>();
    expect<DerivedColumnBuilders["schemaVersion"]>().type.toBe<typeof ManualColumnBuilders.schemaVersion>();
    expect<DerivedColumnBuilders["signature"]>().type.toBe<typeof ManualColumnBuilders.signature>();
    expect<DerivedColumnBuilders["source"]>().type.toBe<typeof ManualColumnBuilders.source>();
    expect<DerivedColumnBuilders["sourceActivityId"]>().type.toBe<typeof ManualColumnBuilders.sourceActivityId>();
    expect<DerivedColumnBuilders["syncClock"]>().type.toBe<typeof ManualColumnBuilders.syncClock>();
    expect<DerivedColumnBuilders["updatedAt"]>().type.toBe<typeof ManualColumnBuilders.updatedAt>();
    expect<DerivedColumnBuilders["updatedByPrincipal"]>().type.toBe<typeof ManualColumnBuilders.updatedByPrincipal>();
    expect<DerivedColumnBuilders["validFrom"]>().type.toBe<typeof ManualColumnBuilders.validFrom>();
    expect<DerivedColumnBuilders["validTo"]>().type.toBe<typeof ManualColumnBuilders.validTo>();
    expect<DerivedColumnBuilders["vectorClock"]>().type.toBe<typeof ManualColumnBuilders.vectorClock>();
  });

  it("derives the same select and insert models as a manual Drizzle table", () => {
    expect<typeof DerivedTable.$inferSelect>().type.toBe<typeof ManualTable.$inferSelect>();
    expect<typeof DerivedTable.$inferInsert>().type.toBe<typeof ManualTable.$inferInsert>();
  });

  it("derives the same BaseEntity Drizzle column types as a manual table", () => {
    expect<typeof DerivedTable.id>().type.toBe<typeof ManualTable.id>();
    expect<typeof DerivedTable.entityType>().type.toBe<typeof ManualTable.entityType>();
    expect<typeof DerivedTable.createdAt>().type.toBe<typeof ManualTable.createdAt>();
    expect<typeof DerivedTable.createdByPrincipal>().type.toBe<typeof ManualTable.createdByPrincipal>();
    expect<typeof DerivedTable.orgId>().type.toBe<typeof ManualTable.orgId>();
    expect<typeof DerivedTable.rowVersion>().type.toBe<typeof ManualTable.rowVersion>();
    expect<typeof DerivedTable.schemaVersion>().type.toBe<typeof ManualTable.schemaVersion>();
    expect<typeof DerivedTable.source>().type.toBe<typeof ManualTable.source>();
    expect<typeof DerivedTable.updatedAt>().type.toBe<typeof ManualTable.updatedAt>();
    expect<typeof DerivedTable.updatedByPrincipal>().type.toBe<typeof ManualTable.updatedByPrincipal>();
  });

  it("derives the same mixin Drizzle column types as a manual table", () => {
    expect<typeof DerivedTable.archivedAt>().type.toBe<typeof ManualTable.archivedAt>();
    expect<typeof DerivedTable.attributedToPrincipal>().type.toBe<typeof ManualTable.attributedToPrincipal>();
    expect<typeof DerivedTable.contentHash>().type.toBe<typeof ManualTable.contentHash>();
    expect<typeof DerivedTable.encrypted>().type.toBe<typeof ManualTable.encrypted>();
    expect<typeof DerivedTable.encryptedPayload>().type.toBe<typeof ManualTable.encryptedPayload>();
    expect<typeof DerivedTable.encryptionKeyId>().type.toBe<typeof ManualTable.encryptionKeyId>();
    expect<typeof DerivedTable.integrityPayload>().type.toBe<typeof ManualTable.integrityPayload>();
    expect<typeof DerivedTable.lifecycleState>().type.toBe<typeof ManualTable.lifecycleState>();
    expect<typeof DerivedTable.notes>().type.toBe<typeof ManualTable.notes>();
    expect<typeof DerivedTable.relatedEntity>().type.toBe<typeof ManualTable.relatedEntity>();
    expect<typeof DerivedTable.replicaId>().type.toBe<typeof ManualTable.replicaId>();
    expect<typeof DerivedTable.signature>().type.toBe<typeof ManualTable.signature>();
    expect<typeof DerivedTable.sourceActivityId>().type.toBe<typeof ManualTable.sourceActivityId>();
    expect<typeof DerivedTable.syncClock>().type.toBe<typeof ManualTable.syncClock>();
    expect<typeof DerivedTable.validFrom>().type.toBe<typeof ManualTable.validFrom>();
    expect<typeof DerivedTable.validTo>().type.toBe<typeof ManualTable.validTo>();
    expect<typeof DerivedTable.vectorClock>().type.toBe<typeof ManualTable.vectorClock>();
  });
});
