import { WorkItemPublicConfig } from "@beep/architecture-lab-config/public";
import { expect } from "tstyche";

expect(
  WorkItemPublicConfig.make({
    assignmentEnabled: true,
    reopenCompletedEnabled: true,
  })
).type.toBe<WorkItemPublicConfig>();
