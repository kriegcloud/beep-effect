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

export { cli } from "./cli.js";
export { registerIrCommands } from "./commands/ir/registerIrCommands.js";
export { registerSchemaCommands } from "./commands/schema/registerSchemaCommands.js";
export { registerStepsCommands } from "./commands/steps/registerStepsCommands.js";
export { generateZodSchemasFromIr } from "./utils/ir/generateZodSchemasFromIr.js";
export {
  convertSchemaToSteps,
  convertStepsToYamlString,
} from "./utils/schema/convertSchemaToSteps.js";
export { generateTypesFromSchema } from "./utils/schema/generateTypesFromSchema.js";
export { generateZodFromSchema } from "./utils/schema/generateZodFromSchema.js";
export {
  convertRecordDefToIr,
  convertSchemaToIr,
  convertStepsToIr,
  convertTypeToFieldTypeUnion,
  type SchemaMetadata,
} from "./utils/steps/convertStepsToIr.js";
export { generateZodFromStepsSchema } from "./utils/steps/generateZodFromStepsSchema.js";
