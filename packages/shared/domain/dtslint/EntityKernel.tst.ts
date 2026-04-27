import { $SharedDomainId } from "@beep/identity/packages";
import * as Model from "@beep/schema/Model";
import * as DomainBarrel from "@beep/shared-domain";
import * as BaseEntity from "@beep/shared-domain/entity/BaseEntity";
import * as EntityId from "@beep/shared-domain/entity/EntityId";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as EntityRef from "@beep/shared-domain/entity/EntityRef";
import * as EntityBarrel from "@beep/shared-domain/entity/index";
import type * as Shared from "@beep/shared-domain/identity/Shared";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

const $I = $SharedDomainId.create("entity/dtslint/EntityKernel");
const makeSharedId = EntityId.factory("shared", $I);
const DocumentId = makeSharedId("document");
const CustomDocumentId = makeSharedId("document", {
  brand: "CustomDocumentId",
  entityType: "CustomDocument",
  resource: "custom.document",
  tableName: "custom_document",
});

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

const OverrideMixin = EntityMixin.make($I`OverrideMixin`)(
  {
    note: EntityMixin.Override(S.Number, "Numeric note score."),
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

const NotePack = EntityMixin.pack(NoteMixin);
const OverridePack = EntityMixin.pack(NoteMixin, OverrideMixin);
const documentFields = {};
const directDocumentFields = {
  title: Model.GeneratedByApp(S.String),
};
declare const documentIdValue: typeof DocumentId.Type;

class Document extends BaseEntity.BaseEntity.extend<Document>($I`Document`)(DocumentId, NotePack, documentFields) {}

// @ts-expect-error!
BaseEntity.BaseEntity.extend($I`DirectDocument`)(DocumentId, NotePack, directDocumentFields);

describe("shared entity kernel types", () => {
  it("preserves EntityId literals and statics", () => {
    expect<typeof DocumentId.tableName>().type.toBe<"shared_document">();
    expect<typeof DocumentId.resource>().type.toBe<"shared.document">();
    expect<typeof DocumentId.entityType>().type.toBe<"SharedDocument">();
    expect<typeof DocumentId.brand>().type.toBe<"SharedDocumentId">();
    expect<typeof DocumentId.definition.name>().type.toBe<"document">();
    expect<typeof DocumentId.equivalence>().type.toBe<
      (self: typeof DocumentId.Type, that: typeof DocumentId.Type) => boolean
    >();
    expect<typeof CustomDocumentId.tableName>().type.toBe<"custom_document">();
    expect<typeof CustomDocumentId.resource>().type.toBe<"custom.document">();
    expect<typeof CustomDocumentId.entityType>().type.toBe<"CustomDocument">();
    expect<typeof CustomDocumentId.brand>().type.toBe<"CustomDocumentId">();
    expect<typeof DocumentId.Type>().type.toBe<EntityId.EntityIdValueFor<"SharedDocumentId">>();
  });

  it("preserves EntityRef and BaseEntity field map types", () => {
    const ref = EntityRef.make(DocumentId, documentIdValue);
    const fieldMap = BaseEntity.fieldMapFor(DocumentId, NotePack);

    expect(ref).type.toBeAssignableTo<EntityRef.EntityRef>();
    expect<typeof fieldMap.id.storageKind>().type.toBe<"entityId">();
    expect<typeof fieldMap.entityType.storageKind>().type.toBe<"literal">();
    expect<typeof fieldMap.note.columnName>().type.toBe<"note">();
    expect<typeof fieldMap.note.nullable>().type.toBe<false>();
    expect<typeof Document.definition.entityId.tableName>().type.toBe<"shared_document">();
    expect<typeof Document.definition.fieldMap.note.storageKind>().type.toBe<"text">();
    expect<(typeof Document.definition.mixins.fieldKeys)[number]>().type.toBe<"note">();
    expect<EntityRef.EntityRefFor<typeof DocumentId>["id"]>().type.toBe<typeof DocumentId.Type>();
  });

  it("preserves mixin field maps and override typing", () => {
    expect<typeof NotePack.fields.note>().type.toBe<typeof S.String>();
    expect<typeof NotePack.fieldMap.note.columnName>().type.toBe<"note">();
    expect<typeof OverridePack.fields.note>().type.toBe<typeof S.Number>();
    expect<typeof OverridePack.fieldMap.note.columnName>().type.toBe<"note_score">();
    expect<typeof OverridePack.fieldMap.note.storageKind>().type.toBe<"int">();
  });

  it("keeps public barrel exports type-equivalent to module exports", () => {
    expect(EntityBarrel.BaseEntity.BaseEntity).type.toBe<typeof BaseEntity.BaseEntity>();
    expect(EntityBarrel.EntityId.EntityIdValue).type.toBe<typeof EntityId.EntityIdValue>();
    expect(EntityBarrel.EntityMixin.TypeId).type.toBe<typeof EntityMixin.TypeId>();
    expect(EntityBarrel.EntityRef.EntityRef).type.toBe<typeof EntityRef.EntityRef>();
    expect(DomainBarrel.Identity.Shared.OrganizationId).type.toBe<typeof Shared.OrganizationId>();
  });
});
