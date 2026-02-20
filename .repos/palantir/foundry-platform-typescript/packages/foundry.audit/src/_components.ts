/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
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

import type * as _Core from "@osdk/foundry.core";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * The ID of an audit log file
 *
 * Log Safety: SAFE
 */
export type FileId = LooselyBrandedString<"FileId">;

/**
 * Log Safety: UNSAFE
 */
export interface ListLogFilesResponse {
  data: Array<LogFile>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: SAFE
 */
export interface LogFile {
  id: FileId;
}

/**
 * Log Safety: SAFE
 */
export interface Organization {
  rid: _Core.OrganizationRid;
}
