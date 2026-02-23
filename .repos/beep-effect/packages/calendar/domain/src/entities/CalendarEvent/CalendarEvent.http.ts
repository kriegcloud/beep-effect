import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, Get } from "./contracts";

export class Http extends HttpApiGroup.make("calendar-events")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/calendar-events") {}
