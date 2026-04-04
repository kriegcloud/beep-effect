import { Effect, ParseResult, Schema, Array, Data } from "effect";
import type { POSPatternOption, EntityPatternOption } from "./Pattern.js";
import {
  POSPatternElement,
  EntityPatternElement,
  LiteralPatternElement,
  WinkEntityType,
} from "./Pattern.js";

// ============================================================================
// BRACKET STRING TO PATTERN ELEMENT PARSERS
// ============================================================================

/**
 * Parse a bracket string back into a POSPatternElement
 * Example: "[ADJ|NOUN]" -> POSPatternElement({ value: ["ADJ", "NOUN"] })
 */
export const BracketStringToPOSPatternElement = Schema.transformOrFail(
  Schema.NonEmptyString,
  POSPatternElement,
  {
    strict: true,
    decode: (input, _options, ast) =>
      Effect.gen(function* () {
        // Validate bracket structure
        yield* Effect.if(input.startsWith("[") && input.endsWith("]"), {
          onTrue: () => Effect.void,
          onFalse: () =>
            Effect.fail(
              new ParseResult.Type(
                ast,
                input,
                "POS pattern must be enclosed in brackets [...]"
              )
            ),
        });

        const content = input.slice(1, -1); // Remove brackets

        // Validate content is not empty
        yield* Effect.if(content.length > 0, {
          onTrue: () => Effect.void,
          onFalse: () =>
            Effect.fail(
              new ParseResult.Type(ast, input, "POS pattern cannot be empty")
            ),
        });

        const parts = Array.fromIterable(content.split("|"));
        const hasValidTags = parts.some((tag) => tag !== "");

        // Validate at least one valid POS tag exists
        yield* Effect.if(hasValidTags, {
          onTrue: () => Effect.void,
          onFalse: () =>
            Effect.fail(
              new ParseResult.Type(
                ast,
                input,
                "POS pattern must contain at least one valid POS tag"
              )
            ),
        });

        return POSPatternElement.make({
          value: Data.array(parts) as POSPatternOption,
        });
      }),
    encode: (element) => {
      return Effect.succeed(`[${element.value.join("|")}]`);
    },
  }
);

/**
 * Parse a bracket string back into an EntityPatternElement
 * Example: "[CARDINAL|TIME]" -> EntityPatternElement({ value: ["CARDINAL", "TIME"] })
 */
export const BracketStringToEntityPatternElement = Schema.transformOrFail(
  Schema.NonEmptyString,
  EntityPatternElement,
  {
    strict: true,
    decode: (input, _options, ast) => {
      if (!input.startsWith("[") || !input.endsWith("]")) {
        return Effect.fail(
          new ParseResult.Type(
            ast,
            input,
            "Entity pattern must be enclosed in brackets [...]"
          )
        );
      }

      const content = input.slice(1, -1);
      if (content.length === 0) {
        return Effect.fail(
          new ParseResult.Type(ast, input, "Entity pattern cannot be empty")
        );
      }

      const parts = Array.fromIterable(content.split("|"));
      if (!Array.isNonEmptyArray(parts)) {
        return Effect.fail(
          new ParseResult.Type(
            ast,
            input,
            "Entity pattern must contain at least one valid entity type"
          )
        );
      }

      // Validate each part is a valid entity type or empty string
      for (const part of parts) {
        if (part !== "" && !Schema.is(WinkEntityType)(part)) {
          return Effect.fail(
            new ParseResult.Type(
              ast,
              input,
              `Invalid entity type: "${part}". Must be a valid wink-nlp entity type.`
            )
          );
        }
      }

      const hasValidTypes = parts.some((type) => type !== "");
      if (!hasValidTypes) {
        return Effect.fail(
          new ParseResult.Type(
            ast,
            input,
            "Entity pattern must contain at least one valid entity type"
          )
        );
      }

      return Effect.succeed(
        EntityPatternElement.make({
          value: Data.array(parts) as EntityPatternOption,
        })
      );
    },
    encode: (element) => {
      return Effect.succeed(`[${element.value.join("|")}]`);
    },
  }
);

/**
 * Parse a bracket string back into a LiteralPatternElement
 * Example: "[Apple|Google]" -> LiteralPatternElement({ value: ["Apple", "Google"] })
 */
export const BracketStringToLiteralPatternElement = Schema.transformOrFail(
  Schema.NonEmptyString,
  LiteralPatternElement,
  {
    strict: true,
    decode: (input, _options, ast) => {
      if (!input.startsWith("[") || !input.endsWith("]")) {
        return Effect.fail(
          new ParseResult.Type(
            ast,
            input,
            "Literal pattern must be enclosed in brackets [...]"
          )
        );
      }

      const content = input.slice(1, -1);
      if (content.length === 0) {
        return Effect.fail(
          new ParseResult.Type(ast, input, "Literal pattern cannot be empty")
        );
      }

      const parts = Array.fromIterable(content.split("|"));

      if (!Array.isNonEmptyArray(parts)) {
        return Effect.fail(
          new ParseResult.Type(
            ast,
            input,
            "Literal pattern must contain at least one valid literal"
          )
        );
      }

      // Validate each part is a non-empty string or empty string
      for (const part of parts) {
        if (part !== "" && part.trim().length === 0) {
          return Effect.fail(
            new ParseResult.Type(
              ast,
              input,
              "Literal values cannot be whitespace-only strings"
            )
          );
        }
      }

      const hasValidLiterals = parts.some((literal) => literal !== "");
      if (!hasValidLiterals) {
        return Effect.fail(
          new ParseResult.Type(
            ast,
            input,
            "Literal pattern must contain at least one valid literal"
          )
        );
      }

      return Effect.succeed(
        LiteralPatternElement.make({
          value: Data.array(parts) as any,
        })
      );
    },
    encode: (element) => {
      return Effect.succeed(`[${element.value.join("|")}]`);
    },
  }
);

export type BracketStringToPatternElement = Schema.Schema.Type<
  typeof BracketStringToPatternElement
>;
export const BracketStringToPatternElement = Schema.Union(
  BracketStringToPOSPatternElement,
  BracketStringToEntityPatternElement,
  BracketStringToLiteralPatternElement
);

export const PatternFromString = (elementStrings: ReadonlyArray<string>) => {
  return Schema.decodeUnknownSync(
    Schema.NonEmptyArray(BracketStringToPatternElement)
  )(elementStrings);
};
