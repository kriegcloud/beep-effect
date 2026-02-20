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

export type Branded<Brand extends string, T = string> =
  & T
  & Readonly<{
    readonly __pack_brand: Brand;
  }>;

/**
 * A type that is "flavored" for self documenting code and prevents some accidental misuse.
 * This is similar to {@link Branded} but allows implicit use of T without a type assertion,
 * which is useful for stronger typing within certain systems without forcing it for all
 * external uses.
 *
 * Flavored types with different brands will not match.
 * A Branded type with the same brand will implicitly match a Flavored type with the same brand,
 * ie `const foo: Flavored<"foo"> = "foo" as Branded<"foo">`
 *
 * @example
 * type MyId = Flavored<"MyId">;
 * type OtherId = Flavored<"OtherId">;
 * const id: MyId = "my-id"; // Good: No type assertion needed
 * const otherId: OtherId = id; // Error: Type 'MyId' is not assignable to type 'OtherId'
 * const otherId: OtherId = id as OtherId; // You can assert between flavored types directly
 */
export type Flavored<Flavor extends string, T = string> =
  & T
  & Readonly<{
    readonly __pack_brand?: Flavor;
  }>;
