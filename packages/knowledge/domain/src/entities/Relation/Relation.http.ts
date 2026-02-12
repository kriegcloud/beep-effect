import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Count, Create, Delete, Get } from "./contracts";

export class Http extends HttpApiGroup.make("relations")
  .add(Count.Contract.Http)
  .add(Create.Contract.Http)
  .add(Delete.Contract.Http)
  .add(Get.Contract.Http)
  .prefix("/relations") {}
