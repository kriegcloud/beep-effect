import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { OAuthService } from "./oauth.service";

export const oauthRuntime = makeAtomRuntime(OAuthService.Live);
