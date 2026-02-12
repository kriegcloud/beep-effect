import * as AiToolkit from "@effect/ai/Toolkit";
import {
  CountMembers,
  Delete,
  DeleteByCanonical,
  FindByCanonical,
  FindByMember,
  FindBySource,
  FindHighConfidence,
  Get,
  ResolveCanonical,
} from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Delete.Contract.Tool,
  FindByCanonical.Contract.Tool,
  FindByMember.Contract.Tool,
  ResolveCanonical.Contract.Tool,
  FindHighConfidence.Contract.Tool,
  FindBySource.Contract.Tool,
  DeleteByCanonical.Contract.Tool,
  CountMembers.Contract.Tool
);
