/**
 * @license
 * Copyright 2021 Palantir Technologies, Inc.
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

/**
 * Simple and convenient interface allowing for passing flags through the "generation" code.
 */
export interface ITypeGenerationFlags {
    /**
     * When set to true, compatible alias types will be converted to flavored strings.
     */
    readonly flavorizedAliases: boolean;

    /**
     * When set to true, generated interfaces will have read-only properties and use ReadonlyArray instead of Array.
     */
    readonly readonlyInterfaces: boolean;
}
