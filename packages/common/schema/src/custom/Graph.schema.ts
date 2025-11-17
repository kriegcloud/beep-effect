import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { CustomId } from "./_id";

const Id = CustomId.compose("graph");
// Schema-based edge direction transformation
const EdgeDirectionInput = S.Struct({
  idA: S.String,
  idB: S.String,
}).annotations(
  Id.annotations("EdgeDirectionInput", {
    description: "Input schema for edge direction transformation",
  })
);

const EdgeDirectionOutput = S.Struct({
  source: S.String,
  target: S.String,
}).annotations(
  Id.annotations("EdgeDirectionOutput", {
    description: "Output schema for edge direction transformation",
  })
);

export const EdgeDirectionSchema = S.transformOrFail(EdgeDirectionInput, EdgeDirectionOutput, {
  decode: ({ idA, idB }, _options, ast) => {
    // Check for empty IDs first
    if (!idA || !idB) {
      return ParseResult.fail(new ParseResult.Type(ast, { idA, idB }, "Cannot determine edge direction: empty ID"));
    }

    // Allow self-linking (identical IDs)
    if (idA === idB) {
      return ParseResult.succeed({ source: idA, target: idB });
    }

    const alphaRange = (id: string) => {
      const c = Str.toLowerCase(id[0]!);
      return c >= "a" && c <= "m" ? "A-M" : "N-Z";
    };

    const rangeA = alphaRange(idA);
    const rangeB = alphaRange(idB);

    // If different ranges, use the range rule (A-M is source, N-Z is target)
    if (rangeA !== rangeB) {
      return ParseResult.succeed(rangeA === "A-M" ? { source: idA, target: idB } : { source: idB, target: idA });
    }

    // Same range: use full string comparison (handles same entity type linking)
    if (idA < idB) return ParseResult.succeed({ source: idA, target: idB });
    return ParseResult.succeed({ source: idB, target: idA });
  },
  encode: ({ source, target }) => ParseResult.succeed({ idA: source, idB: target }),
  strict: true,
}).annotations(
  Id.annotations("EdgeDirectionSchema", {
    description: "Schema-based edge direction transformation",
  })
);
