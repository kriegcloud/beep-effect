import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { OrganizationContractKit } from "./organization.contracts";
import { organizationLayer } from "./organization.implementations";

export class OrganizationService extends Effect.Service<OrganizationService>()(
  "@beep/iam-sdk/clients/organization/OrganizationService",
  {
    dependencies: [organizationLayer],
    accessors: true,
    effect: OrganizationContractKit.liftService(),
  }
) {
  static readonly Live = OrganizationService.Default.pipe(Layer.provide(organizationLayer));
}
