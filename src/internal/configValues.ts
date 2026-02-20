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
import { IAsyncValue } from "../types/loadingState";
import { IVariableValue } from "./variableValues";

/**
 * This is the mapping of values that Workshop and iframe will pass back and forth
 */
export interface IConfigValueMap {
  [fieldId: string]: IConfigValueType;
}
export type IConfigValueType =
  | IConfigValueType_Single
  | IConfigValueType_ListOf;
export interface IConfigValueType_Single {
  type: "single";
  value: IAsyncValue<IVariableValue | undefined>;
}
export interface IConfigValueType_ListOf {
  type: "listOf";
  listOfValues: IConfigValueMap[];
}
