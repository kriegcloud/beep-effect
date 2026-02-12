import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, Get, ListByMeetingPrepId } from "./contracts";

export class Http extends HttpApiGroup.make("meeting-prep-bullets")
  .add(Get.Contract.Http)
  .add(ListByMeetingPrepId.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/meeting-prep-bullets") {}
