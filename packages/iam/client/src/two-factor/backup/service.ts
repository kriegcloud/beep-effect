/**
 * @fileoverview
 * Effect service providing backup handlers via dependency injection.
 *
 * @module @beep/iam-client/two-factor/backup/service
 * @category TwoFactor/Backup
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Group, layer } from "./layer.ts";

const $I = $IamClientId.create("two-factor/backup/service");

/**
 * Effect service exposing backup handlers.
 *
 * @category TwoFactor/Backup
 * @since 0.1.0
 */
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("Generate", "Verify"),
}) {}

/**
 * Atom runtime configured with backup service layer and dependencies.
 *
 * @category TwoFactor/Backup
 * @since 0.1.0
 */
export const runtime = Common.makeAtomRuntime(Service.Default.pipe(Layer.provide(layer)));
