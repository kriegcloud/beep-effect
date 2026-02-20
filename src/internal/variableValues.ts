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
import { ObjectSetLocators } from "../types/objectSetLocators";

/**
 * Until OSDK is able to resolve objects by temporary ObjectRids, primary keys will be used as object locators.
 * Capped to 10,000 primaryKeys.
 */

/**
 * The value types the context holds.
 */
export type SingleVariableValue =
  | boolean
  | number
  | string
  | Date
  | ObjectSetLocators
  | StructValue;
export type IVariableValue = SingleVariableValue | SingleVariableValue[];
export interface StructValue {
  structFields: { [structFieldId: string]: IVariableValue | undefined };
}

/**
 * Until OSDK is able to resolve objects by temporary ObjectSetRid, objectRids will be used when passing objects from the iframe to Workshop
 * Capped to 10,000 objectRids.
 */
export interface ObjectRids {
  objectRids: string[];
}

/**
 * The value types that Workshop is able to accept.
 */
export type SingleVariableValueToSet =
  | boolean
  | number
  | string
  | Date
  | ObjectRids
  | StructValueWithObjectRids;
export type IVariableToSet =
  | SingleVariableValueToSet
  | SingleVariableValueToSet[];
export interface StructValueWithObjectRids {
  structFields: { [structFieldId: string]: IVariableToSet | undefined };
}
