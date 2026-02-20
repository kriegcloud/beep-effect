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

/**
 * Represents the path to a field's value in the config, and is used to traverse the tree of values in the context object.
 */
export type ILocator = ILocator_Single | ILocator_ListOf;
export interface ILocator_Single {
  type: "single";
  configFieldId: string;
}
export interface ILocator_ListOf {
  type: "listOf";
  configFieldId: string;
  index: number;
  locator: ILocator;
}
