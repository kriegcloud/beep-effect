import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import {
  CountByOrganization,
  Delete,
  FindByEntityIds,
  FindByPredicate,
  FindBySourceIds,
  FindByTargetIds,
  Get,
} from "./contracts";

export class Http extends HttpApiGroup.make("relations")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .add(FindBySourceIds.Contract.Http)
  .add(FindByTargetIds.Contract.Http)
  .add(FindByEntityIds.Contract.Http)
  .add(FindByPredicate.Contract.Http)
  .add(CountByOrganization.Contract.Http)
  .prefix("/relations") {}
