import { makeAtomRuntime } from "@beep/runtime-client/runtime";
import { ApiKeyService } from "./api-key.service";

export const apiKeyRuntime = makeAtomRuntime(ApiKeyService.Live);
