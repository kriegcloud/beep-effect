import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { OrganizationService } from "./organization.service";

export const organizationRuntime = makeAtomRuntime(OrganizationService.Live);
