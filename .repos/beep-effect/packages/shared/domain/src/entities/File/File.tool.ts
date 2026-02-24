import * as AiToolkit from "@effect/ai/Toolkit";
import { Delete, DeleteFiles, Get, GetFilesByKeys, ListPaginated, MoveFiles } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Delete.Contract.Tool,
  ListPaginated.Contract.Tool,
  MoveFiles.Contract.Tool,
  DeleteFiles.Contract.Tool,
  GetFilesByKeys.Contract.Tool
);
