import { workerTable } from "@beep/architecture-lab-tables/entities/Worker";
import { expect } from "tstyche";

expect(workerTable.id.name).type.toBe<string>();
