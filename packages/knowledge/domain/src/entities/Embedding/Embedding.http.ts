import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, DeleteByEntityIdPrefix, FindByCacheKey, FindByEntityType, FindSimilar, Get } from "./contracts";

export class Http extends HttpApiGroup.make("embeddings")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .add(FindByCacheKey.Contract.Http)
  .add(FindSimilar.Contract.Http)
  .add(FindByEntityType.Contract.Http)
  .add(DeleteByEntityIdPrefix.Contract.Http)
  .prefix("/embeddings") {}
