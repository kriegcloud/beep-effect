import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// Schema-based edge direction transformation
const EdgeDirectionInput = S.Struct({
  idA: S.String,
  idB: S.String,
});

const EdgeDirectionOutput = S.Struct({
  source: S.String,
  target: S.String,
});

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
});
