import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, FindByDocumentId, FindByEntityId, FindByIds, Get } from "./contracts";

export class Http extends HttpApiGroup.make("mentions")
  .add(Get.Contract.Http)
  .add(FindByEntityId.Contract.Http)
  .add(FindByIds.Contract.Http)
  .add(FindByDocumentId.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/mentions") {}
