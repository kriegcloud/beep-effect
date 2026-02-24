import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, Get } from "./contracts";

export class Http extends HttpApiGroup.make("organizations")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/organizations") {}
