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

import type { WithMetadata } from "./Metadata.js";
import type { Model, ModelData } from "./Model.js";

/**
 * The base type for an application sdk's generated document schema.
 */
export interface DocumentSchema extends WithMetadata<DocumentSchemaMetadata> {
  readonly [modelName: string]: Model;
}

/**
 * The plain object representation of the state of a document.
 */
export type DocumentState<S extends DocumentSchema> = {
  readonly [K in Exclude<keyof S, symbol>]: { readonly [key: string]: ModelData<S[K]> };
};

export interface DocumentSchemaMetadata {
  readonly version: number;
}
