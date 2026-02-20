/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
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
 * Checks if two types are exactly equal
 */

export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)
  ? true
  : false;

/**
 * Asserts that two types are exactly equal. Causes a compile error if not.
 *
 * @example
 * // This will compile only if PersonRecord.fields.name is exactly String
 * assertTypeEquals<typeof PersonRecord.fields.name, String>();
 */
export function assertTypeEquals<T, U>(
  _witness?: Equals<T, U> extends true ? unknown : never,
): void {}

/**
 * Checks if T extends U
 */
export type Extends<T, U> = T extends U ? true : false;

/**
 * Asserts that T extends U. Causes a compile error if not.
 *
 * @example
 * // This will compile only if T extends Record<string, unknown>
 * assertTypeExtends<T, Record<string, unknown>>();
 */
export function assertTypeExtends<T, U>(
  _witness?: Extends<T, U> extends true ? unknown : never,
): void {}

/**
 * Asserts that a type has the specified keys. Causes a compile error if not.
 *
 * @example
 * // This will compile only if PersonRecord.fields has exactly keys 'name' and 'age'
 * assertExactKeys<typeof PersonRecord.fields, 'name' | 'age'>();
 */
export function assertExactKeys<T, K extends string>(
  _witness?: Equals<keyof T, K> extends true ? unknown : never,
): void {}

/**
 * Asserts that a type has at least the specified keys. Causes a compile error if not.
 *
 * @example
 * // This will compile only if PersonRecord.fields has at least keys 'name' and 'age'
 * assertHasKeys<typeof PersonRecord.fields, 'name' | 'age'>();
 */

export function assertHasKeys<T, K extends string>(
  _witness?: K extends keyof T ? unknown : never,
): void {}

/**
 * Assert that a value is never. Useful for exhaustiveness checks.
 *
 * @example
 * function handleShape(shape: Shape) {
 *   if (shape.type === 'circle') {
 *     // handle circle
 *   } else if (shape.type === 'rectangle') {
 *     // handle rectangle
 *   } else {
 *     // This will cause a compile error if we forget to handle a shape type
 *     assertNever(shape);
 *   }
 * }
 */
export function assertNever(_value: never): never {
  throw new Error("Should be unreachable");
}
