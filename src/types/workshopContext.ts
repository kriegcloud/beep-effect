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
import {
  IStructVariableFieldTypes_WithDefaultValue,
  IVariableType_WithDefaultValue,
} from "../internal";
import { IConfigDefinition, IConfigDefinitionField } from "./configDefinition";
import { IAsyncValue } from "./loadingState";
import { ObjectSetLocators } from "./objectSetLocators";
import { OntologyObject } from "./ontologyObject";

/**
 * Available methods for fields of type "event".
 */
export interface ExecutableEvent {
  /**
   * Execute the callback. If you're executing based on a mouse click,
   * then please pass the mouse event too. This allows the framework to
   * choose to open things in new tabs if e.g. the CTRL button is pressed.
   */
  executeEvent: (mouseEvent?: MouseEvent) => void;
}

/**
 * Available properties and methods for fields of type "inputOutput".
 */
export type ValueAndSetterMethods<T extends IVariableType_WithDefaultValue> = {
  /**
   * Retrieve the value at this field.
   * This will be updated when the corresponding variable in Workshop's config experiences a change in value or async loaded state.
   */
  fieldValue: IAsyncValue<VariableTypeToValueType<T> | undefined>;

  /**
   * Set the value at this field to be "loaded" with a value.
   * This will notify Workshop and the corresponding variable will have its value updated.
   */
  setLoadedValue: StronglyTypedSetterFunction<T>;

  /**
   * Set the value at this field to be "loading".
   * This will notify Workshop and the corresponding variable will go into a loading state.
   */
  setLoading: () => void;

  /**
   * Set the value at this field to be "reloading" with a value.
   * This will notify Workshop and the corresponding variable will go into a reloading state with a value.
   */
  setReloadingValue: StronglyTypedSetterFunction<T>;

  /**
   * Set the value at this field to be "failed" with an error.
   * This will notify Workshop and the corresponding variable will go into a failed loading state with an error.
   */
  setFailedWithError: (error: string) => void;
};

/**
 * Mapped type from variable type to storage value type.
 * Identical to VariableTypeToValueTypeToSet, except the value of an objectSet in the Workshop context is based on ObjectSetLocators.
 */
export type VariableTypeToValueType<T extends IVariableType_WithDefaultValue> =
  T extends { type: "string" }
    ? string
    : T extends { type: "boolean" }
    ? boolean
    : T extends { type: "number" }
    ? number
    : T extends { type: "date" }
    ? string // in the format "yyyy-mm-dd"
    : T extends { type: "timestamp" }
    ? Date
    : T extends { type: "objectSet" }
    ? ObjectSetLocators
    : T extends { type: "temporaryObjectSetRid" }
    ? string
    : T extends { type: "string-list" }
    ? string[]
    : T extends { type: "boolean-list" }
    ? boolean[]
    : T extends { type: "number-list" }
    ? number[]
    : T extends { type: "date-list" }
    ? string[] // each string in array is in the format "yyyy-mm-dd"
    : T extends { type: "timestamp-list" }
    ? Date[]
    : T extends {
        type: "struct";
        structFieldTypes: readonly IStructVariableFieldTypes_WithDefaultValue[];
      }
    ? {
        structFields: {
          [K in T["structFieldTypes"][number]["fieldId"]]:
            | VariableTypeToValueType<
                ExtractFieldType<T["structFieldTypes"], K>
              >
            | undefined;
        };
      }
    : never;

/**
 * Mapped type from variable type to setter method value type.
 * Identical to VariableTypeToValueType, except the value of an objectSet to be set in Workshop consists of ObjectRids.
 */
export type VariableTypeToValueTypeToSet<
  T extends IVariableType_WithDefaultValue
> = T extends { type: "string" }
  ? string
  : T extends { type: "boolean" }
  ? boolean
  : T extends { type: "number" }
  ? number
  : T extends { type: "date" } | { type: "timestamp" }
  ? Date
  : T extends { type: "objectSet" }
  ? OntologyObject[]
  : T extends { type: "temporaryObjectSetRid" }
  ? string
  : T extends { type: "string-list" }
  ? string[]
  : T extends { type: "boolean-list" }
  ? boolean[]
  : T extends { type: "number-list" }
  ? number[]
  : T extends { type: "date-list" } | { type: "timestamp-list" }
  ? Date[]
  : T extends {
      type: "struct";
      structFieldTypes: readonly IStructVariableFieldTypes_WithDefaultValue[];
    }
  ? {
      structFields: {
        [K in T["structFieldTypes"][number]["fieldId"]]:
          | VariableTypeToValueTypeToSet<
              ExtractFieldType<T["structFieldTypes"], K>
            >
          | undefined;
      };
    }
  : never;

/**
 * Mapped type to extract field types on structs.
 */
export type ExtractFieldType<
  Fields extends readonly IStructVariableFieldTypes_WithDefaultValue[],
  FieldId extends string
> = Fields extends readonly (infer F extends IStructVariableFieldTypes_WithDefaultValue)[]
  ? F extends { fieldId: FieldId }
    ? F["fieldType"]
    : never
  : never;

/**
 * Mapped type to ensure setter methods expect the correct variable type as an argument when setting the value.
 */
export type StronglyTypedSetterFunction<
  T extends IVariableType_WithDefaultValue
> = (value: VariableTypeToValueTypeToSet<T> | undefined) => void;

/**
 * The consumers of useWorkshopContext have access to the following per field:
 *
 * If the field type if "inputOutput": a fieldValue property holding the value of the field, and various async setter methods to
 * change the value in Workshop.
 *
 * If the field type is "event": an executeEvent method when called will execute an event in Workshop
 */
export type IWorkshopContext<T extends IConfigDefinition> = {
  [K in T[number] as K["fieldId"]]: K["field"] extends {
    type: "single";
    fieldValue: { type: "inputOutput" };
  }
    ? ValueAndSetterMethods<K["field"]["fieldValue"]["variableType"]>
    : K["field"] extends { type: "single"; fieldValue: { type: "event" } }
    ? ExecutableEvent
    : K["field"] extends {
        type: "listOf";
        config: readonly IConfigDefinitionField[];
      }
    ? IWorkshopContext<K["field"]["config"]>[]
    : never;
};

/**
 * Valid types for IWorkshopContext
 */
export type IWorkshopContextField<
  T extends IConfigDefinition,
  V extends IVariableType_WithDefaultValue
> = ValueAndSetterMethods<V> | ExecutableEvent | IWorkshopContext<T>[];

/**
 * Options for useWorkshopContext
 */
export interface IWorkshopContextOptions {
  /**
   * If true, the returned context will include the setAutoMaxHeight function.
   * Default is false for backward compatibility.
   */
  enableSetAutoMaxHeight?: boolean;
}

/**
 * Interface for the height control functionality
 */
export interface IHeightControl {
  /**
   * Sets the maximum height of the iframe in Workshop.
   * Only has an effect when the app is running inside an iframe AND
   * the Workshop widget's height is set to "auto (max)".
   * @param height The maximum height in pixels
   */
  setAutoMaxHeight: (height: number) => void;
}

/**
 * Extends the IWorkshopContext with a setHeight function
 */
export type IWorkshopContextWithHeight<T extends IConfigDefinition> = { context: IWorkshopContext<T> } & IHeightControl;
