import { makeAtomRuntime } from "@beep/runtime-client/runtime";
import { MultiSessionService } from "./multi-session.service";

export const multiSessionRuntime = makeAtomRuntime(MultiSessionService.Live);
