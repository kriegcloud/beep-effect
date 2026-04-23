import * as S from "effect/Schema";
import { $ScratchId } from "@beep/identity";

const $I = $ScratchId.create("mem/values/Answer/index.ts");

export class Answer extends S.Class<Answer>($I`Answer`)(
  {
    answer: S.String,
  },
  $I.annote("Answer", {
    description: "Represents an answer to a question or query in the knowledge graph."
  })
) {
  static readonly new = (answer: string) => new Answer({ answer });
}
