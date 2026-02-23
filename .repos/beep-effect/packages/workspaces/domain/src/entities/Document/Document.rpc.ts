import * as RpcGroup from "@effect/rpc/RpcGroup";
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

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Create.Contract.Rpc,
  Update.Contract.Rpc,
  Delete.Contract.Rpc,
  Search.Contract.Rpc,
  ListByUser.Contract.Rpc,
  List.Contract.Rpc,
  ListArchived.Contract.Rpc,
  ListChildren.Contract.Rpc,
  Archive.Contract.Rpc,
  Restore.Contract.Rpc,
  Publish.Contract.Rpc,
  Unpublish.Contract.Rpc,
  Lock.Contract.Rpc,
  Unlock.Contract.Rpc,
  HardDelete.Contract.Rpc
) {}
