import { DbAdminMigrationTargets } from "@beep/db-admin";
import { describe, expect, it } from "@effect/vitest";

describe("@beep/db-admin", () => {
  it("exports migration targets", () => {
    expect(DbAdminMigrationTargets.length).toBeGreaterThan(0);
  });
});
