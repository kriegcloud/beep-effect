import { Entities, Errors } from "@beep/shared-domain";
import { describe, expect, it } from "vitest";

describe("@beep/shared-domain", () => {
  it("exports Organization with inherited domain model variants", () => {
    expect(Object.keys(Entities.Organization.Model.select.fields).sort()).toEqual([
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
    expect(Object.keys(Entities.Organization.Model.insert.fields).sort()).toEqual([
      "createdAt",
      "createdBy",
      "deletedAt",
      "deletedBy",
      "source",
      "updatedAt",
      "updatedBy",
    ]);
  });

  it("exports canonical postgres error-code lookups", () => {
    expect(Errors.uniqueViolation).toBe("23505");
    expect(Errors.ErrorCodeFromKey.Enum.UNIQUE_VIOLATION).toBe("23505");
    expect(Errors.ErrorCodeFromKey.To.Enum["23505"]).toBe("UNIQUE_VIOLATION");
  });
});
