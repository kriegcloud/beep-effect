import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as _Prompt from "@effect/ai/Prompt";
import * as S from "effect/Schema";

const $I = $SharedAiId.create("models/Prompt");

export class PartType extends BS.StringLiteralKit("text", "reasoning", "file", "tool-call", "tool-result", {
  enumMapping: [
    ["text", "TextPart"],
    ["reasoning", "ReasoningPart"],
    ["file", "FilePart"],
    ["tool-call", "ToolCallPart"],
    ["tool-result", "ToolResultPart"],
  ],
}).annotations(
  $I.annotations("PartType", {
    description: "The type of part to for a Prompt Part",
  })
) {}

export declare namespace PartType {
  export type Type = typeof PartType.Type;
}

const makePartKind = PartType.toTagged("type").composer({});

export const TextPart = makePartKind.text({
  text: S.String,
});

export const ReasoningPart = makePartKind.reasoning({
  text: S.String,
});

export const FilePart = makePartKind.file({
  path: S.String,
});

export const ToolCallPart = makePartKind["tool-call"]({
  name: S.String,
  arguments: S.String,
});

export const ToolResultPart = makePartKind["tool-result"](
  {
    name: S.String,
    arguments: S.String,
  },
  _Prompt.ProviderOptions
);
