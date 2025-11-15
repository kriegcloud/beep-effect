import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { TwoFactorService } from "./two-factor.service";

export const twoFactorRuntime = makeAtomRuntime(TwoFactorService.Live);
