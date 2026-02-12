import * as AiToolkit from "@effect/ai/Toolkit";
import {
  Delete,
  FindByOrganization,
  FindBySourceEntity,
  FindByTargetEntity,
  FindByUser,
  Get,
} from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Delete.Contract.Tool,
  FindByTargetEntity.Contract.Tool,
  FindBySourceEntity.Contract.Tool,
  FindByUser.Contract.Tool,
  FindByOrganization.Contract.Tool
);
