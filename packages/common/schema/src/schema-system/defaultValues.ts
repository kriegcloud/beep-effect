import { getVisibleFields } from "@beep/schema/schema-system/filtering";
import { extractLiteralOptions, extractSchemaFields } from "@beep/schema/schema-system/introspection";
import type { Schema, SchemaAST } from "effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
/**
 * Generates default values for a schema based on field types and annotations
 */
export const generateDefaultValues = <T>(
  schema: Schema.Schema<T> | { ast: SchemaAST.AST }
): Record<string, unknown> => {
  const fields = extractSchemaFields(schema);
  const visibleFields = getVisibleFields(fields, "form");

  return F.pipe(
    visibleFields,
    A.reduce({} as Record<string, unknown>, (acc, field) => {
      if (field.isOptional || field.isNullable) {
        return acc;
      }

      const literalOptions = extractLiteralOptions(field.schema.type);

      return F.pipe(
        literalOptions,
        A.head,
        O.match({
          onNone: () => acc,
          onSome: (firstOption) => ({
            ...acc,
            [field.key]: firstOption.value,
          }),
        })
      );
    })
  );
};

/**
 * Generates default values with custom overrides
 */
export const generateDefaultValuesWithOverrides = <T>(
  schema: Schema.Schema<T>,
  overrides: Partial<T> = {}
): Partial<T> => {
  const autoDefaults = generateDefaultValues(schema);
  return {
    ...autoDefaults,
    ...overrides,
  } as Partial<T>;
};
