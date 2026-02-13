import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Create, Delete, Get, HardDelete, ListByDocument, ListByUser } from "./contracts";

export class Http extends HttpApiGroup.make("document-files")
  .add(Get.Contract.Http)
  .add(ListByDocument.Contract.Http)
  .add(ListByUser.Contract.Http)
  .add(Create.Contract.Http)
  .add(Delete.Contract.Http)
  .add(HardDelete.Contract.Http)
  .prefix("/document-files") {}
