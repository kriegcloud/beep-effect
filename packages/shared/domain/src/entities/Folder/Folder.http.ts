import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, DeleteFolders, Get } from "./contracts";

export class Http extends HttpApiGroup.make("folders")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .add(DeleteFolders.Contract.Http)
  .prefix("/folders") {}
