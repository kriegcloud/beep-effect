import * as WorkPriority from "@beep/architecture-lab-domain/values/WorkPriority";
import { expect } from "tstyche";

expect(WorkPriority.defaultWorkPriority).type.toBe<WorkPriority.WorkPriority>();
expect(WorkPriority.WorkPriority.Enum.high).type.toBe<"high">();
