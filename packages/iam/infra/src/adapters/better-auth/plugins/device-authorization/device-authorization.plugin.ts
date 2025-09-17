// import type {
//   DeviceAuthorizationOptions
// } from "./plugin-options";

import { deviceAuthorization } from "better-auth/plugins/device-authorization";
import * as Effect from "effect/Effect";

export type DeviceAuthorizationPluginEffect = Effect.Effect<ReturnType<typeof deviceAuthorization>, never, never>;
export type DeviceAuthorizationPlugin = Effect.Effect.Success<DeviceAuthorizationPluginEffect>;

export const deviceAuthorizationPlugin: DeviceAuthorizationPluginEffect = Effect.succeed(
  deviceAuthorization(
    // {} satisfies DeviceAuthorizationOptions
  )
);
