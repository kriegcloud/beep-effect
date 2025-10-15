import * as S from "effect/Schema";
import { makeBranded } from "../utils";

export const SemanticVersion = S.TemplateLiteral(S.Number, ".", S.Number, ".", S.Number)
  .pipe(S.brand("SemanticVersion"))
  .annotations({
    schemaId: Symbol.for("@beep/schema/custom/SemanticVersion"),
    identifier: "SemanticVersion",
    title: "Semantic Version String",
    description: "A value representing a semantic version",
    examples: [makeBranded("1.0.0"), makeBranded("2.1.0"), makeBranded("3.0.1")],
  });

export declare namespace SemanticVersion {
  export type Type = S.Schema.Type<typeof SemanticVersion>;
  export type Encoded = S.Schema.Encoded<typeof SemanticVersion>;
}
