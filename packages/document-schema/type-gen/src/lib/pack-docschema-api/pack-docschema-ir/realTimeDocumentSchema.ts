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
import type { ISchemaVersion } from "../pack-docschema-api/schemaVersion.js";
import type * as IModelDef from "./modelDef.js";
export interface IRealTimeDocumentSchema {
  readonly "name": string;
  readonly "description": string;
  readonly "version": ISchemaVersion;
  /** The primary models. There may be others described internally as nested/sub-models. */
  readonly "primaryModelKeys": ReadonlyArray<IModelTypeKey>;
  readonly "models": {
    readonly [key: IModelTypeKey]: IModelDef.IModelDef;
  };
}
