import { makeAtomRuntime } from "@beep/runtime-client/runtime";
import { OAuthService } from "./oauth.service";

export const oauthRuntime = makeAtomRuntime(OAuthService.Live);
