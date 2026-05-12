import { makeWorkItemClient } from "@beep/architecture-lab-client/aggregates/WorkItem";
import { expect } from "tstyche";

expect(makeWorkItemClient).type.not.toBe<never>();
