import { makeAtomRuntime } from "@beep/runtime-client/runtime";
import { AdminService } from "./admin.service";

export const adminRuntime = makeAtomRuntime(AdminService.Live);
