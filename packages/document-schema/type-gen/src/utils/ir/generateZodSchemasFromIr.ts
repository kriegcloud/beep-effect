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

import consola from "consola";
import invariant from "tiny-invariant";
import type {
  IFieldDef,
  IFieldTypeUnion,
  IFieldValueUnion,
  IModelDef,
  IRealTimeDocumentSchema,
  IRecordDef,
  IUnionDef,
} from "../../lib/pack-docschema-api/pack-docschema-ir/index.js";
import { assertNever } from "../assertNever.js";
import { formatVariantName } from "../formatVariantName.js";
import { GENERATED_FILE_HEADER } from "../generatedFileHeader.js";

export interface ZodGeneratorOptions {
  namespace?: string;
  includeTypes?: boolean;
  includeCRDT?: boolean;
  typeImportPath?: string;
}

class ZodSchemaGenerator {
  constructor(
    private readonly schema: IRealTimeDocumentSchema,
    private readonly options?: ZodGeneratorOptions,
  ) {}

  public generateSDK(_options: ZodGeneratorOptions): string {
    throw new Error(
      "SDK generation not yet implemented - placeholder for future development",
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async generateTypes(): Promise<string> {
    let imports = "import { z } from 'zod';\n";

    if (this.options?.typeImportPath) {
      imports = "import type { ZodType } from \"zod\";\n" + imports;

      // Collect all type names from the schema (primary models + union variants)
      const typeNames = new Set(this.schema.primaryModelKeys);

      // Add union variant type names
      for (const modelKey of this.schema.primaryModelKeys) {
        const model = this.schema.models[modelKey];
        if (model?.type === "union") {
          for (const variantName of Object.keys(model.union.variants)) {
            const formattedVariantName = formatVariantName(variantName);
            const variantTypeName = `${model.union.key}${formattedVariantName}`;
            typeNames.add(variantTypeName);
          }
        }
      }

      const typeImports = Array.from(typeNames).sort().join(", ");
      imports += `import type { ${typeImports} } from "${this.options.typeImportPath}";\n`;
    }

    imports += "\n";
    const schemasCode = this.generateZodSchemas();
    return GENERATED_FILE_HEADER + imports + schemasCode + "\n";
  }

  private generateZodSchemas(): string {
    const schemaLines: string[] = [];
    const emittedModels = new Set<string>();
    const recordSchemas = new Map<string, string>();
    const unionDefinitions = new Map<string, IUnionDef>();

    // First, categorize all models and generate record schemas
    for (const modelTypeKey of this.schema.primaryModelKeys) {
      const model = this.schema.models[modelTypeKey];
      invariant(model != null, `Model not found: ${modelTypeKey}`);

      switch (model.type) {
        case "record": {
          const schemaCode = this.generateRecordSchema(model.record);
          const satisfiesClause = this.options?.typeImportPath
            ? ` satisfies ZodType<${modelTypeKey}>`
            : "";
          recordSchemas.set(
            modelTypeKey,
            `export const ${modelTypeKey}Schema = ${schemaCode}${satisfiesClause};`,
          );
          break;
        }
        case "union": {
          unionDefinitions.set(modelTypeKey, model.union);
          break;
        }
      }
    }

    // Emit all record schemas first
    for (const [modelTypeKey, schemaCode] of recordSchemas) {
      schemaLines.push(schemaCode);
      emittedModels.add(modelTypeKey);
    }

    // Now handle unions with proper dependency ordering
    const remainingUnions = new Map(unionDefinitions);
    let madeProgress = true;

    while (remainingUnions.size > 0 && madeProgress) {
      madeProgress = false;

      for (const [modelTypeKey, union] of remainingUnions) {
        // Check if all dependencies are already emitted
        const allDependenciesEmitted = Object.values(union.variants).every(
          variantModelKey => emittedModels.has(variantModelKey),
        );

        if (allDependenciesEmitted) {
          // Generate the union with its variant schemas
          const unionSchemas = this.generateUnionWithVariants(union);
          schemaLines.push(unionSchemas);
          emittedModels.add(modelTypeKey);
          remainingUnions.delete(modelTypeKey);
          madeProgress = true;
        }
      }
    }

    // If there are still remaining unions, we have circular dependencies or missing models
    if (remainingUnions.size > 0) {
      consola.warn(
        `Warning: Could not generate schemas for unions due to circular or missing dependencies: ${
          Array.from(remainingUnions.keys()).join(", ")
        }`,
      );
      // Emit them anyway with a comment
      for (const [modelTypeKey, union] of remainingUnions) {
        schemaLines.push(`// Warning: Union ${modelTypeKey} may have unresolved dependencies`);
        const unionSchemas = this.generateUnionWithVariants(union);
        schemaLines.push(unionSchemas);
      }
    }

    return schemaLines.join("\n\n");
  }

  private generateModel(
    model: IModelDef,
  ): string {
    switch (model.type) {
      case "record":
        return this.generateRecordSchema(model.record);
      case "union":
        return this.generateUnionSchema(model.union);
      default:
        assertNever(model);
    }
  }

  private generateRecordSchema(
    record: IRecordDef,
  ): string {
    const fieldEntryLines: string[] = [];
    for (const field of record.fields) {
      const fieldSchema = this.generateFieldSchema(field);
      fieldEntryLines.push(`  ${field.key}: ${fieldSchema}`);
    }
    return `z.object({\n${fieldEntryLines.join(",\n")}\n})`;
  }

  private generateUnionSchema(
    union: IUnionDef,
  ): string {
    // Just return the discriminated union without variant schemas
    const variantSchemaNames: string[] = [];

    for (const [variantName] of Object.entries(union.variants)) {
      const formattedVariantName = formatVariantName(variantName);
      variantSchemaNames.push(`${union.key}${formattedVariantName}Schema`);
    }

    const discriminatorField = union.discriminant || "type";
    return `z.discriminatedUnion("${discriminatorField}", [\n  ${
      variantSchemaNames.join(",\n  ")
    }\n])`;
  }

  private generateUnionWithVariants(
    union: IUnionDef,
  ): string {
    const variantSchemas: string[] = [];
    const variantSchemaNames: string[] = [];

    // Generate variant schemas
    for (const [variantName, variantModelKey] of Object.entries(union.variants)) {
      const formattedVariantName = formatVariantName(variantName);
      const variantSchemaName = `${union.key}${formattedVariantName}Schema`;
      variantSchemaNames.push(variantSchemaName);

      // Look up the model from the schema
      const variantModel = this.schema.models[variantModelKey];
      invariant(variantModel != null, `Model not found: ${variantModelKey}`);

      let variantSchemaCode: string;
      switch (variantModel.type) {
        case "record": {
          // For record variants, reference the existing record schema and extend with discriminator
          const recordKey = variantModel.record.key;
          const discriminatorField = `  ${union.discriminant}: z.literal("${variantName}")`;

          // Extend the existing record schema with the discriminator field
          // Note: We assume records are defined before unions, so we can directly reference them
          variantSchemaCode = `${recordKey}Schema.extend({\n${discriminatorField}\n})`;
          break;
        }
        case "union": {
          // For union variants (nested unions), wrap with discriminator and value
          const unionKey = variantModel.union.key;
          variantSchemaCode =
            `z.object({\n  ${union.discriminant}: z.literal("${variantName}"),\n  value: z.lazy(() => ${unionKey}Schema)\n})`;
          break;
        }
        default:
          assertNever(variantModel);
      }

      // Generate satisfies clause for variant schemas if typeImportPath is provided
      const variantTypeName = `${union.key}${formattedVariantName}`;
      const satisfiesClause = this.options?.typeImportPath
        ? ` satisfies ZodType<${variantTypeName}>`
        : "";
      variantSchemas.push(
        `export const ${variantSchemaName} = ${variantSchemaCode}${satisfiesClause};`,
      );
    }

    // Generate the discriminated union
    const discriminatorField = union.discriminant || "type";
    const unionSchema = `z.discriminatedUnion("${discriminatorField}", [\n  ${
      variantSchemaNames.join(",\n  ")
    }\n])`;

    // Generate satisfies clause for the main union schema if typeImportPath is provided
    const unionSatisfiesClause = this.options?.typeImportPath
      ? ` satisfies ZodType<${union.key}>`
      : "";

    // Return the variant schemas and the union schema
    return variantSchemas.join("\n\n")
      + `\n\nexport const ${union.key}Schema = ${unionSchema}${unionSatisfiesClause};`;
  }

  private generateFieldSchema(
    field: IFieldDef,
  ): string {
    const fieldValueSchemaStr = this.generateFieldTypeSchema(field.value);

    if (field.isOptional) {
      return `${fieldValueSchemaStr}.optional()`;
    }

    return fieldValueSchemaStr;
  }

  private generateFieldTypeSchema(
    fieldType: IFieldTypeUnion,
  ): string {
    switch (fieldType.type) {
      case "array": {
        const arrayElementSchema = this.generateFieldValueSchema(
          fieldType.array.value,
        );
        return `z.array(${arrayElementSchema})`;
      }

      case "map": {
        const keySchema = this.generateFieldValueSchema(
          fieldType.map.key,
        );
        const valueSchema = this.generateFieldValueSchema(
          fieldType.map.value,
        );
        return `z.record(${keySchema}, ${valueSchema})`;
      }
      case "set": {
        const setElementSchema = this.generateFieldValueSchema(
          fieldType.set.value,
        );
        return `z.array(${setElementSchema})`;
      } // Zod doesn't have Set, use array

      case "value":
        return this.generateFieldValueSchema(fieldType.value);

      default:
        assertNever(fieldType);
    }
  }

  private generateFieldValueSchema(
    fieldValue: IFieldValueUnion,
  ): string {
    switch (fieldValue.type) {
      case "boolean":
        return "z.boolean()";

      case "datetime":
        return "z.string().datetime()";

      case "double": {
        let doubleSchema = "z.number()";
        if (fieldValue.double.minValue != null) {
          doubleSchema += `.min(${fieldValue.double.minValue})`;
        }
        if (fieldValue.double.maxValue != null) {
          doubleSchema += `.max(${fieldValue.double.maxValue})`;
        }
        return doubleSchema;
      }

      case "integer": {
        let intSchema = "z.number().int()";
        if (fieldValue.integer.minValue != null) {
          intSchema += `.min(${fieldValue.integer.minValue})`;
        }
        if (fieldValue.integer.maxValue != null) {
          intSchema += `.max(${fieldValue.integer.maxValue})`;
        }
        return intSchema;
      }

      case "modelRef": {
        const refVariantsLines: string[] = [];

        for (const modelType of fieldValue.modelRef.modelTypes) {
          const model = this.schema.models[modelType];
          invariant(model != null, `Model not found: ${modelType}`);

          // Referent the model directly
          if (this.schema.primaryModelKeys.includes(modelType)) {
            return `z.lazy(() => ${modelType}Schema)`;
          }

          // Generate inline model
          // TODO: should not be possible to have recursive nested models but we should guard against it
          return this.generateModel(model);
        }

        if (refVariantsLines.length === 0) {
          return "z.unknown()";
        }

        if (refVariantsLines.length === 1) {
          return refVariantsLines[0]!;
        }

        return `z.union([${refVariantsLines.join(", ")}])`;
      }

      case "string": {
        let stringSchema = "z.string()";
        if (fieldValue.string.minLength != null) {
          stringSchema += `.min(${fieldValue.string.minLength})`;
        }
        if (fieldValue.string.maxLength != null) {
          stringSchema += `.max(${fieldValue.string.maxLength})`;
        }
        return stringSchema;
      }

      case "text":
        return "z.unknown()";

      case "unmanagedJson":
        return "z.unknown()";

      case "docRef":
      case "mediaRef":
      case "object":
      case "userRef":
        return "z.string()"; // Assume these are string IDs

      default:
        assertNever(fieldValue);
    }
  }
}

export async function generateZodSchemasFromIr(
  schema: IRealTimeDocumentSchema,
  options?: ZodGeneratorOptions,
): Promise<string> {
  const generator = new ZodSchemaGenerator(schema, options);
  return generator.generateTypes();
}
