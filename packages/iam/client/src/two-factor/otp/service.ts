/**
 * @fileoverview
 * Effect service providing OTP handlers via dependency injection.
 *
 * @module @beep/iam-client/two-factor/otp/service
 * @category TwoFactor/OTP
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Group, layer } from "./layer.ts";

const $I = $IamClientId.create("two-factor/otp/service");

/**
 * Effect service exposing OTP handlers.
 *
 * @category TwoFactor/OTP
 * @since 0.1.0
 */
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("Send", "Verify"),
}) {}

/**
 * Atom runtime configured with OTP service layer and dependencies.
 *
 * @category TwoFactor/OTP
 * @since 0.1.0
 */
export const runtime = Common.makeAtomRuntime(Service.Default.pipe(Layer.provide(layer)));
