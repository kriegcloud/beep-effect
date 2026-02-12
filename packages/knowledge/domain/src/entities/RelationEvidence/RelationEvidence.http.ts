import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, FindByIds, FindByRelationId, Get, SearchByText } from "./contracts";

export class Http extends HttpApiGroup.make("relation-evidence")
  .add(Get.Contract.Http)
  .add(FindByRelationId.Contract.Http)
  .add(FindByIds.Contract.Http)
  .add(SearchByText.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/relation-evidence") {}
