import { makeAtomRuntime } from "@beep/runtime-client/runtime";
import { OidcService } from "./oidc.service";

export const oidcRuntime = makeAtomRuntime(OidcService.Live);
