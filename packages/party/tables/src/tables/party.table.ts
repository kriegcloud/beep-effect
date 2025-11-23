// import type { SharedEntityIds } from "@beep/shared-domain";
import { TaskEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";

// import * as pg from "drizzle-orm/pg-core";

export const party = OrgTable.make(TaskEntityIds.TodoId)({});
