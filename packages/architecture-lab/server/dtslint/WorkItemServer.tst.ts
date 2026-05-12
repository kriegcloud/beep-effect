import { WorkItemServerLayer } from "@beep/architecture-lab-server/aggregates/WorkItem";
import { expect } from "tstyche";

expect(WorkItemServerLayer).type.not.toBe<never>();
