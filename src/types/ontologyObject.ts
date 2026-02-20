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
 * A subset of osdk's OntologyObject
 */
export interface OntologyObject {
  $rid: string;
  $primaryKey: string | number;
}

/**
 * A helper function to determine whether an unknown value can be attributed to an OntologyObject.
 *
 * @param value: any value
 * @returns true only if value can be attributed to an OntologyObject
 */
export const isOntologyObject = (value: unknown): value is OntologyObject => {
  return (
    typeof value === "object" &&
    value != null &&
    "$rid" in value &&
    typeof value.$rid === "string" &&
    "$primaryKey" in value &&
    (typeof value.$primaryKey === "string" ||
      typeof value.$primaryKey === "number")
  );
};
