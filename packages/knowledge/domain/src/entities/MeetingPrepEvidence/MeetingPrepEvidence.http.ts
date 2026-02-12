import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, Get, ListByBulletId } from "./contracts";

export class Http extends HttpApiGroup.make("meeting-prep-evidence")
  .add(Get.Contract.Http)
  .add(ListByBulletId.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/meeting-prep-evidence") {}
