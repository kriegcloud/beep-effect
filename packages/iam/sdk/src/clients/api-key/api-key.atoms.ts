import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { ApiKeyService } from "./api-key.service";

export const apiKeyRuntime = makeAtomRuntime(ApiKeyService.Live);
