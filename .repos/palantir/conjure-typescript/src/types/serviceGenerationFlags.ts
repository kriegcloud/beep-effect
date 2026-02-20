/**
 * @license
 * Copyright 2025 Palantir Technologies, Inc.
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
export interface IServiceGenerationFlags {
    /**
     * When set to true, generate services whose methods rethrow thrown API errors
     */
    readonly generateThrowingServices: boolean;

    /**
     * When set to true, generate services whose methods return thrown API errors as results
     */
    readonly generateNonThrowingServices: boolean;
}
