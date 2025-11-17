import type * as B from "effect/Brand";
import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("custom");
export const SemanticVersion = S.TemplateLiteral(S.Number, ".", S.Number, ".", S.Number)
  .pipe(S.brand("SemanticVersion"))
  .annotations(
    Id.annotations("SemanticVersion", {
      description: "A value representing a semantic version",
      examples: [
        "1.0.0" as B.Branded<`${number}.${number}.${number}`, "SemanticVersion">,
        "2.1.0" as B.Branded<`${number}.${number}.${number}`, "SemanticVersion">,
        "3.0.1" as B.Branded<`${number}.${number}.${number}`, "SemanticVersion">,
      ],
    })
  );

export declare namespace SemanticVersion {
  export type Type = S.Schema.Type<typeof SemanticVersion>;
  export type Encoded = S.Schema.Encoded<typeof SemanticVersion>;
}
