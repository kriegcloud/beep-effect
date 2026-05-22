/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { A, P, Struct } from "@beep/utils";
import { SchemaAST as AST, Match, pipe, Tuple } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import { TaggedErrorClass } from "../TaggedErrorClass.ts";
import type { EncodedAbsenceKind } from "./EntitySchema.persist.ts";
import { EncodedAbsenceKind as EncodedAbsenceKindSchema } from "./EntitySchema.persist.ts";
import { $I } from "./EntitySchema.shared.ts";

class AstAbsence extends S.Class<AstAbsence>($I`AstAbsence`)(
  {
    allowsNull: S.Boolean,
    allowsUndefined: S.Boolean,
    isAmbiguous: S.Boolean,
  },
  $I.annote("AstAbsence", {
    description:
      "Represents the absence of a value in an AST declaration, with options for null, undefined, and ambiguity.",
  })
) {}

type EncodedFieldShapeMember<T extends EncodedAbsenceKind> = {
  readonly absenceKind: T;
  readonly allowsNull: boolean;
  readonly allowsUndefined: boolean;
  readonly isAmbiguous: boolean;
  readonly isOptional: boolean;
};

class SelectedRowFieldShapeError extends TaggedErrorClass<SelectedRowFieldShapeError>($I`SelectedRowFieldShapeError`)(
  "SelectedRowFieldShapeError",
  {
    field: S.String,
    message: S.String,
  },
  $I.annote("SelectedRowFieldShapeError", {
    description: "Selected-row field shape validation failure.",
  })
) {}

/** @internal */
/**
 * Public schema module export.
 *
 * @category errors
 * @since 0.0.0
 */
export class EntityFieldInputError extends TaggedErrorClass<EntityFieldInputError>($I`EntityFieldInputError`)(
  "EntityFieldInputError",
  {
    field: S.String,
    message: S.String,
  },
  $I.annote("EntityFieldInputError", {
    description: "Entity field input validation failure.",
  })
) {}

/** @internal */
/**
 * Public schema module export.
 *
 * @category errors
 * @since 0.0.0
 */
export class EntitySchemaAttachmentError extends TaggedErrorClass<EntitySchemaAttachmentError>(
  $I`EntitySchemaAttachmentError`
)(
  "EntitySchemaAttachmentError",
  {
    message: S.String,
  },
  $I.annote("EntitySchemaAttachmentError", {
    description: "EntitySchema metadata attachment invariant failure.",
  })
) {}

const knownAstAbsence = (allowsNull: boolean, allowsUndefined: boolean, isAmbiguous = false): AstAbsence => ({
  allowsNull,
  allowsUndefined,
  isAmbiguous,
});

const combineAstAbsence = (left: AstAbsence, right: AstAbsence): AstAbsence => ({
  allowsNull: left.allowsNull || right.allowsNull,
  allowsUndefined: left.allowsUndefined || right.allowsUndefined,
  isAmbiguous: left.isAmbiguous || right.isAmbiguous,
});

type TypeConstructorAnnotation = {
  readonly _tag: string;
};

const isTypeConstructorAnnotation = (value: unknown): value is TypeConstructorAnnotation =>
  P.isObject(value) && P.hasProperty(value, "_tag") && P.isString(value._tag);

const typeConstructorTag = (ast: AST.Declaration): string | undefined => {
  const annotation = ast.annotations?.typeConstructor;
  return isTypeConstructorAnnotation(annotation) ? annotation._tag : undefined;
};

const isJsonDeclaration = (ast: AST.Declaration): boolean => {
  const tag = typeConstructorTag(ast);
  return tag === "effect/Json" || tag === "effect/MutableJson";
};

const isKnownRequiredDeclaration = (ast: AST.Declaration): boolean => {
  const tag = typeConstructorTag(ast);
  return tag === "Date" || tag === "Uint8Array";
};

const astAbsence: (input: AST.AST) => AstAbsence = Match.type<AST.AST>().pipe(
  Match.withReturnType<AstAbsence>(),
  Match.tag("Null", () => knownAstAbsence(true, false)),
  Match.tag("Undefined", "Void", () => knownAstAbsence(false, true)),
  Match.tag("Any", "Unknown", () => knownAstAbsence(true, true)),
  Match.tags({
    Declaration: (ast) =>
      isJsonDeclaration(ast)
        ? knownAstAbsence(true, false)
        : isKnownRequiredDeclaration(ast)
          ? knownAstAbsence(false, false)
          : knownAstAbsence(false, false, true),
    Suspend: (ast) => astAbsence(ast.thunk()),
    Union: (ast) =>
      A.reduce(ast.types ?? A.empty(), knownAstAbsence(false, false), (accumulator, member) =>
        combineAstAbsence(accumulator, astAbsence(member))
      ),
  }),
  Match.orElse(() => knownAstAbsence(false, false))
);

/**
 * Encoded absence shape for one schema field.
 *
 * @since 0.0.0
 * @category models
 */
export const EncodedFieldShape = EncodedAbsenceKindSchema.mapMembers((members) => {
  const make = <T extends EncodedAbsenceKind>(literal: S.Literal<T>) =>
    S.Class<EncodedFieldShapeMember<T>>($I`EncodedFieldShapeMember`)(
      {
        absenceKind: S.tag(literal.literal),
        allowsNull: S.Boolean,
        allowsUndefined: S.Boolean,
        isAmbiguous: S.Boolean,
        isOptional: S.Boolean,
      },
      $I.annote("EncodedFieldShapeMember", {
        description: "Encoded field shape member with absence kind and null/undefined handling flags.",
      })
    );

  return pipe(members, Tuple.evolve([make, make, make, make, make, make, make, make, make]));
}).pipe(
  $I.annoteSchema("EncodedFieldShape", {
    description: "Encoded field shape with absence kind and null/undefined handling flags",
  }),
  S.toTaggedUnion("absenceKind")
);

/**
 * Runtime type for encoded field shape metadata.
 *
 * @since 0.0.0
 * @category models
 */
export type EncodedFieldShape = typeof EncodedFieldShape.Type;

/**
 * Return the encoded AST for a schema field.
 *
 * @since 0.0.0
 * @category getters
 */
export const encodedAstFor = (field: S.Top): AST.AST => AST.toEncoded(field.ast);

const absenceKindFor = (shape: Omit<EncodedFieldShape, "absenceKind">): EncodedAbsenceKind => {
  if (shape.isAmbiguous) {
    return "ambiguous";
  }
  if (shape.isOptional && shape.allowsNull && shape.allowsUndefined) {
    return "optionalNullish";
  }
  if (shape.isOptional && shape.allowsNull) {
    return "optionalNullable";
  }
  if (shape.isOptional && shape.allowsUndefined) {
    return "optionalUndefined";
  }
  if (shape.isOptional) {
    return "optionalKey";
  }
  if (shape.allowsNull && shape.allowsUndefined) {
    return "nullish";
  }
  if (shape.allowsNull) {
    return "nullable";
  }
  if (shape.allowsUndefined) {
    return "undefined";
  }
  return "required";
};

/**
 * Derive encoded nullability and optionality from the encoded schema AST.
 *
 * @since 0.0.0
 * @category getters
 */
export const encodedFieldShape = (field: S.Top): EncodedFieldShape => {
  const ast = encodedAstFor(field);
  const absence = astAbsence(ast);
  const shape = {
    allowsNull: absence.allowsNull,
    allowsUndefined: absence.allowsUndefined,
    isAmbiguous: absence.isAmbiguous,
    isOptional: AST.isOptional(ast),
  };
  return Struct.assign(shape, {
    absenceKind: absenceKindFor(shape),
  });
};

/**
 * Derive and validate selected-row absence semantics for one field.
 *
 * @since 0.0.0
 * @category validation
 */
export const selectedRowFieldShape: {
  (key: string, field: S.Top): EncodedFieldShape;
  (field: S.Top): (key: string) => EncodedFieldShape;
} = dual(2, (key: string, field: S.Top): EncodedFieldShape => {
  const shape = encodedFieldShape(field);
  if (shape.isAmbiguous || shape.isOptional || shape.allowsUndefined) {
    throw new SelectedRowFieldShapeError({
      field: key,
      message: `Persisted selected-row field '${key}' must encode SQL absence as null, not undefined, a missing key, or an ambiguous declared schema.`,
    });
  }
  return shape;
});

/**
 * True when a field's encoded side allows null.
 *
 * @since 0.0.0
 * @category predicates
 */
export const isEncodedNullable = (field: S.Top): boolean => encodedFieldShape(field).allowsNull;

/**
 * True when a field's encoded side is optional.
 *
 * @since 0.0.0
 * @category predicates
 */
export const isEncodedOptional = (field: S.Top): boolean => encodedFieldShape(field).isOptional;
