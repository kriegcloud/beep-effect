import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { MultiSessionService } from "./multi-session.service";

export const multiSessionRuntime = makeAtomRuntime(MultiSessionService.Live);
