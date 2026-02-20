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

import type { IModelTypeKey } from "../pack-docschema-api/modelTypeKey.js";
import type { IFieldDef } from "./fieldDef.js";
import type { ISchemaMeta } from "./schemaMeta.js";
export interface IRecordDef {
  readonly "key": IModelTypeKey;
  readonly "name": string;
  readonly "description"?: string | null;
  readonly "fields": ReadonlyArray<IFieldDef>;
  readonly "meta": ISchemaMeta;
}
