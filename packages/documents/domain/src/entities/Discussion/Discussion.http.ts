import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Create, CreateWithComment, Delete, Get, ListByDocument, Resolve, Unresolve } from "./contracts";

export class Http extends HttpApiGroup.make("discussions")
  .add(Get.Contract.Http)
  .add(ListByDocument.Contract.Http)
  .add(Create.Contract.Http)
  .add(CreateWithComment.Contract.Http)
  .add(Resolve.Contract.Http)
  .add(Unresolve.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/discussions") {}
