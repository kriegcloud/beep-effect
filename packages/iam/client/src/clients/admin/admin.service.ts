import { AdminContractKit } from "@beep/iam-client/clients/admin/admin.contracts";
import { adminLayer } from "@beep/iam-client/clients/admin/admin.implementations";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
export class AdminService extends Effect.Service<AdminService>()("@beep/iam-client/clients/admin/AdminService", {
  dependencies: [adminLayer],
  effect: AdminContractKit.liftService(),
  accessors: true,
}) {
  static readonly Live = AdminService.Default.pipe(Layer.provide(adminLayer));
}
