import type { FieldConfig } from "@beep/schema/annotations/default";
import type { ExtractedField } from "@beep/schema/schema-system/introspection";
import { getAnnotationFromSchema, getUiConfigFromAST } from "@beep/schema/schema-system/introspection";

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as AST from "effect/SchemaAST";

const getFieldDescription = (field: ExtractedField): string | undefined => {
  // Try to get description from the property signature first
  const propertyDescriptionOpt = getAnnotationFromSchema<string>(AST.DescriptionAnnotationId, field.schema);
  if (O.isSome(propertyDescriptionOpt)) {
    return propertyDescriptionOpt.value;
  }

  return undefined;
};

/**
 * System fields that should always be hidden from UI contexts
 */
export const SYSTEM_FIELDS_TO_HIDE = [
  "createdBy",
  "updatedBy",
  "deletedAt",
  "deletedBy",
  "inactivatedAt",
  "inactivatedBy",
  "customFields",
  "tags",
] as const;

/**
 * Entity type fields that should be hidden from UI contexts
 */
export const ENTITY_TYPE_FIELDS = ["_tag", "type"] as const;

/**
 * Identification fields that may be hidden based on their description
 */
export const IDENTIFICATION_FIELDS = ["id", "orgId", "externalIds"] as const;

/**
 * Type guard to check if a field key is a system field
 */
export const isSystemField = (key: string): key is (typeof SYSTEM_FIELDS_TO_HIDE)[number] => {
  return F.pipe(SYSTEM_FIELDS_TO_HIDE, A.contains(key as any));
};

/**
 * Type guard to check if a field key is an entity type field
 */
export const isEntityTypeField = (key: string): key is (typeof ENTITY_TYPE_FIELDS)[number] => {
  return F.pipe(ENTITY_TYPE_FIELDS, A.contains(key as any));
};

/**
 * Type guard to check if a field key is an identification field
 */
export const isIdentificationField = (key: string): key is (typeof IDENTIFICATION_FIELDS)[number] => {
  return F.pipe(IDENTIFICATION_FIELDS, A.contains(key as any));
};

/**
 * Determines if a field should be hidden from UI based on annotations and field characteristics
 */
export const shouldHideField = (field: ExtractedField, context: "table" | "form"): boolean => {
  const uiConfig = getUiConfigFromAST(field.schema);
  const contextConfig = context === "table" ? uiConfig?.table : uiConfig?.field;

  if (contextConfig?.hidden) {
    return true;
  }

  if (isSystemField(field.key)) {
    return true;
  }

  if (isEntityTypeField(field.key)) {
    return true;
  }

  if (isIdentificationField(field.key)) {
    const description = getFieldDescription(field);
    if (description?.includes("typeid") || description?.includes("external ids")) {
      return true;
    }
  }

  return false;
};

/**
 * Filters fields that should be visible in the UI context
 */
export const getVisibleFields = (fields: Array<ExtractedField>, context: "table" | "form"): Array<ExtractedField> => {
  return F.pipe(
    fields,
    A.filter((field) => !shouldHideField(field, context))
  );
};

/**
 * Gets the UI config for a specific context (table or form)
 */
export const getContextConfig = (
  field: ExtractedField,
  context: "table" | "form"
): FieldConfig["table"] | FieldConfig["field"] | undefined => {
  const uiConfig = getUiConfigFromAST(field.schema);
  return context === "table" ? uiConfig?.table : uiConfig?.field;
};
