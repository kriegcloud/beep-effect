import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Create from "./create";
import * as Delete from "./delete";
import * as Get from "./get";
import * as List from "./list";
import * as Update from "./update";

export class Group extends HttpApiGroup.make("apiKey")
  .add(Create.Contract)
  .add(Delete.Contract)
  .add(Get.Contract)
  .add(List.Contract)
  .add(Update.Contract)
  .prefix("/api-key") {}

export { Create, Delete, Get, List, Update };
