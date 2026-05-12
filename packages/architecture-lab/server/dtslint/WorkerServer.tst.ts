import { WorkerServer } from "@beep/architecture-lab-server/entities/Worker";
import { expect } from "tstyche";

expect(WorkerServer).type.not.toBe<never>();
