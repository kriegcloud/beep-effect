import { $SharedDomainId } from "@beep/identity";
import * as M from "@beep/schema/Model";
import { Shared } from "../../entity-ids/index.ts";
import { DomainModel } from "../../factories/index.ts";

const $I = $SharedDomainId.create("entities/Organization/Organization.model");

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class Model extends DomainModel.make<Model>($I`OrganizationModel`)(
  {
    id: M.Generated(Shared.OrganizationId),
  },
  $I.annote("OrganizationModel", {
    description: "The Organization model",
  })
) {}
