import { WorkItemSummaryViewModel } from "@beep/architecture-lab-ui/aggregates/WorkItem";
import { expect } from "tstyche";

expect(WorkItemSummaryViewModel).type.not.toBe<never>();
