import { $DocumentsDomainId } from "@beep/identity/packages";
import * as ClusterSchema from "@effect/cluster/ClusterSchema";
import * as E from "@effect/cluster/Entity";
import {
  Archive,
  Breadcrumbs,
  Create,
  Delete,
  Get,
  List,
  ListChildren,
  ListTrash,
  Lock,
  Move,
  Publish,
  Restore,
  Search,
  Unlock,
  UnPublish,
  Update,
} from "./contracts";

const $I = $DocumentsDomainId.create("entities/Page/Page.entity");

export const Entity = E.make($I`Entity`, [
  Archive.Contract,
  Breadcrumbs.Contract,
  Create.Contract,
  Delete.Contract,
  Get.Contract,
  List.Contract,
  ListChildren.Contract,
  ListTrash.Contract,
  Lock.Contract,
  Move.Contract,
  Publish.Contract,
  UnPublish.Contract,
  Restore.Contract,
  Search.Contract,
  Unlock.Contract,
  Update.Contract,
]).annotateRpcs(ClusterSchema.Persisted, true);
