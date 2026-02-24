import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Count, Create, Delete, Get, Update } from "./contracts";

export class Http extends HttpApiGroup.make("knowledge-entities")
  .add(Count.Contract.Http)
  .add(Create.Contract.Http)
  .add(Delete.Contract.Http)
  .add(Get.Contract.Http)
  .add(Update.Contract.Http)
  .prefix("/knowledge-entities") {}
