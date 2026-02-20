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

import type { ModelDef, UnionDef } from "./defs.js";
import { ModelDefType } from "./defs.js";
import type { Ref } from "./primitives.js";
import { TypeKind } from "./primitives.js";
import { modelToRef } from "./utils.js";

export type UnionVariantArgExplicit = Ref | ModelDef;
export type UnionVariantArg = UnionVariantArgExplicit | (() => UnionVariantArgExplicit);
export type UnionVariantArgs = Record<string, UnionVariantArg>;

export type ResolvedUnionVariants<T extends UnionVariantArgs> = {
  readonly [K in keyof T]: Ref;
};

export type UnionArgs<T extends UnionVariantArgs> = {
  /**
   * The field name used to discriminate between union variants.
   *
   * @default "type"
   */
  readonly discriminant?: string;
  readonly docs: string;
  readonly variants: T;
};

export function defineUnion<const TVariants extends UnionVariantArgs>(
  name: string,
  {
    discriminant = "type",
    docs,
    variants,
  }: UnionArgs<TVariants>,
): UnionDef<ResolvedUnionVariants<TVariants>> {
  const entries = Object.entries(variants).map(
    ([key, value]) => [key, resolveUnionVariantArg(value)] as const,
  );

  const resolvedVariants = Object.fromEntries(entries) as ResolvedUnionVariants<TVariants>;

  return {
    type: ModelDefType.UNION,
    discriminant,
    name,
    docs,
    variants: resolvedVariants,
  };
}

export function resolveUnionVariantArg(arg: UnionVariantArg): Ref {
  const resolved = typeof arg === "function" ? arg() : arg;
  return resolved.type === TypeKind.REF ? resolved : modelToRef(resolved);
}
