import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, DeleteByFileKey, DeleteExpired, FindByFileKey, Get, IsValid, Store } from "./contracts";

export class Http extends HttpApiGroup.make("upload-sessions")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .add(Store.Contract.Http)
  .add(FindByFileKey.Contract.Http)
  .add(DeleteByFileKey.Contract.Http)
  .add(DeleteExpired.Contract.Http)
  .add(IsValid.Contract.Http)
  .prefix("/upload-sessions") {}
