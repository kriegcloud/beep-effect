import { $IamClientId } from "@beep/identity/packages";
import { makeAtomRuntime } from "@beep/runtime-client";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import * as Email from "./email";

const $I = $IamClientId.create("sign-in/service");

export class SignInService extends Effect.Service<SignInService>()($I`SignInService`, {
  accessors: true,
  effect: Effect.succeed({
    email: Email.Handler,
  }),
}) {}

const layer = SignInService.Default;

export const signInRuntime = makeAtomRuntime(() => Layer.mergeAll(layer));
