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

import type { Ref, Type } from "./primitives.js";

export const ModelDefType = {
  RECORD: "record",
  UNION: "union",
} as const;

export type ModelDefType = typeof ModelDefType[keyof typeof ModelDefType];

interface ModelDefBase {
  readonly type: ModelDefType;
  readonly name: string;
  readonly docs?: string;
}

export type RecordFields = Record<string, Type>;
export type UnionVariants = Record<string, Ref>;

export interface UnionDef<TVariants extends UnionVariants = UnionVariants> extends ModelDefBase {
  readonly type: typeof ModelDefType.UNION;
  readonly variants: TVariants;
  readonly discriminant: string;
}

export interface RecordDef<TFields extends RecordFields = RecordFields> extends ModelDefBase {
  readonly type: typeof ModelDefType.RECORD;
  readonly fields: TFields;
}

export type ModelDef = RecordDef | UnionDef;
