import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { OidcService } from "./oidc.service";

export const oidcRuntime = makeAtomRuntime(OidcService.Live);
