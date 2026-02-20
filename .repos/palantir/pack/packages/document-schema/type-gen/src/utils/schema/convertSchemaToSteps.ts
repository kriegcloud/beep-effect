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

import yaml from "js-yaml";
import type { MigrationStep, UnionDefinition } from "../steps/parseMigrationSteps.js";
import type { P } from "./validateSchemaModule.js";

function convertFieldType(field: P.Type): string {
  switch (field.type) {
    case "array":
      return `array<${convertFieldType(field.items as P.Type)}>`;
    case "boolean":
      return "boolean";
    case "docRef":
      return "docRef";
    case "double":
      return "double";
    case "mediaRef":
      return "mediaRef";
    case "objectRef":
      return "objectRef";
    case "optional":
      return `optional<${convertFieldType(field.item as P.Type)}>`;
    case "ref":
      return field.name;
    case "string":
      return "string";
    case "unknown":
      return "unknown";
    case "userRef":
      return "userRef";
    default:
      field satisfies never;
      throw new Error(`Unsupported field type: ${(field as P.Type).type}`);
  }
}

function convertRecordToYaml(
  recordDef: P.RecordDef,
): { docs?: string; fields: Record<string, string> } {
  const result: { docs?: string; fields: Record<string, string> } = {
    fields: {},
  };

  if (recordDef.docs) {
    result.docs = recordDef.docs;
  }

  for (const [fieldName, fieldDef] of Object.entries(recordDef.fields)) {
    const fieldType = convertFieldType(fieldDef);
    result.fields[fieldName] = fieldType;
  }

  return result;
}

function convertUnionToYaml(unionDef: P.UnionDef): UnionDefinition {
  const variants: Record<string, string> = {};

  for (const [variantName, variantRef] of Object.entries(unionDef.variants)) {
    variants[variantName] = variantRef.name;
  }

  const result: UnionDefinition = {
    variants,
  };

  if (unionDef.discriminant !== "type") {
    result.discriminant = unionDef.discriminant;
  }

  return result;
}

export function convertSchemaToSteps(schema: P.ReturnedSchema): MigrationStep[] {
  const steps: MigrationStep[] = [];
  const records: Record<string, { docs?: string; fields: Record<string, string> }> = {};
  const unions: Record<string, UnionDefinition> = {};

  for (const def of Object.values(schema)) {
    switch (def.type) {
      case "record": {
        records[def.name] = convertRecordToYaml(def);
        break;
      }
      case "union": {
        unions[def.name] = convertUnionToYaml(def);
        break;
      }
    }
  }

  if (Object.keys(records).length > 0) {
    steps.push({ "add-records": records });
  }

  if (Object.keys(unions).length > 0) {
    steps.push({ "add-union": unions });
  }

  return steps;
}

export function convertStepsToYamlString(steps: MigrationStep[]): string {
  return yaml.dump(steps, {
    flowLevel: -1,
    lineWidth: -1,
    noRefs: true,
    quotingType: "'",
    forceQuotes: false,
    skipInvalid: false,
  });
}
