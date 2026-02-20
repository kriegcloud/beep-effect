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

import invariant from "tiny-invariant";
import type { IRealTimeDocumentSchema } from "../../lib/pack-docschema-api/pack-docschema-ir/index.js";
import { formatVariantName } from "../formatVariantName.js";
import { GENERATED_FILE_HEADER } from "../generatedFileHeader.js";

export interface ModelGeneratorOptions {
  typeImportPath?: string;
  schemaImportPath?: string;
}

export class ModelGenerator {
  constructor(
    private readonly schema: IRealTimeDocumentSchema,
    private readonly options: ModelGeneratorOptions | undefined = undefined,
  ) {}

  public generateModels(): Promise<string> {
    const typeImportPath = this.options?.typeImportPath ?? "./types.js";
    const schemaImportPath = this.options?.schemaImportPath ?? "./schema.js";
    const modelTypesPackage = "@palantir/pack.document-schema.model-types";

    // Generate imports
    let imports =
      `import type { DocumentSchema, RecordModel, UnionModel } from "${modelTypesPackage}";\n`;
    imports += `import { Metadata } from "${modelTypesPackage}";\n`;

    // Collect all type names (primary models + union variants)
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
    imports += `import type { ${typeImports} } from "${typeImportPath}";\n`;

    // Collect all schema names (primary models + union variants)
    const schemaNames = new Set<string>();
    for (const modelKey of this.schema.primaryModelKeys) {
      schemaNames.add(`${modelKey}Schema`);

      const model = this.schema.models[modelKey];
      if (model?.type === "union") {
        for (const variantName of Object.keys(model.union.variants)) {
          const formattedVariantName = formatVariantName(variantName);
          const variantSchemaName = `${model.union.key}${formattedVariantName}Schema`;
          schemaNames.add(variantSchemaName);
        }
      }
    }

    const schemaImports = Array.from(schemaNames).sort().join(", ");
    imports += `import { ${schemaImports} } from "${schemaImportPath}";\n\n`;

    // Generate model constants
    const modelConstants = this.generateModelConstants();

    // Generate DocumentSchema
    const documentSchema = this.generateDocumentSchema();

    return Promise.resolve(
      GENERATED_FILE_HEADER + imports + modelConstants + "\n\n" + documentSchema + "\n",
    );
  }

  private generateModelConstants(): string {
    const constants: string[] = [];
    const processedModels = new Set<string>();

    // Generate models for primary keys and their union variants
    for (const modelKey of this.schema.primaryModelKeys) {
      const model = this.schema.models[modelKey];
      invariant(model != null, `Model not found: ${modelKey}`);

      // Generate primary model constant
      if (!processedModels.has(modelKey)) {
        const discriminant = model.type === "union" ? model.union.discriminant : undefined;
        const modelConstant = this.generateModelConstant(modelKey, modelKey, discriminant);
        constants.push(modelConstant);
        processedModels.add(modelKey);
      }

      // Generate union variant constants
      if (model.type === "union") {
        for (const variantName of Object.keys(model.union.variants)) {
          const formattedVariantName = formatVariantName(variantName);
          const variantTypeName = `${model.union.key}${formattedVariantName}`;

          if (!processedModels.has(variantTypeName)) {
            const modelConstant = this.generateModelConstant(
              variantTypeName,
              variantTypeName,
              model.union.discriminant,
            );
            constants.push(modelConstant);
            processedModels.add(variantTypeName);
          }
        }
      }
    }

    return constants.join("\n\n");
  }

  private generateModelConstant(
    typeName: string,
    modelName: string,
    discriminant?: string,
  ): string {
    const schemaName = `${typeName}Schema`;
    const externalRefFields = this.extractExternalRefFieldTypes(modelName);

    const metadataFields: string[] = [];
    const modelType = discriminant != null ? "UnionModel" : "RecordModel";

    if (discriminant != null) {
      metadataFields.push(`    discriminant: "${discriminant}",`);
    }

    if (externalRefFields.length > 0) {
      const entries = externalRefFields.map(([field, type]) => `      ${field}: "${type}",`).join(
        "\n",
      );
      metadataFields.push(`    externalRefFieldTypes: {\n${entries}\n    },`);
    }

    metadataFields.push(`    name: "${modelName}",`);

    const metadataCode = metadataFields.length > 0 ? `\n${metadataFields.join("\n")}\n  ` : "";

    return `export interface ${modelName}Model extends ${modelType}<${typeName}, typeof ${schemaName}> {}
export const ${modelName}Model: ${modelName}Model = {
  __type: {} as ${typeName},
  zodSchema: ${schemaName},
  [Metadata]: {${metadataCode}},
};`;
  }

  private extractExternalRefFieldTypes(modelName: string): Array<[string, string]> {
    const model = this.schema.models[modelName];
    if (model?.type !== "record") {
      return [];
    }

    const externalRefFields: Array<[string, string]> = [];
    for (const field of model.record.fields) {
      if (field.value.type === "value") {
        const valueType = field.value.value.type;
        if (valueType === "docRef") {
          externalRefFields.push([field.key, "docRef"]);
        } else if (valueType === "mediaRef") {
          externalRefFields.push([field.key, "mediaRef"]);
        } else if (valueType === "object") {
          externalRefFields.push([field.key, "objectRef"]);
        } else if (valueType === "userRef") {
          externalRefFields.push([field.key, "userRef"]);
        }
      }
    }

    return externalRefFields;
  }

  private generateDocumentSchema(): string {
    const modelEntries: string[] = [];
    const processedModels = new Set<string>();

    // Collect all model names that will be generated
    for (const modelKey of this.schema.primaryModelKeys) {
      const model = this.schema.models[modelKey];
      invariant(model != null, `Model not found: ${modelKey}`);

      // Add primary model
      if (!processedModels.has(modelKey)) {
        modelEntries.push(`  ${modelKey}: ${modelKey}Model`);
        processedModels.add(modelKey);
      }

      // Add union variant models
      if (model.type === "union") {
        for (const variantName of Object.keys(model.union.variants)) {
          const formattedVariantName = formatVariantName(variantName);
          const variantTypeName = `${model.union.key}${formattedVariantName}`;

          if (!processedModels.has(variantTypeName)) {
            modelEntries.push(`  ${variantTypeName}: ${variantTypeName}Model`);
            processedModels.add(variantTypeName);
          }
        }
      }
    }

    return `export const DocumentModel = {
${modelEntries.join(",\n")},
  [Metadata]: {
    version: 1,
  },
} as const satisfies DocumentSchema;\n
 export type DocumentModel = typeof DocumentModel;`;
  }
}

export async function generateModelsFromIr(
  schema: IRealTimeDocumentSchema,
  options?: ModelGeneratorOptions,
): Promise<string> {
  const generator = new ModelGenerator(schema, options);
  return generator.generateModels();
}
