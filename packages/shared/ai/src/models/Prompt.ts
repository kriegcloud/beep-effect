import * as _Prompt from "@effect/ai/Prompt";
import * as S from "effect/Schema";
import {$SharedAiId} from "@beep/identity/packages";
import {BS} from "@beep/schema";

const $I = $SharedAiId.create("models/Prompt");

export class PartType extends BS.StringLiteralKit(
  "text",
  "reasoning",
  "file",
  "tool-call",
  "tool-result",
  {
    enumMapping: [
      ["text", "TextPart"],
      ["reasoning", "ReasoningPart"],
      ["file", "FilePart"],
      ["tool-call", "ToolCallPart"],
      ["tool-result", "ToolResultPart"],
    ]
  }
).annotations(
  $I.annotations(
    "PartType",
    {
      description: "The type of part to for a Prompt Part"
    }
  )
) {
}

export declare namespace PartType {
  export type Type = typeof PartType.Type;
}

const makePartKind = PartType.toTagged("type").composer({});

export class TextPart extends S.Class<TextPart>($I`TextPart`)(
  makePartKind.text({
    text: S.String,
  }),
  $I.annotations(
    "TextPart",
    {
      description: "A text part of a prompt"
    }
  )
) {}

export class ReasoningPart extends S.Struct(
  makePartKind.reasoning({
    text: S.String,
  }, _Prompt.ProviderOptions),
  $I.annotations(
    "ReasoningPart",
    {
      description: "A text part of a prompt"
    }
  )
) {}