import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { CreateSnapshot, Get, GetContent, HardDelete, ListByDocument } from "./contracts";

export class Http extends HttpApiGroup.make("document-versions")
  .add(Get.Contract.Http)
  .add(GetContent.Contract.Http)
  .add(ListByDocument.Contract.Http)
  .add(CreateSnapshot.Contract.Http)
  .add(HardDelete.Contract.Http)
  .prefix("/document-versions") {}
