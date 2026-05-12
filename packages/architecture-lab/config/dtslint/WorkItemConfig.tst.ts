import { WorkItemPublicConfig } from "@beep/architecture-lab-config/public";
import { expect } from "tstyche";

expect(
  new WorkItemPublicConfig({
    assignmentEnabled: true,
    reopenCompletedEnabled: true,
  })
).type.toBe<WorkItemPublicConfig>();
