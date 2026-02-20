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
import { IConfigDefinition, IWorkshopContext } from "../types";
import {
  ExecutableEvent,
  IWorkshopContextField,
  ValueAndSetterMethods,
} from "../types/workshopContext";
import { assertNever } from "../utils";
import {
  IConfigValueMap,
  ILocator,
  IVariableType_WithDefaultValue,
} from "../internal";
import {
  createExecuteEventCallback,
  createSetFailedWithErrorCallback,
  createSetLoadedValueCallback,
  createSetLoadingCallback,
  createSetReloadingValueCallback,
} from "./transformConfigCallbacks";

/**
 * A recursive transformation function that given a config definition, returns a context object with
 * strongly typed properties and property value types from a given config definition.
 *
 * @param config: IConfigDefinition, a list of config fields and their full definition.
 * @param configValues: the map of values that populates the values of the config's properties.
 * @param opts: optionally contains a callback function `createLocatorInListCallback` to create a nested ILocator,
 * which is used when calling the function recursively.
 *
 * @returns IWorkshopContext, the context object.
 */
export function transformConfigWorkshopContext<
  T extends IConfigDefinition,
  V extends IVariableType_WithDefaultValue
>(
  config: T,
  configValues: IConfigValueMap,
  setConfigValues: React.Dispatch<React.SetStateAction<IConfigValueMap>>,
  iframeWidgetId: string | undefined,
  opts?: {
    createLocatorInListCallback: (locator: ILocator) => ILocator;
  }
): IWorkshopContext<T> {
  const workshopContext: { [fieldId: string]: IWorkshopContextField<T, V> } =
    {};

  // Populate the context object from the config fields
  config.forEach((fieldDefinition) => {
    const { fieldId, field } = fieldDefinition;
    switch (field.type) {
      case "single": {
        const locator: ILocator =
          opts == null
            ? { type: "single", configFieldId: fieldId }
            : opts.createLocatorInListCallback({
                type: "single",
                configFieldId: fieldId,
              });
        switch (field.fieldValue.type) {
          case "event": {
            workshopContext[fieldId] = {
              executeEvent: createExecuteEventCallback(iframeWidgetId, locator),
            } as ExecutableEvent;
            return;
          }
          case "inputOutput": {
            workshopContext[fieldId] = {
              fieldValue:
                configValues[fieldId] != null &&
                configValues[fieldId].type === "single"
                  ? configValues[fieldId].value
                  : undefined,
              setLoading: createSetLoadingCallback(iframeWidgetId, setConfigValues, locator),
              setLoadedValue: createSetLoadedValueCallback(
                iframeWidgetId,
                setConfigValues,
                locator,
                field.fieldValue.variableType
              ),
              setReloadingValue: createSetReloadingValueCallback(
                iframeWidgetId,
                setConfigValues, 
                locator,
                field.fieldValue.variableType
              ),
              setFailedWithError: createSetFailedWithErrorCallback(
                iframeWidgetId,
                setConfigValues,
                locator
              ),
            } as ValueAndSetterMethods<typeof field.fieldValue.variableType>;
            return;
          }
          default:
            assertNever(
              `Unknown IConfigDefinitionFieldType ${field.fieldValue} when`,
              field.fieldValue
            );
        }
        break;
      }
      case "listOf":
        if (
          configValues[fieldId] != null &&
          configValues[fieldId].type === "listOf"
        ) {
          const listOfValues = configValues[fieldId].listOfValues;
          if (listOfValues != null && listOfValues.length > 0) {
            workshopContext[fieldId] = listOfValues.map((listOfValue, index) =>
              transformConfigWorkshopContext(
                field.config,
                listOfValue,
                setConfigValues,
                iframeWidgetId,
                {
                  createLocatorInListCallback: getCreateLocator(fieldId, index),
                }
              )
            );
          }
        } else {
          workshopContext[fieldId] = [];
        }
        return;
      default:
        assertNever(
          `Unknown IConfigurationFieldType type ${field} when`,
          field
        );
    }
  });

  return workshopContext as IWorkshopContext<T>;
}

/** 
 * Returns a function to be passed to recursive calls of transformConfigWorkshopContext
 * which will create the tree path to the nested value in a listOf field.
 */
const getCreateLocator =
  (configFieldId: string, index: number) =>
  (locator: ILocator): ILocator => {
    return {
      type: "listOf",
      configFieldId,
      index,
      locator,
    };
  };
