import * as AiToolkit from "@effect/ai/Toolkit";
import { Delete, DeleteByFileKey, DeleteExpired, FindByFileKey, Get, IsValid, Store } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Delete.Contract.Tool,
  Store.Contract.Tool,
  FindByFileKey.Contract.Tool,
  DeleteByFileKey.Contract.Tool,
  DeleteExpired.Contract.Tool,
  IsValid.Contract.Tool
);
