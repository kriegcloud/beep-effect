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

import type * as _Core from "@osdk/internal.foundry.core";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
   * A name for a media set branch. Valid branch names must be (a) non-empty, (b) less than 256 characters, and
(c) not a valid ResourceIdentifier.
   *
   * Log Safety: UNSAFE
   */
export type BranchName = LooselyBrandedString<"BranchName">;

/**
 * A resource identifier that identifies a branch of a media set.
 *
 * Log Safety: SAFE
 */
export type BranchRid = LooselyBrandedString<"BranchRid">;

/**
 * Log Safety: UNSAFE
 */
export interface GetMediaItemInfoResponse {
  viewRid: _Core.MediaSetViewRid;
  path?: _Core.MediaItemPath;
  logicalTimestamp: LogicalTimestamp;
  attribution?: MediaAttribution;
}

/**
   * A number representing a logical ordering to be used for transactions, etc.
This can be interpreted as a timestamp in microseconds, but may differ slightly from system clock time due
to clock drift and slight adjustments for the sake of ordering.
Only positive timestamps (representing times after epoch) are supported.
   *
   * Log Safety: SAFE
   */
export type LogicalTimestamp = string;

/**
 * Log Safety: SAFE
 */
export interface MediaAttribution {
  creatorId: _Core.UserId;
  creationTimestamp: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface MediaSet {
  rid: _Core.MediaSetRid;
  name: MediaSetName;
  parentFolderRid: _Core.FolderRid;
}

/**
 * Log Safety: UNSAFE
 */
export type MediaSetName = LooselyBrandedString<"MediaSetName">;

/**
 * Log Safety: SAFE
 */
export interface PutMediaItemResponse {
  mediaItemRid: _Core.MediaItemRid;
}

/**
 * An identifier which represents a transaction on a media set.
 *
 * Log Safety: SAFE
 */
export type TransactionId = string;
