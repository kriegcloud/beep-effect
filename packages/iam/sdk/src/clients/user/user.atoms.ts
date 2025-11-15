import { UserService } from "@beep/iam-sdk/clients/user/user.service";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";

export const userRuntime = makeAtomRuntime(UserService.Live);
