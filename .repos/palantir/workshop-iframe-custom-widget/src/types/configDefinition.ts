/**
Copyright 2024 Palantir Technologies, Inc.

Licensed under Palantir's License;
you may not use this file except in compliance with the License.
You may obtain a copy of the License from the root of this repository at LICENSE.md

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
import { IVariableType_WithDefaultValue } from "../internal/variableTypeWithDefaultValue";

/**
 * The config definition consists of a readonly list of config fields.
 * Ensure that there are no duplicate fieldIds in each of the config fields.
 */
export type IConfigDefinition = readonly IConfigDefinitionField[];

/**
 * A config field consists of a fieldId and the field content specifications.
 *
 * @field fieldId: this string is translated into the property name in the context object.
 */
export interface IConfigDefinitionField {
  fieldId: string;
  field: IConfigurationFieldType;
}
export type IConfigurationFieldType =
  | IConfigDefinitionFieldType_Single
  | IConfigDefinitionFieldType_ListOf;

interface IConfigDefinitionFieldType_Single {
  type: "single";
  fieldValue: IConfigDefinitionFieldType;
  label: string;
  helperText?: string;
}

export type IConfigDefinitionFieldType =
  | IConfigDefinitionFieldType_InputOutput
  | IConfigDefinitionFieldType_Event;
interface IConfigDefinitionFieldType_InputOutput {
  type: "inputOutput";
  variableType: IVariableType_WithDefaultValue;
}
interface IConfigDefinitionFieldType_Event {
  type: "event";
}

interface IConfigDefinitionFieldType_ListOf {
  type: "listOf";
  config: IConfigDefinition;
  label: string;
  helperText?: string;
  addButtonText?: string;
}
