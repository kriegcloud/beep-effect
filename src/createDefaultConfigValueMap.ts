/**
 * Copyright 2024 Palantir Technologies, Inc.
 *
 * Licensed under Palantir's License;
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at LICENSE.md
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { asyncValueLoaded, IAsyncValue, IConfigDefinition } from "./types";
import { assertNever, formatDate } from "./utils";
import { IConfigValueMap, IVariableType_WithDefaultValue, IVariableValue } from "./internal";

/**
 * Takes the configDefinition and pulls out the default values, creating a default config values map.
 */
export function createDefaultConfigValueMap(
  configFields: IConfigDefinition
): IConfigValueMap {
  const configValueMap: IConfigValueMap = {};

  configFields.forEach((configField) => {
    switch (configField.field.type) {
      case "single":
        switch (configField.field.fieldValue.type) {
          case "inputOutput":
            configValueMap[configField.fieldId] = {
              type: "single",
              value: variableTypeWithDefaultValueToValue(
                configField.field.fieldValue.variableType
              ),
            };
            return;
          case "event":
            return;
          default:
            assertNever(
              `Unkonwn IConfigDefinitionFieldType type ${configField.field.fieldValue} when creating default config values map`,
              configField.field.fieldValue
            );
        }
        break;
      case "listOf":
        configValueMap[configField.fieldId] = {
          type: "listOf",
          listOfValues: [],
        };
        return;
      default:
        assertNever(
          `Unknown IConfigurationFieldType type ${configField.field} when creating default config values map`,
          configField.field
        );
    }
  });

  return configValueMap;
}

function variableTypeWithDefaultValueToValue(
  variableType: IVariableType_WithDefaultValue
): IAsyncValue<IVariableValue | undefined> {
  // For date and date-list variable types, need to convert from Date to string and Date[] to string[]
  // As we will save date values as strings in format "yyyy-mm-dd"
  if (variableType.type === "date" && variableType.defaultValue != null) {
    return asyncValueLoaded(formatDate(variableType.defaultValue));
  } else if (variableType.type === "date-list" && variableType.defaultValue != null) {
    return asyncValueLoaded(variableType.defaultValue.map(formatDate));
  } 
  return asyncValueLoaded(variableType.defaultValue);
}
