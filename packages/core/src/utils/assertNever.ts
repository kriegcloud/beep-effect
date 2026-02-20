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
 * Assert that a value type is never, useful for compile time exhaustiveness checking.
 *
 * If it is hit at runtime, it may indicate a bug in the code, or an unhandled case
 * for a new value added to a remotely loaded type.
 */
export function assertNever(_x: never): never {
  throw new Error("Hit unreachable code");
}
