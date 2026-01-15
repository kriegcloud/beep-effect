import { $IamClientId } from "@beep/identity/packages";
import { makeAtomRuntime } from "@beep/runtime-client";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import * as Email from "./email";

const $I = $IamClientId.create("sign-up/service");

export class SignUpService extends Effect.Service<SignUpService>()($I`SignUpService`, {
  accessors: true,
  effect: Effect.succeed({
    email: Email.Handler,
  }),
}) {}

const layer = SignUpService.Default;

export const signUpRuntime = makeAtomRuntime(() => Layer.mergeAll(layer));
