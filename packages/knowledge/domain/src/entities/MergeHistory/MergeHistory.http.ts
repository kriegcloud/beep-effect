import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, FindByOrganization, FindBySourceEntity, FindByTargetEntity, FindByUser, Get } from "./contracts";

export class Http extends HttpApiGroup.make("merge-history")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .add(FindByTargetEntity.Contract.Http)
  .add(FindBySourceEntity.Contract.Http)
  .add(FindByUser.Contract.Http)
  .add(FindByOrganization.Contract.Http)
  .prefix("/merge-history") {}
