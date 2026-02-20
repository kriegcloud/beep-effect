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

import type * as P from "@palantir/pack.schema";
import invariant from "tiny-invariant";
import type {
  IModelTypeKey,
  IUnionVariantKey,
} from "../../lib/pack-docschema-api/pack-docschema-api";
import type {
  IFieldDef,
  IRealTimeDocumentSchema,
  IRecordDef,
  IUnionDef,
} from "../../lib/pack-docschema-api/pack-docschema-ir/index.js";
import {
  IFieldTypeUnion,
  IFieldValueUnion,
  IModelDef,
} from "../../lib/pack-docschema-api/pack-docschema-ir/index.js";
import { assertNever } from "../assertNever.js";
import { convertStepsToSchema } from "./convertStepsToSchema.js";
import type { MigrationStep } from "./parseMigrationSteps.js";

export interface SchemaMetadata {
  readonly name?: string;
  readonly description?: string;
  readonly version?: number;
}

/**
 * Converts migration steps to Palantir IR format
 */
export function convertStepsToIr(
  steps: readonly MigrationStep[],
  metadata?: SchemaMetadata,
): IRealTimeDocumentSchema {
  // First convert steps to document-schema-api format
  const { recordDefinitions, unionDefinitions } = convertStepsToSchema(steps as MigrationStep[]);

  const schema = {
    ...Object.fromEntries(recordDefinitions.map(def => [def.name, def])),
    ...Object.fromEntries(unionDefinitions.map(def => [def.name, def])),
  };

  return convertSchemaToIr(schema, metadata);
}

/**
 * Converts record and union definitions to Palantir IR format
 */
export function convertSchemaToIr(
  inputSchema: P.Schema<P.ReturnedSchema>,
  metadata?: SchemaMetadata,
): IRealTimeDocumentSchema {
  const primaryModelKeys: IModelTypeKey[] = [];
  const models = new Map<IModelTypeKey, IModelDef>();

  for (const modelDef of Object.values(inputSchema)) {
    if (collectModels(modelDef, models)) {
      primaryModelKeys.push(modelDef.name);
    }
  }

  return {
    name: metadata?.name ?? "Generated Schema",
    description: metadata?.description ?? "Schema generated from migration steps",
    version: metadata?.version ?? 1,
    primaryModelKeys,
    models: Object.fromEntries(models),
  };
}

function collectModels(
  modelDef: P.ModelDef,
  outModels: Map<IModelTypeKey, IModelDef>,
): boolean {
  invariant(
    !outModels.has(modelDef.name),
    `Duplicate model definition: ${modelDef.name}`,
  );

  switch (modelDef.type) {
    case "record": {
      outModels.set(modelDef.name, IModelDef.record(convertRecordDefToIr(modelDef)));
      return true;
    }
    case "union": {
      outModels.set(modelDef.name, IModelDef.union(convertUnionDefToIr(modelDef)));
      return true;
    }
    default:
      assertNever(modelDef);
  }
}

export function convertRecordDefToIr(recordDef: P.RecordDef): IRecordDef {
  const fields = Object.entries(recordDef.fields).map(([fieldKey, fieldType]): IFieldDef => ({
    key: fieldKey,
    name: fieldKey,
    description: undefined,
    value: convertTypeToFieldTypeUnion(fieldType),
    meta: { addedIn: 1 },
    isOptional: fieldType.type === "optional" ? true : undefined,
  }));

  return {
    key: recordDef.name,
    name: recordDef.name,
    description: recordDef.docs || undefined,
    fields,
    meta: { addedIn: 1 },
  };
}

export function convertUnionDefToIr(unionDef: P.UnionDef): IUnionDef {
  const variantEntries = Object.entries(unionDef.variants).map((
    [variantName, modelRef],
  ) =>
    [
      variantName as IUnionVariantKey,
      modelRef.name as IModelTypeKey,
    ] as const
  );

  return {
    key: unionDef.name,
    name: unionDef.name,
    description: unionDef.docs,
    discriminant: unionDef.discriminant,
    variants: Object.fromEntries(variantEntries),
    meta: { addedIn: 1 },
  };
}

// TODO: rename to convertSchemaTypeToFieldTypeUnion
export function convertTypeToFieldTypeUnion(schemaType: P.Type): IFieldTypeUnion {
  switch (schemaType.type) {
    case "array": {
      const arrayType = schemaType as P.Array;
      return IFieldTypeUnion.array({
        allowNullValue: false,
        value: convertTypeToFieldValueUnion(arrayType.items as P.Type),
      });
    }
    // TODO: have map/set types in document-schema-api

    case "optional": {
      // Optional flag is handled at field level, but we need to unwrap the inner type
      const optionalType = schemaType as P.Optional;
      return convertTypeToFieldTypeUnion(optionalType.item as P.Type);
    }

    case "boolean":
    case "docRef":
    case "double":
    case "mediaRef":
    case "objectRef":
    case "ref":
    case "string":
    case "unknown":
    case "userRef":
      return IFieldTypeUnion.value(convertTypeToFieldValueUnion(schemaType));

    default:
      assertNever(schemaType);
  }
}

function convertTypeToFieldValueUnion(schemaType: P.Type): IFieldValueUnion {
  switch (schemaType.type) {
    case "array":
      // TODO: fix the argument types so these aren't possible
      invariant(
        false,
        `Collection type passed to convertTypeToFieldValueUnion: ${schemaType.type}`,
      );

    case "boolean":
      return IFieldValueUnion.boolean({});

    case "docRef":
      return IFieldValueUnion.docRef({
        documentTypeRids: [], // FIXME: confirm whether we will use rids in the deployed schema.
      });

    case "double":
      return IFieldValueUnion.double({});

    case "mediaRef":
      return IFieldValueUnion.mediaRef({
        mediaTypeRids: [], // FIXME: confirm whether we will use rids in the deployed schema.
      });

    case "objectRef":
      return IFieldValueUnion.object({
        // FIXME: confirm whether we will use rids in the deployed schema.
        interfaceTypeRids: [],
        objectTypeRids: [],
      });

    case "optional": {
      // If we get here, it means we have nested optionals - unwrap and continue
      // TODO: probably warn? maybe throw
      const optionalType = schemaType as P.Optional;
      return convertTypeToFieldValueUnion(optionalType.item as P.Type);
    }

    case "ref":
      return IFieldValueUnion.modelRef({
        modelTypes: [schemaType.name as IModelTypeKey],
      });

    case "string":
      return IFieldValueUnion.string({});

    case "unknown":
      return IFieldValueUnion.unmanagedJson({});

    case "userRef":
      return IFieldValueUnion.userRef({});

    default:
      assertNever(schemaType);
  }
}
