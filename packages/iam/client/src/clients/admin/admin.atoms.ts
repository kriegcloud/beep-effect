import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { AdminService } from "./admin.service";

export const adminRuntime = makeAtomRuntime(AdminService.Live);
