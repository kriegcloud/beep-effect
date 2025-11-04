// import type {
//   DeviceAuthorizationOptions
// } from "./plugin-options";

import type { DeviceAuthorizationOptions } from "better-auth/plugins/device-authorization";
import { deviceAuthorization } from "better-auth/plugins/device-authorization";
import * as Effect from "effect/Effect";

export type DeviceAuthorizationPluginEffect = Effect.Effect<ReturnType<typeof deviceAuthorization>, never, never>;
export type DeviceAuthorizationPlugin = Effect.Effect.Success<DeviceAuthorizationPluginEffect>;

export const deviceAuthorizationPlugin: DeviceAuthorizationPluginEffect = Effect.succeed(
  deviceAuthorization({
    expiresIn: "3min",
    interval: "5s",
    deviceCodeLength: 40,
    userCodeLength: 8,
  } satisfies DeviceAuthorizationOptions)
);
