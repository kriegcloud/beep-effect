import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, DeleteFiles, Get, GetFilesByKeys, ListPaginated, MoveFiles } from "./contracts";

export class Http extends HttpApiGroup.make("files")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .add(ListPaginated.Contract.Http)
  .add(MoveFiles.Contract.Http)
  .add(DeleteFiles.Contract.Http)
  .add(GetFilesByKeys.Contract.Http)
  .prefix("/files") {}
