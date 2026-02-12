import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Create, Delete, Get, Update } from "./contracts";

export class Http extends HttpApiGroup.make("ontologies")
  .add(Create.Contract.Http)
  .add(Delete.Contract.Http)
  .add(Get.Contract.Http)
  .add(Update.Contract.Http)
  .prefix("/ontologies") {}
