import * as AiToolkit from "@effect/ai/Toolkit";
import {
  CountByOrganization,
  Delete,
  FindByIds,
  FindByNormalizedText,
  FindByOntology,
  FindByType,
  Get,
} from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Delete.Contract.Tool,
  FindByIds.Contract.Tool,
  FindByOntology.Contract.Tool,
  FindByType.Contract.Tool,
  CountByOrganization.Contract.Tool,
  FindByNormalizedText.Contract.Tool
);
