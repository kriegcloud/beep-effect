import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, Get } from "./contracts";

export class Http extends HttpApiGroup.make("wallet-addresses")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/wallet-addresses") {}
