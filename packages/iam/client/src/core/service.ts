import { $IamClientId } from "@beep/identity/packages";
import { makeAtomRuntime } from "@beep/runtime-client";
import * as Effect from "effect/Effect";

import * as GetSession from "./get-session";
import * as SignOut from "./sign-out";


const $I = $IamClientId.create("core/service");

export class CoreService extends Effect.Service<CoreService>()($I`CoreService`, {
  accessors: true,
  effect: Effect.succeed({
    getSession: GetSession.Handler,
    signOut: SignOut.Handler,
  }),
}) {}

const layer = CoreService.Default;

export const coreRuntime = makeAtomRuntime(() => layer);
