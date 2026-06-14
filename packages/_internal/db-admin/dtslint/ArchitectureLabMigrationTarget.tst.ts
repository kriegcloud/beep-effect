import { ArchitectureLabMigrationTarget } from "@beep/db-admin/migrations/ArchitectureLab";
import { WorkspaceThreadMigrationTarget } from "@beep/db-admin/migrations/WorkspaceThread";
import { expect } from "tstyche";

expect(ArchitectureLabMigrationTarget.name).type.toBe<string>();
expect(WorkspaceThreadMigrationTarget.name).type.toBe<string>();
