import { NonNegativeInt } from "@beep/schema";
import { DomainModel, defaultFields } from "@beep/schema/DomainModel";
import * as Model from "@beep/schema/Model";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const EntityId = S.String.pipe(S.brand("EntityId"));

describe("DomainModel", () => {
  it("exports shared audit and bookkeeping defaults", () => {
    expect(Object.keys(defaultFields)).toEqual([
      "createdAt",
      "updatedAt",
      "deletedAt",
      "createdBy",
      "updatedBy",
      "deletedBy",
      "version",
      "source",
    ]);
    expect(defaultFields.createdAt).toBe(Model.DateTimeInsertFromNumber);
    expect(defaultFields.updatedAt).toBe(Model.DateTimeUpdateFromNumber);
    expect(defaultFields.version.schemas.select).toBe(NonNegativeInt);
  });

  it("acts as an extendable base without defining an id field", () => {
    class Entity extends DomainModel.extend<Entity, typeof DomainModel>("Entity")({
      id: Model.Generated(EntityId),
    }) {}

    expect(Object.keys(DomainModel.select.fields).sort()).toEqual([
      "createdAt",
      "createdBy",
      "deletedAt",
      "deletedBy",
      "source",
      "updatedAt",
      "updatedBy",
      "version",
    ]);
    expect(Object.keys(Entity.select.fields).sort()).toEqual([
      "createdAt",
      "createdBy",
      "deletedAt",
      "deletedBy",
      "id",
      "source",
      "updatedAt",
      "updatedBy",
      "version",
    ]);
    expect(Object.keys(Entity.insert.fields).sort()).toEqual([
      "createdAt",
      "createdBy",
      "deletedAt",
      "deletedBy",
      "source",
      "updatedAt",
      "updatedBy",
    ]);
    expect(Entity.select.fields.id).toBe(EntityId);
  });
});
