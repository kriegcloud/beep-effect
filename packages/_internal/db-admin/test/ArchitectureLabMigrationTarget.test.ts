import { ArchitectureLabMigrationTarget, DbAdminMigrationTargets } from "@beep/db-admin";
import { describe, expect, it } from "@effect/vitest";

describe("db-admin migration targets", () => {
  it("registers the architecture lab WorkItem and Worker tables", () => {
    expect(DbAdminMigrationTargets).toContain(ArchitectureLabMigrationTarget);
    expect(ArchitectureLabMigrationTarget.tables).toContain("architecture_lab_work_item");
    expect(ArchitectureLabMigrationTarget.tables).toContain("architecture_lab_worker");
  });
});
