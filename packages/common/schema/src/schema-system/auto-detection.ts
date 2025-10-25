import { type FieldConfig, getUnderlyingType } from "@beep/schema/annotations/default";
import { extractLiteralOptions, hasEmailPattern } from "@beep/schema/schema-system/introspection";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as AST from "effect/SchemaAST";
import * as Str from "effect/String";

/**
 * Auto-detects field configuration from schema AST
 */
export const autoDetectFieldConfig = (ast: AST.AST, fieldName: string): Partial<FieldConfig["field"]> => {
  const literalOptions = extractLiteralOptions(ast);
  const underlyingType = getUnderlyingType(ast);
  const lowerFieldName = fieldName.toLowerCase();

  return F.pipe(
    ast,
    Match.value,
    Match.when(hasEmailPattern, () => ({ type: "email" as const })),
    Match.orElse(() => {
      if (literalOptions.length > 0) {
        return {
          options: literalOptions,
          type: "select" as const,
        };
      }

      return F.pipe(
        underlyingType,
        Match.value,
        Match.when("string", () =>
          F.pipe(
            lowerFieldName,
            Match.value,
            Match.whenOr(
              Str.includes("date"),
              Str.includes("anniversary"),
              Str.includes("birthday"),
              Str.includes("birthdate"),
              () => ({
                placeholder: `Select ${fieldName.toLowerCase()}`,
                type: "date" as const,
              })
            ),
            Match.when(Str.includes("password"), () => ({
              type: "password" as const,
            })),
            Match.when(Str.includes("slug"), () => ({
              type: "slug" as const,
            })),
            Match.whenOr(
              Str.includes("bio"),
              Str.includes("description"),
              Str.includes("notes"),
              Str.includes("comment"),
              Str.includes("message"),
              () => ({ rows: 3, type: "textarea" as const })
            ),
            Match.orElse(() => ({ type: "text" as const }))
          )
        ),
        Match.when("number", () => ({ type: "number" as const })),
        Match.when("boolean", () => ({ type: "switch" as const })),
        Match.orElse(() => {
          if (AST.isTupleType(ast) || isArrayType(ast)) {
            return { type: "tags" as const };
          }
          return { type: "text" as const };
        })
      );
    })
  );
};

/**
 * Checks if the AST represents an array type
 */
const isArrayType = (ast: AST.AST): boolean => {
  if (ast._tag === "Declaration") {
    return ast.typeParameters.some(
      (param) => param.toString().includes("Array") || param.toString().includes("ReadonlyArray")
    );
  }

  return false;
};

/**
 * Auto-detects table cell configuration from schema AST
 */
export const autoDetectCellConfig = (ast: AST.AST, fieldName: string): Partial<FieldConfig["table"]> => {
  const underlyingType = getUnderlyingType(ast);
  const lowerFieldName = fieldName.toLowerCase();

  return F.pipe(
    ast,
    Match.value,
    Match.when(hasEmailPattern, () => ({ cellType: "email" as const })),
    Match.orElse(() =>
      F.pipe(
        underlyingType,
        Match.value,
        Match.when("string", () =>
          F.pipe(
            lowerFieldName,
            Match.value,
            Match.whenOr(Str.includes("avatar"), Str.includes("image"), Str.includes("photo"), () => ({
              cellType: "avatar" as const,
            })),
            Match.whenOr(Str.includes("url"), Str.includes("link"), Str.includes("website"), () => ({
              cellType: "link" as const,
            })),
            Match.whenOr(Str.includes("status"), Str.includes("type"), Str.includes("category"), () => ({
              cellType: "badge" as const,
            })),
            Match.when(
              (name) => name === "name",
              () => ({ cellType: "entityLink" as const })
            ),
            Match.orElse(() => ({ cellType: "text" as const }))
          )
        ),
        Match.when("number", () =>
          F.pipe(
            lowerFieldName,
            Match.value,
            Match.whenOr(
              Str.includes("price"),
              Str.includes("cost"),
              Str.includes("amount"),
              Str.includes("salary"),
              Str.includes("fee"),
              () => ({ cellType: "currency" as const })
            ),
            Match.orElse(() => ({ cellType: "number" as const }))
          )
        ),
        Match.when("boolean", () => ({ cellType: "boolean" as const })),
        Match.orElse(() =>
          F.pipe(
            lowerFieldName,
            Match.value,
            Match.when(
              (name) => F.pipe(name, Str.includes("time")) && !F.pipe(name, Str.includes("date")),
              () => ({ cellType: "datetime" as const })
            ),
            Match.whenOr(
              Str.includes("date"),
              Str.includes("time"),
              Str.includes("created"),
              Str.includes("updated"),
              () => ({ cellType: "date" as const })
            ),
            Match.orElse(() => ({ cellType: "text" as const }))
          )
        )
      )
    )
  );
};
