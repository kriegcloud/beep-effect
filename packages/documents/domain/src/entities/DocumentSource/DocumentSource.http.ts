import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, FindByMappingKey, Get } from "./contracts";

export class Http extends HttpApiGroup.make("document-sources")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .add(FindByMappingKey.Contract.Http)
  .prefix("/document-sources") {}
