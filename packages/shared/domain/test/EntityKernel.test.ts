import { $SharedDomainId } from "@beep/identity/packages";
import * as Model from "@beep/schema/Model";
import * as VariantSchema from "@beep/schema/VariantSchema";
import * as BaseEntity from "@beep/shared-domain/entity/BaseEntity";
import * as EntityId from "@beep/shared-domain/entity/EntityId";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as EntityRef from "@beep/shared-domain/entity/EntityRef";
import * as EntityBarrel from "@beep/shared-domain/entity/index";
import * as Principal from "@beep/shared-domain/entity/Principal";
import * as primitives from "@beep/shared-domain/entity/primitives";
import * as SourceKind from "@beep/shared-domain/entity/SourceKind";
import * as Shared from "@beep/shared-domain/identity/Shared";
import { describe, expect, it } from "@effect/vitest";
import { cast } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity/test/EntityKernel");
const makeSharedId = EntityId.factory("shared", $I);
const DocumentId = makeSharedId("document");
const { Struct: VariantStruct } = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select",
});
const CustomDocumentId = makeSharedId("document", {
  brand: "CustomDocumentId",
  description: "Custom document id.",
  entityType: "CustomDocument",
  resource: "custom.document",
  tableName: "custom_document",
});

const decodeSync = <A>(schema: S.Top & { readonly Type: A }) => S.decodeUnknownSync(S.make<S.Decoder<A>>(schema.ast));

const NoteMixin = EntityMixin.make($I`NoteMixin`)(
  {
    note: S.String,
  },
  {
    description: "Adds note text.",
    fields: {
      note: {
        columnName: "note",
        description: "Note text.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
    },
  }
);

const OptionalMixin = EntityMixin.make($I`OptionalMixin`)(
  {
    optionalNote: S.OptionFromOptionalKey(S.String),
  },
  {
    description: "Adds optional note text.",
    fields: {
      optionalNote: {
        columnName: "optional_note",
        description: "Optional note text.",
        indexHints: [EntityMixin.IndexHint.lookup],
        nullable: true,
        storageKind: "text",
        valueStrategy: "provided",
      },
    },
  }
);

const ReplacementNoteMixin = EntityMixin.make($I`ReplacementNoteMixin`)(
  {
    note: EntityMixin.Override(S.Number, "Replace note with a numeric score."),
  },
  {
    description: "Overrides note text.",
    fields: {
      note: {
        columnName: "note_score",
        description: "Note score.",
        nullable: false,
        storageKind: "int",
        valueStrategy: "computedByService",
      },
    },
  }
);

const NotePack = EntityMixin.pack(NoteMixin, OptionalMixin);

describe("EntityId", () => {
  it("decodes generated entity ids and rejects invalid ids", () => {
    const decode = S.decodeUnknownSync(EntityId.EntityIdValue);

    expect(decode(1)).toBe(1);
    expect(decode(2_147_483_647)).toBe(2_147_483_647);
    expect(() => decode(0)).toThrow();
    expect(() => decode(2_147_483_648)).toThrow();
    expect(() => decode(1.5)).toThrow();
  });

  it("derives default metadata and schema statics", () => {
    expect(DocumentId.slice).toBe("shared");
    expect(DocumentId.tableName).toBe("shared_document");
    expect(DocumentId.resource).toBe("shared.document");
    expect(DocumentId.entityType).toBe("SharedDocument");
    expect(DocumentId.brand).toBe("SharedDocumentId");
    expect(DocumentId.definition.description).toBe("SharedDocument entity identifier.");
    expect(DocumentId.equivalence(cast(1), cast(1))).toBe(true);
    expect(DocumentId.equivalence(cast(1), cast(2))).toBe(false);
    expect(decodeSync(DocumentId)(1)).toBe(1);
  });

  it("preserves explicit metadata overrides", () => {
    expect(CustomDocumentId.tableName).toBe("custom_document");
    expect(CustomDocumentId.resource).toBe("custom.document");
    expect(CustomDocumentId.entityType).toBe("CustomDocument");
    expect(CustomDocumentId.brand).toBe("CustomDocumentId");
    expect(CustomDocumentId.definition.overrides.description).toBe("Custom document id.");
  });

  it("supports data-first and data-last factories", () => {
    const dataFirst = EntityId.factory("shared", $I)("task");
    const dataLast = EntityId.factory($I)("shared")("task");

    expect(dataFirst.tableName).toBe("shared_task");
    expect(dataLast.tableName).toBe("shared_task");
  });
});

describe("EntityMixin", () => {
  it("exports literal vocabularies and descriptor statics", () => {
    const descriptor = S.decodeUnknownSync(EntityMixin.FieldDescriptor)({
      columnName: "document_id",
      description: "Document id.",
      key: "documentId",
      nullable: false,
      storageKind: "entityId",
      valueStrategy: "provided",
    });
    const descriptorInput = S.decodeUnknownSync(EntityMixin.FieldDescriptorInput)({
      columnName: "document_id",
      description: "Document id.",
      nullable: false,
      storageKind: "entityId",
      valueStrategy: "provided",
    });

    expect(EntityMixin.StorageKind.is.entityId("entityId")).toBe(true);
    expect(EntityMixin.ValueStrategy.is.provided("provided")).toBe(true);
    expect(EntityMixin.IndexHintKind.is.lookup("lookup")).toBe(true);
    expect(EntityMixin.FieldDescriptor.guards.entityId(descriptor)).toBe(true);
    expect(EntityMixin.FieldDescriptorInput.guards.entityId(descriptorInput)).toBe(true);
    expect(EntityMixin.FieldDescriptor.isAnyOf(["entityId"])(descriptor)).toBe(true);
  });

  it("materializes mixins, packs them in order, and supports guards", () => {
    const PlainNameMixin = EntityMixin.make("")(
      {
        plain: S.String,
      },
      {
        description: "Plain identifier mixin.",
        fields: {
          plain: {
            columnName: "plain",
            description: "Plain value.",
            nullable: false,
            storageKind: "text",
            valueStrategy: "provided",
          },
        },
      }
    );

    expect(EntityMixin.isMixin(NoteMixin)).toBe(true);
    expect(EntityMixin.isPack(NotePack)).toBe(true);
    expect(EntityMixin.isOverride(EntityMixin.Override(S.String, "test"))).toBe(true);
    expect(NoteMixin.name).toBe("NoteMixin");
    expect(PlainNameMixin.name).toBe("");
    expect(NoteMixin.fieldKeys).toEqual(["note"]);
    expect(NoteMixin.fieldMap.note.columnName).toBe("note");
    expect(NotePack.fieldKeys).toEqual(["note", "optionalNote"]);
    expect(NotePack.fieldMap.optionalNote.indexHints?.[0]?.kind).toBe("lookup");
  });

  it("packs empty mixins and preserves override behavior", () => {
    const empty = EntityMixin.pack();
    const overridden = EntityMixin.pack(NoteMixin, ReplacementNoteMixin);

    expect(empty.fieldKeys).toEqual([]);
    expect(empty.fields).toEqual({});
    expect(overridden.fieldKeys).toEqual(["note"]);
    expect(overridden.fields.note).toBe(S.Number);
    expect(overridden.fieldMap.note.columnName).toBe("note_score");
  });

  it("fails on field collisions and missing descriptors", () => {
    const DuplicateNoteMixin = EntityMixin.make($I`DuplicateNoteMixin`)(
      {
        note: S.String,
      },
      {
        description: "Duplicates note text.",
        fields: {
          note: {
            columnName: "duplicate_note",
            description: "Duplicate note text.",
            nullable: false,
            storageKind: "text",
            valueStrategy: "provided",
          },
        },
      }
    );
    const makeBrokenMixin = () =>
      EntityMixin.make($I`BrokenMixin`)(
        {
          missing: S.String,
        },
        {
          description: "Missing descriptor.",
          fields: {},
        } as EntityMixin.Definition<{ readonly missing: typeof S.String }>
      );

    expect(() => EntityMixin.pack(NoteMixin, DuplicateNoteMixin)).toThrow(EntityMixin.EntityMixinFieldCollisionError);
    expect(makeBrokenMixin).toThrow(EntityMixin.EntityMixinDescriptorMissingError);
  });
});

describe("BaseEntity", () => {
  it("exports default field descriptors and fieldMapFor output", () => {
    const map = BaseEntity.fieldMapFor(DocumentId);

    expect(BaseEntity.BaseEntity.definition.fieldMap.createdAt.columnName).toBe("created_at");
    expect(map.id.columnName).toBe("id");
    expect(map.id.valueStrategy).toBe("generatedOnInsert");
    expect(map.entityType.storageKind).toBe("literal");
    expect(map.createdByPrincipal.storageKind).toBe("principal");
  });

  it("extends without mixins and exposes generated variant statics", () => {
    const Document = BaseEntity.BaseEntity.extend<Document>($I`Document`)(
      DocumentId,
      {},
      $I.annote("Document", {
        description: "Document entity.",
      })
    );

    expect(Document.definition.entityId).toBe(DocumentId);
    expect(Document.definition.mixins.fieldKeys).toEqual([]);
    expect(Document.definition.fieldMap.id.description).toBe("Primary key for SharedDocument.");
    expect(Document.fields.id).toBe(DocumentId);
    expect(Document.fields.entityType).toBeDefined();
  });

  it("extends with mixins and empty variant structs", () => {
    const struct = VariantStruct({});

    const Document = BaseEntity.BaseEntity.extend<Document>($I`DocumentWithMixins`)(
      DocumentId,
      NotePack,
      struct,
      $I.annote("DocumentWithMixins", {
        description: "Document entity with mixins.",
      })
    );

    expect(Document.definition.mixins).toBe(NotePack);
    expect(Document.definition.fieldMap.note.columnName).toBe("note");
    expect(Document.fields.note).toBe(S.String);
  });

  it("rejects entity-specific fields without EntityMixin descriptor metadata", () => {
    const extendWithDirectFields = () =>
      BaseEntity.BaseEntity.extend<Document>($I`DocumentWithDirectFields`)(
        DocumentId,
        NotePack,
        {
          title: Model.GeneratedByApp(S.String),
        },
        $I.annote("DocumentWithDirectFields", {
          description: "Document entity with direct fields.",
        })
      );

    expect(extendWithDirectFields).toThrow(BaseEntity.EntitySpecificFieldsUnsupportedError);

    try {
      extendWithDirectFields();
    } catch (error) {
      if (S.is(BaseEntity.EntitySpecificFieldsUnsupportedError)(error)) {
        expect(error.message).toBe(
          "BaseEntity entity-specific fields are not persisted without EntityMixin descriptors: title. Define persisted fields through EntityMixin.make(...)."
        );
      }
    }
  });

  it("fails on mixin field collisions without explicit overrides", () => {
    const OrgIdMixin = EntityMixin.make($I`OrgIdMixin`)(
      {
        orgId: Shared.OrganizationId,
      },
      {
        description: "Conflicts with BaseEntity org id.",
        fields: {
          orgId: {
            columnName: "org_id_override",
            description: "Conflicting organization id.",
            nullable: false,
            storageKind: "entityId",
            valueStrategy: "provided",
          },
        },
      }
    );
    const collide = () =>
      BaseEntity.BaseEntity.extend($I`DocumentCollision`)(DocumentId, EntityMixin.pack(OrgIdMixin), {});

    expect(collide).toThrow(BaseEntity.FieldCollisionError);

    try {
      collide();
    } catch (error) {
      if (S.is(BaseEntity.FieldCollisionError)(error)) {
        expect(error.message).toBe(
          'BaseEntity field collision for "orgId" while merging EntityMixin fields. Use EntityMixin.Override to make it explicit.'
        );
      }
    }
  });
});

describe("EntityRef and shared entity primitives", () => {
  it("builds entity references and validates primitive schemas", () => {
    const id = S.decodeUnknownSync(EntityId.EntityIdValue)(1);
    const ref = EntityRef.make(DocumentId, cast(id));
    const dataLastRef = EntityRef.make(id)(DocumentId);

    expect(ref.entityType).toBe("SharedDocument");
    expect(dataLastRef.id).toBe(1);
    expect(S.decodeUnknownSync(EntityRef.EntityType)("SharedDocument")).toBe("SharedDocument");
    expect(S.decodeUnknownSync(primitives.Sha256)("a".repeat(64))).toBe("a".repeat(64));
    expect(S.decodeUnknownSync(primitives.Ed25519Signature)("signature")).toBe("signature");
    expect(S.decodeUnknownSync(primitives.EncryptionKeyId)("key")).toBe("key");
    expect(S.decodeUnknownSync(primitives.HybridLogicalClock)("clock")).toBe("clock");
    expect(S.decodeUnknownSync(primitives.VectorClock)({ replica: 1 })).toEqual({ replica: 1 });
  });

  it("decodes principals, source kinds, and barrel exports", () => {
    const user = decodeSync(Principal.UserPrincipal)({
      kind: "User",
      userId: 1,
    });
    const serviceAccount = decodeSync(Principal.ServiceAccountPrincipal)({
      kind: "ServiceAccount",
      serviceAccountId: 1,
    });
    const agent = decodeSync(Principal.AgentPrincipal)({
      agentId: 1,
      agentVersionId: 1,
      kind: "Agent",
      onBehalfOfUserId: 1,
    });
    const connector = decodeSync(Principal.ConnectorAccountPrincipal)({
      connectorAccountId: 1,
      kind: "ConnectorAccount",
    });
    const system = decodeSync(Principal.SystemPrincipal)({
      component: "Runtime",
      kind: "System",
    });
    const principal = decodeSync(Principal.Principal)({
      component: "Runtime",
      kind: "System",
    });

    expect(user.kind).toBe("User");
    expect(O.isNone(serviceAccount.onBehalfOfUserId)).toBe(true);
    expect(O.isNone(agent.onBehalfOfTeamId)).toBe(true);
    expect(O.isNone(connector.onBehalfOfUserId)).toBe(true);
    expect(system.component).toBe("Runtime");
    expect(S.is(Principal.SystemPrincipal)(principal)).toBe(true);
    expect(SourceKind.SourceKind.is.Agent("Agent")).toBe(true);
    expect(EntityBarrel.BaseEntity.BaseEntity).toBe(BaseEntity.BaseEntity);
    expect(EntityBarrel.EntityId.EntityIdValue).toBe(EntityId.EntityIdValue);
    expect(EntityBarrel.EntityMixin.TypeId).toBe(EntityMixin.TypeId);
    expect(EntityBarrel.EntityRef.EntityRef).toBe(EntityRef.EntityRef);
    expect(EntityBarrel.Principal.Principal).toBe(Principal.Principal);
    expect(EntityBarrel.primitives.VectorClock).toBe(primitives.VectorClock);
    expect(EntityBarrel.SourceKind.SourceKind).toBe(SourceKind.SourceKind);
  });
});
