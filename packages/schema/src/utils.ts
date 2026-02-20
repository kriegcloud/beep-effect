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

import type { ModelDef, RecordDef, UnionDef } from "./defs.js";
import { ModelDefType } from "./defs.js";
import type { Ref } from "./primitives.js";
import { TypeKind } from "./primitives.js";

/**
 * Helper function to safely transform a record definition to a reference.
 * This function helps TypeScript track type transformations better.
 */
export function modelToRef(model: ModelDef): Ref {
  return createRef(model.name, model.type);
}

/**
 * Helper function to create a reference with proper typing.
 * This avoids type assertions in multiple places.
 */
export function createRef(name: string, refType: "record" | "union"): Ref {
  return {
    type: TypeKind.REF,
    name,
    refType,
  };
}

/**
 * Type guard to check if a value is a RecordDef
 */
export function isRecordDef(value: unknown): value is RecordDef {
  return value != null
    && typeof value === "object"
    && "type" in value
    && value.type === ModelDefType.RECORD
    && "fields" in value;
}

/**
 * Type guard to check if a value is a UnionDef
 */
export function isUnionDef(value: unknown): value is UnionDef {
  return value != null
    && typeof value === "object"
    && "type" in value
    && value.type === ModelDefType.UNION
    && "variants" in value;
}
