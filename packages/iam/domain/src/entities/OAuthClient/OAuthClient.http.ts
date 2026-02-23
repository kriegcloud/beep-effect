import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, Get } from "./contracts";

export class Http extends HttpApiGroup.make("oauth-clients")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/oauth-clients") {}
