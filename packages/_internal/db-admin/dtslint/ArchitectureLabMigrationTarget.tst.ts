import { ArchitectureLabMigrationTarget } from "@beep/db-admin/migrations/ArchitectureLab";
import { expect } from "tstyche";

expect(ArchitectureLabMigrationTarget.name).type.toBe<string>();
