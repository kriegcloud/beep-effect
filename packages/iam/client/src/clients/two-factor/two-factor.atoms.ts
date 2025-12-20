import { makeAtomRuntime } from "@beep/runtime-client/runtime";
import { TwoFactorService } from "./two-factor.service";

export const twoFactorRuntime = makeAtomRuntime(TwoFactorService.Live);
