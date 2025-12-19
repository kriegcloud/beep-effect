import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { DeviceAuthorizationContractKit } from "./device-authorization.contracts";
import { deviceAuthorizationLayer } from "./device-authorization.implementations";

export class DeviceAuthorizationService extends Effect.Service<DeviceAuthorizationService>()(
  "@beep/iam-client/clients/device-authorization/DeviceAuthorizationService",
  {
    dependencies: [deviceAuthorizationLayer],
    accessors: true,
    effect: DeviceAuthorizationContractKit.liftService(),
  }
) {
  static readonly Live = DeviceAuthorizationService.Default.pipe(Layer.provide(deviceAuthorizationLayer));
}
