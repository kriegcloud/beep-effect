import { DomainModel, Errors } from "@beep/shared-domain";
import { describe, expect, it } from "vitest";

describe("@beep/shared-domain", () => {
  it("exports the canonical domain model default fields", () => {
    expect(Object.keys(DomainModel.defaultFields)).toEqual([
      "createdAt",
      "updatedAt",
      "deletedAt",
      "createdBy",
      "updatedBy",
      "deletedBy",
      "version",
      "source",
    ]);
  });

  it("exports canonical postgres error-code lookups", () => {
    expect(Errors.uniqueViolation).toBe("23505");
    expect(Errors.ErrorCodeFromKey.Enum.UNIQUE_VIOLATION).toBe("23505");
    expect(Errors.ErrorCodeFromKey.To.Enum["23505"]).toBe("UNIQUE_VIOLATION");
  });
});
