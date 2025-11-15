import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { DeviceAuthorizationService } from "./device-authorization.service";

export const deviceAuthorizationRuntime = makeAtomRuntime(DeviceAuthorizationService.Live);
