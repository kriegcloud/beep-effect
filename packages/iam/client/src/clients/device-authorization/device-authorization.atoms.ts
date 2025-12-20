import { makeAtomRuntime } from "@beep/runtime-client/runtime";
import { DeviceAuthorizationService } from "./device-authorization.service";

export const deviceAuthorizationRuntime = makeAtomRuntime(DeviceAuthorizationService.Live);
