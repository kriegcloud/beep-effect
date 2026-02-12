import * as AiToolkit from "@effect/ai/Toolkit";
import {
  Delete,
  DeleteByOntology,
  FindByCanonicalEntity,
  FindByMember,
  FindByOntology,
  FindHighCohesion,
  Get,
} from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Delete.Contract.Tool,
  FindByCanonicalEntity.Contract.Tool,
  FindByMember.Contract.Tool,
  FindByOntology.Contract.Tool,
  FindHighCohesion.Contract.Tool,
  DeleteByOntology.Contract.Tool
);
