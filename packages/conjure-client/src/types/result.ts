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

import { ConjureError } from "../errors";

/**
 * Represents a successful operation result with an associated type.
 *
 * @template T - The type of the result.
 * @property {T} result - The result of the successful operation.
 */
export interface IConjureSuccess<T> {
    readonly status: "success";
    readonly result: T;
}

/**
 * Represents a failed operation result with an associated error.
 *
 * @template E - The type of the error(s).
 * @property {ConjureError<E>} error - The error of the failed operation.
 */
export interface IConjureFailure<E> {
    readonly status: "failure";
    readonly error: ConjureError<E>;
}

/**
 * Represents the result of an operation that can either be a success or a failure.
 *
 * @template T - The type of the success result.
 * @template E - The type of the error(s).
 * @type {IConjureSuccess<T> | IConjureFailure<E>}
 */
export type IConjureResult<T, E> = IConjureSuccess<T> | IConjureFailure<E>;
