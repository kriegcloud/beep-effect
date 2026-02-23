import * as AiToolkit from "@effect/ai/Toolkit";
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

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Create.Contract.Tool,
  Update.Contract.Tool,
  Delete.Contract.Tool,
  Search.Contract.Tool,
  ListByUser.Contract.Tool,
  List.Contract.Tool,
  ListArchived.Contract.Tool,
  ListChildren.Contract.Tool,
  Archive.Contract.Tool,
  Restore.Contract.Tool,
  Publish.Contract.Tool,
  Unpublish.Contract.Tool,
  Lock.Contract.Tool,
  Unlock.Contract.Tool,
  HardDelete.Contract.Tool
);
