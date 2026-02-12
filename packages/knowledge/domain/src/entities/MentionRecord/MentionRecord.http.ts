import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import {
  Delete,
  FindByExtractionId,
  FindByResolvedEntityId,
  FindUnresolved,
  Get,
  UpdateResolvedEntityId,
} from "./contracts";

export class Http extends HttpApiGroup.make("mention-records")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .add(FindByExtractionId.Contract.Http)
  .add(FindByResolvedEntityId.Contract.Http)
  .add(FindUnresolved.Contract.Http)
  .add(UpdateResolvedEntityId.Contract.Http)
  .prefix("/mention-records") {}
