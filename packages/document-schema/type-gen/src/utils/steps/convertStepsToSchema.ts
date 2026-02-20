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

import {
  modelToRef,
  type RecordDef,
  type Ref,
  type Type,
  type UnionDef,
} from "@palantir/pack.schema";
import type { MigrationStep, RecordFieldDefinition } from "./parseMigrationSteps.js";

export function convertStepsToSchema(steps: MigrationStep[]): {
  recordDefinitions: RecordDef[];
  unionDefinitions: UnionDef[];
} {
  const localFragmentsByName: Record<string, Record<string, string>> = {};
  const recordDefinitionsByName: Record<string, RecordDef> = {};
  const unionDefinitionsByName: Record<string, UnionDef> = {};

  for (const step of steps) {
    if ("local-fragment" in step) {
      const localFragment = step["local-fragment"]!;
      Object.assign(localFragmentsByName, localFragment);
    }

    const addRecords = step["add-records"];
    if (addRecords) {
      for (const [recordKey, recordDef] of Object.entries(addRecords)) {
        const recordFields: Record<string, RecordFieldDefinition> = {};
        for (const localFragmentName of recordDef.extends ?? []) {
          const localFragment = localFragmentsByName[localFragmentName];
          Object.assign(recordFields, localFragment);
        }
        for (const [fieldKey, fieldDefinition] of Object.entries(recordDef.fields)) {
          recordFields[fieldKey] = fieldDefinition;
        }

        const recordFieldsAsSchemaType: Record<string, Type> = {};
        for (const [fieldKey, fieldDefinition] of Object.entries(recordFields)) {
          recordFieldsAsSchemaType[fieldKey] = recordFieldDefinitionToSchemaType(fieldDefinition);
        }

        recordDefinitionsByName[recordKey] = {
          type: "record",
          name: recordKey,
          fields: recordFieldsAsSchemaType,
          docs: recordDef.docs,
        };
      }
    }

    if ("add-union" in step) {
      const addUnion = step["add-union"]!;
      for (const [unionKey, unionDef] of Object.entries(addUnion)) {
        const discriminant = unionDef.discriminant ?? "type";

        const variants: Record<string, Ref> = {};
        for (const [typeKey, recordKey] of Object.entries(unionDef.variants)) {
          const recordDef = recordDefinitionsByName[recordKey];
          if (!recordDef) {
            throw new Error(`Record ${recordKey} not found`);
          }
          variants[typeKey] = modelToRef(recordDef);
        }

        unionDefinitionsByName[unionKey] = {
          discriminant,
          docs: undefined,
          name: unionKey,
          type: "union",
          variants,
        };
      }
    }

    if ("modify-records" in step) {
      const modifyRecords = step["modify-records"]!;
      for (const [recordKey, modifyRecord] of Object.entries(modifyRecords)) {
        const recordDef = recordDefinitionsByName[recordKey];
        if (!recordDef) {
          throw new Error(`Record ${recordKey} not found`);
        }
        for (const [fieldKey, fieldDefinition] of Object.entries(modifyRecord["add-fields"])) {
          recordDef.fields[fieldKey] = recordFieldDefinitionToSchemaType(fieldDefinition);
        }
      }
    }
  }

  return {
    recordDefinitions: Object.values(recordDefinitionsByName),
    unionDefinitions: Object.values(unionDefinitionsByName),
  };
}

function recordFieldDefinitionToSchemaType(
  recordFieldDefinition: RecordFieldDefinition,
): Type {
  if (typeof recordFieldDefinition === "string") {
    // Basic types
    if (recordFieldDefinition === "docRef") {
      return { type: "docRef" };
    }
    if (recordFieldDefinition === "double") {
      return { type: "double" };
    }
    if (recordFieldDefinition === "mediaRef") {
      return { type: "mediaRef" };
    }
    if (recordFieldDefinition === "objectRef") {
      return { type: "objectRef" };
    }
    if (recordFieldDefinition === "string") {
      return { type: "string" };
    }
    if (recordFieldDefinition === "userRef") {
      return { type: "userRef" };
    }

    // Array types - e.g., "array<string>", "list<double>"
    const arrayMatch = recordFieldDefinition.match(/^(?:array|list)<(.+)>$/);
    if (arrayMatch?.[1]) {
      const innerType = recordFieldDefinitionToSchemaType(arrayMatch[1]);
      return { type: "array", items: innerType };
    }

    // Optional types - e.g., "optional<string>"
    const optionalMatch = recordFieldDefinition.match(/^optional<(.+)>$/);
    if (optionalMatch?.[1]) {
      const innerType = recordFieldDefinitionToSchemaType(optionalMatch[1]);
      return { type: "optional", item: innerType };
    }

    // Capitalized names are assumed to be references to other records or unions
    if (
      recordFieldDefinition.charAt(0)
        === recordFieldDefinition.charAt(0).toUpperCase()
    ) {
      return {
        type: "ref",
        refType: "record", // Could be union, but we assume record for now
        name: recordFieldDefinition,
      };
    }
  }
  throw new Error(
    "Invalid record field definition " + JSON.stringify(recordFieldDefinition),
  );
}
