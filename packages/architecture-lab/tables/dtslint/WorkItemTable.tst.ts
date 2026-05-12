import { workItemTable } from "@beep/architecture-lab-tables/aggregates/WorkItem";
import { expect } from "tstyche";

expect(workItemTable.id.name).type.toBe<string>();
