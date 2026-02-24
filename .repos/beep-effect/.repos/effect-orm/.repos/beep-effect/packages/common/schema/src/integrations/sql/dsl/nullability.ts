import { thunkFalse, thunkTrue } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import type * as AST from "effect/SchemaAST";

/**
 * Determines if a Schema AST can encode to null/undefined/missing.
 *
 * This is used for deriving SQL column nullability from Effect schemas.
 * For SQL columns, we analyze the "from" side (encoded) since that's what
 * gets stored in the database.
 *
 * Nullable patterns detected:
 * - S.Null (Literal with null)
 * - S.Undefined (UndefinedKeyword)
 * - S.Void (VoidKeyword)
 * - S.NullOr(S) - Union containing null
 * - S.UndefinedOr(S) - Union containing undefined
 * - S.NullishOr(S) - Union containing null and undefined
 * - S.OptionFromNullOr(V) - Transformation from nullable
 * - S.optional(S) - PropertySignature with isOptional
 * - Refinements on nullable types
 * - Recursive schemas via S.suspend
 *
 * @param ast - The AST node to analyze
 * @param side - "from" (encoded/SQL storage) or "to" (decoded/TypeScript), default "from"
 * @param visited - WeakSet to prevent infinite recursion on circular schemas
 * @returns true if the schema can encode to null/undefined
 *
 * @since 1.0.0
 * @category utilities
 */
export const isNullable = (
  ast: AST.AST,
  side: "from" | "to" = "from",
  visited: WeakSet<AST.AST> = new WeakSet<AST.AST>()
): boolean => {
  // Prevent infinite recursion on circular schemas
  if (visited.has(ast)) return false;
  visited.add(ast);

  // Use Match.discriminatorsExhaustive for exhaustive pattern matching on AST._tag
  return F.pipe(
    Match.value(ast),
    Match.discriminatorsExhaustive("_tag")({
      // ======================================================================
      // Direct Nullable Types
      // ======================================================================
      UndefinedKeyword: thunkTrue,
      VoidKeyword: thunkTrue,

      // ======================================================================
      // Literal: Check for null literal
      // ======================================================================
      Literal: (literalAst) => literalAst.literal === null,

      // ======================================================================
      // Union: Nullable if ANY member is nullable
      // ======================================================================
      Union: (unionAst) =>
        F.pipe(
          unionAst.types,
          A.some((member) => isNullable(member, side, visited))
        ),

      // ======================================================================
      // Transparent Wrappers: Recurse into wrapped type
      // ======================================================================
      Refinement: (refAst) => isNullable(refAst.from, side, visited),
      Suspend: (suspendAst) => isNullable(suspendAst.f(), side, visited),

      // ======================================================================
      // Transformation: Check the appropriate side
      // ======================================================================
      Transformation: (transformAst) => {
        const targetAST = side === "from" ? transformAst.from : transformAst.to;
        return isNullable(targetAST, side, visited);
      },

      // ======================================================================
      // Non-Nullable Types: All other AST tags
      // ======================================================================
      StringKeyword: thunkFalse,
      NumberKeyword: thunkFalse,
      BooleanKeyword: thunkFalse,
      BigIntKeyword: thunkFalse,
      SymbolKeyword: thunkFalse,
      UniqueSymbol: thunkFalse,
      NeverKeyword: thunkFalse,
      UnknownKeyword: thunkFalse,
      AnyKeyword: thunkFalse,
      ObjectKeyword: thunkFalse,
      Enums: thunkFalse,
      TemplateLiteral: thunkFalse,
      TupleType: thunkFalse,
      TypeLiteral: thunkFalse,
      Declaration: thunkFalse,
    })
  );
};

/**
 * Checks if a Schema is nullable by analyzing its AST.
 * Convenience wrapper around isNullable for Schema inputs.
 *
 * @param schema - The Effect Schema to analyze
 * @param side - Which side to analyze (default: "from" for SQL)
 * @returns true if the schema can encode to null/undefined
 *
 * @since 1.0.0
 * @category utilities
 */
export const isSchemaTypeNullable = (schema: { readonly ast: AST.AST }, side: "from" | "to" = "from"): boolean =>
  isNullable(schema.ast, side);
