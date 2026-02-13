import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import {
  Archive,
  Create,
  Delete,
  Get,
  HardDelete,
  List,
  ListArchived,
  ListByUser,
  ListChildren,
  Lock,
  Publish,
  Restore,
  Search,
  Unlock,
  Unpublish,
  Update,
} from "./contracts";

export class Http extends HttpApiGroup.make("documents")
  .add(Get.Contract.Http)
  .add(Create.Contract.Http)
  .add(Update.Contract.Http)
  .add(Delete.Contract.Http)
  .add(Search.Contract.Http)
  .add(ListByUser.Contract.Http)
  .add(List.Contract.Http)
  .add(ListArchived.Contract.Http)
  .add(ListChildren.Contract.Http)
  .add(Archive.Contract.Http)
  .add(Restore.Contract.Http)
  .add(Publish.Contract.Http)
  .add(Unpublish.Contract.Http)
  .add(Lock.Contract.Http)
  .add(Unlock.Contract.Http)
  .add(HardDelete.Contract.Http)
  .prefix("/documents") {}
