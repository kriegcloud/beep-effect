import { makeAtomRuntime } from "@beep/runtime-client/runtime";
import { OrganizationService } from "./organization.service";

export const organizationRuntime = makeAtomRuntime(OrganizationService.Live);
