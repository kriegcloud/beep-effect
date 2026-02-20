/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ReturnedSchema, Schema } from "@palantir/pack.schema";
import { formatVariantName } from "../formatVariantName.js";
import { GENERATED_FILE_HEADER } from "../generatedFileHeader.js";

// Define schema types for internal use
const SchemaDefKind = {
  RECORD: "record",
  UNION: "union",
} as const;

const TypeKind = {
  ANY: "any",
  ARRAY: "array",
  DOC_REF: "docRef",
  DOUBLE: "double",
  MEDIA_REF: "mediaRef",
  OBJECT_REF: "objectRef",
  OPTIONAL: "optional",
  REF: "ref",
  STRING: "string",
  USER_REF: "userRef",
} as const;

// Base type definition for schema fields
interface BaseSchemaField {
  readonly type: string;
}

interface AnyField extends BaseSchemaField {
  readonly type: typeof TypeKind.ANY;
}

interface ArrayField extends BaseSchemaField {
  readonly type: typeof TypeKind.ARRAY;
  readonly items: SchemaField;
}

interface DocRefField extends BaseSchemaField {
  readonly type: typeof TypeKind.DOC_REF;
}

interface DoubleField extends BaseSchemaField {
  readonly type: typeof TypeKind.DOUBLE;
}

interface MediaRefField extends BaseSchemaField {
  readonly type: typeof TypeKind.MEDIA_REF;
}

interface ObjectRefField extends BaseSchemaField {
  readonly type: typeof TypeKind.OBJECT_REF;
}

interface OptionalField extends BaseSchemaField {
  readonly type: typeof TypeKind.OPTIONAL;
  readonly item: SchemaField;
}

interface RefField extends BaseSchemaField {
  readonly type: typeof TypeKind.REF;
  readonly refType: "record" | "union";
  readonly name: string;
}

interface StringField extends BaseSchemaField {
  readonly type: typeof TypeKind.STRING;
}

interface UserRefField extends BaseSchemaField {
  readonly type: typeof TypeKind.USER_REF;
}

type SchemaField =
  | AnyField
  | ArrayField
  | DocRefField
  | DoubleField
  | MediaRefField
  | ObjectRefField
  | OptionalField
  | RefField
  | StringField
  | UserRefField;

interface RuntimeSchemaRecord {
  readonly type: typeof SchemaDefKind.RECORD;
  readonly name: string;
  readonly docs?: string;
  readonly fields: Readonly<Record<string, SchemaField>>;
  readonly ref?: RefField & {
    readonly refType: "record";
  };
}

interface RuntimeSchemaUnion {
  readonly type: typeof SchemaDefKind.UNION;
  readonly name?: string;
  readonly variants: Readonly<Record<string, SchemaField>>;
  readonly discriminant: string;
  readonly ref?: RefField & {
    readonly refType: "union";
  };
}

type RuntimeSchemaItem = RuntimeSchemaRecord | RuntimeSchemaUnion;
type RuntimeSchema = Record<string, RuntimeSchemaItem>;

// Type guards
function isRecordSchema(item: RuntimeSchemaItem): item is RuntimeSchemaRecord {
  return item.type === SchemaDefKind.RECORD && "name" in item && "fields" in item;
}

function isUnionSchema(item: RuntimeSchemaItem): item is RuntimeSchemaUnion {
  return item.type === SchemaDefKind.UNION && "variants" in item && "discriminant" in item;
}

function isRefField(field: SchemaField): field is RefField {
  return field.type === TypeKind.REF && "refType" in field && "name" in field;
}

function isArrayField(field: SchemaField): field is ArrayField {
  return field.type === TypeKind.ARRAY && "items" in field;
}

function isOptionalField(field: SchemaField): field is OptionalField {
  return field.type === TypeKind.OPTIONAL && "item" in field;
}

function detectUsedRefTypes(schema: RuntimeSchema): Set<string> {
  const refTypes = new Set<string>();

  function scanField(field: SchemaField): void {
    switch (field.type) {
      case TypeKind.ARRAY:
        if (isArrayField(field)) {
          scanField(field.items);
        }
        break;
      case TypeKind.DOC_REF:
        refTypes.add("DocumentRef");
        break;
      case TypeKind.MEDIA_REF:
        refTypes.add("MediaRef");
        break;
      case TypeKind.OBJECT_REF:
        refTypes.add("ObjectRef");
        break;
      case TypeKind.OPTIONAL:
        if (isOptionalField(field)) {
          scanField(field.item);
        }
        break;
      case TypeKind.USER_REF:
        refTypes.add("UserRef");
        break;
    }
  }

  for (const item of Object.values(schema)) {
    if (isRecordSchema(item)) {
      for (const field of Object.values(item.fields)) {
        scanField(field);
      }
    } else if (isUnionSchema(item)) {
      for (const variant of Object.values(item.variants)) {
        scanField(variant);
      }
    }
  }

  return refTypes;
}

export function generateTypesFromSchema<T extends ReturnedSchema>(
  schema: Schema<T>,
): string {
  const runtimeSchema = schema as unknown as RuntimeSchema;

  // Detect which ref types are used in the schema
  const usedRefTypes = detectUsedRefTypes(runtimeSchema);

  let output = GENERATED_FILE_HEADER;

  // Add conditional imports based on which ref types are used
  if (usedRefTypes.size > 0) {
    const refTypesList = Array.from(usedRefTypes).sort().join(", ");
    output +=
      `import type { ${refTypesList} } from "@palantir/pack.document-schema.model-types";\n`;
  }

  output += "\n";

  // First pass: generate record interfaces
  for (const [exportName, item] of Object.entries(runtimeSchema)) {
    if (item.type === SchemaDefKind.RECORD && isRecordSchema(item)) {
      output += generateRecordInterface(item, exportName, runtimeSchema);
      output += "\n";
    }
  }

  // Second pass: generate union types
  const unionEntries = Object.entries(runtimeSchema).filter(
    ([_, item]) => item.type === SchemaDefKind.UNION && isUnionSchema(item),
  );

  unionEntries.forEach(([exportName, item], i) => {
    if (isUnionSchema(item)) {
      const unionOutput = generateUnionType(item, exportName, runtimeSchema);
      if (unionOutput) {
        output += unionOutput;
        // Only add newline if not the last union
        if (i < unionEntries.length - 1) {
          output += "\n";
        }
      }
    }
  });

  return output;
}

function generateRecordInterface(
  record: RuntimeSchemaRecord,
  exportName: string,
  schema: RuntimeSchema,
): string {
  let output = "";

  if (record.docs) {
    output += `/**\n * ${record.docs}\n */\n`;
  }

  output += `export interface ${exportName} {\n`;

  for (const [fieldName, fieldType] of Object.entries(record.fields)) {
    const tsType = convertTypeToTypeScript(fieldType, schema);
    const optional = fieldType.type === TypeKind.OPTIONAL ? "?" : "";
    output += `  readonly ${fieldName}${optional}: ${tsType};\n`;
  }

  output += "}\n";

  return output;
}

function generateUnionType(
  union: RuntimeSchemaUnion,
  exportName: string,
  schema: RuntimeSchema,
): string {
  let output = "";
  const variantInterfaces: Array<{ name: string; discriminatorValue: string }> = [];
  const discriminantField = union.discriminant;

  // First pass: generate variant interfaces
  for (const [variantName, variantType] of Object.entries(union.variants)) {
    const interfaceName = `${exportName}${formatVariantName(variantName)}`;
    variantInterfaces.push({ name: interfaceName, discriminatorValue: variantName });

    if (variantType.type === TypeKind.REF && variantType.refType === "record") {
      // Find the corresponding record name in the schema
      const recordName = findRecordExportName(variantType.name, schema);
      if (recordName) {
        output += `export interface ${interfaceName} extends ${recordName} {\n`;
        output += `  readonly ${discriminantField}: "${variantName}";\n`;
        output += "}\n\n";
      }
    } else {
      // Handle value types
      const tsType = convertTypeToTypeScript(variantType, schema);
      output += `export interface ${interfaceName} {\n`;
      output += `  readonly ${discriminantField}: "${variantName}";\n`;
      output += `  readonly value: ${tsType};\n`;
      output += "}\n\n";
    }
  }

  // Second pass: generate the union type
  output += `export type ${exportName} = ${variantInterfaces.map(v => v.name).join(" | ")};\n\n`;

  // Third pass: generate type guards
  for (let i = 0; i < variantInterfaces.length; i++) {
    const variant = variantInterfaces[i]!;
    output +=
      `export function is${variant.name}(value: ${exportName}): value is ${variant.name} {\n`;
    output += `  return value.${discriminantField} === "${variant.discriminatorValue}";\n`;
    output += "}\n\n";
  }

  return output;
}

function findRecordExportName(
  recordName: string,
  schema: RuntimeSchema,
): string | null {
  for (const [exportName, item] of Object.entries(schema)) {
    if (isRecordSchema(item) && item.name === recordName) {
      return exportName;
    }
  }
  return null;
}

function convertTypeToTypeScript(
  fieldType: SchemaField,
  schema?: RuntimeSchema,
): string {
  switch (fieldType.type) {
    case TypeKind.ANY:
      return "any";
    case TypeKind.ARRAY:
      if (isArrayField(fieldType)) {
        return `readonly ${convertTypeToTypeScript(fieldType.items, schema)}[]`;
      }
      return "readonly unknown[]";
    case TypeKind.DOC_REF:
      return "DocumentRef";
    case TypeKind.DOUBLE:
      return "number";
    case TypeKind.MEDIA_REF:
      return "MediaRef";
    case TypeKind.OBJECT_REF:
      return "ObjectRef";
    case TypeKind.OPTIONAL:
      if (isOptionalField(fieldType)) {
        return convertTypeToTypeScript(fieldType.item, schema);
      }
      return "unknown";
    case TypeKind.REF:
      if (isRefField(fieldType) && fieldType.refType === "record") {
        const exportName = schema ? findRecordExportName(fieldType.name, schema) : null;
        return exportName || (isRefField(fieldType) ? fieldType.name : "unknown");
      } else if (isRefField(fieldType) && fieldType.refType === "union") {
        return isRefField(fieldType) ? fieldType.name : "unknown";
      }
      return "unknown";
    case TypeKind.STRING:
      return "string";
    case TypeKind.USER_REF:
      return "UserRef";
    default:
      fieldType satisfies never;
      return "unknown";
  }
}
