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
 * Log Safety: UNSAFE
 */
export interface DevModeSettings {
  status: DevModeStatus;
  widgetSetSettings: Record<WidgetSetRid, WidgetSetDevModeSettings>;
}

/**
 * The user's global development mode status for widget sets.
 *
 * Log Safety: SAFE
 */
export type DevModeStatus = "ENABLED" | "PAUSED" | "DISABLED";

/**
 * A locator for a specific file in a widget set's release directory.
 *
 * Log Safety: UNSAFE
 */
export type FilePath = LooselyBrandedString<"FilePath">;

/**
 * Log Safety: UNSAFE
 */
export interface ListReleasesResponse {
  data: Array<Release>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface Release {
  widgetSetRid: WidgetSetRid;
  version: ReleaseVersion;
  locator: ReleaseLocator;
  description?: string;
}

/**
 * A locator for where the backing files of a release are stored.
 *
 * Log Safety: UNSAFE
 */
export interface ReleaseLocator {
  repositoryRid: RepositoryRid;
  repositoryVersion: RepositoryVersion;
}

/**
 * The semantic version of the widget set.
 *
 * Log Safety: UNSAFE
 */
export type ReleaseVersion = LooselyBrandedString<"ReleaseVersion">;

/**
 * Log Safety: SAFE
 */
export interface Repository {
  rid: RepositoryRid;
  widgetSetRid?: WidgetSetRid;
}

/**
 * A Resource Identifier (RID) identifying a repository.
 *
 * Log Safety: SAFE
 */
export type RepositoryRid = LooselyBrandedString<"RepositoryRid">;

/**
 * A semantic version of a repository storing backing files.
 *
 * Log Safety: UNSAFE
 */
export type RepositoryVersion = LooselyBrandedString<"RepositoryVersion">;

/**
 * A script entrypoint to be loaded into the runtime environment.
 *
 * Log Safety: UNSAFE
 */
export interface ScriptEntrypoint {
  filePath: FilePath;
  scriptType: ScriptType;
}

/**
 * Log Safety: SAFE
 */
export type ScriptType = "DEFAULT" | "MODULE";

/**
 * Log Safety: UNSAFE
 */
export interface SetWidgetSetDevModeSettingsByIdRequest {
  widgetSetRid: WidgetSetRid;
  settings: WidgetSetDevModeSettingsById;
}

/**
 * Log Safety: UNSAFE
 */
export interface SetWidgetSetDevModeSettingsRequest {
  widgetSetRid: WidgetSetRid;
  settings: WidgetSetDevModeSettings;
}

/**
 * A stylesheet entrypoint to be loaded into the runtime environment.
 *
 * Log Safety: UNSAFE
 */
export interface StylesheetEntrypoint {
  filePath: FilePath;
}

/**
 * The settings for a given widget in development mode.
 *
 * Log Safety: UNSAFE
 */
export interface WidgetDevModeSettings {
  scriptEntrypoints: Array<ScriptEntrypoint>;
  stylesheetEntrypoints: Array<StylesheetEntrypoint>;
}

/**
   * Human readable ID for a widget. Must be unique within a widget set.
Considered unsafe as it may contain user defined data.

Must only contain the following ASCII characters: a-z, A-Z and 0-9.
Must not start with a number.
Must have a maximum length of 100.
Must be camelCase.
   *
   * Log Safety: UNSAFE
   */
export type WidgetId = LooselyBrandedString<"WidgetId">;

/**
 * A Resource Identifier (RID) identifying a widget.
 *
 * Log Safety: SAFE
 */
export type WidgetRid = LooselyBrandedString<"WidgetRid">;

/**
 * Log Safety: SAFE
 */
export interface WidgetSet {
  rid: WidgetSetRid;
  publishRepositoryRid?: RepositoryRid;
}

/**
 * The settings for a widget set in development mode, keyed by widget RID.
 *
 * Log Safety: UNSAFE
 */
export interface WidgetSetDevModeSettings {
  baseHref: string;
  widgetSettings: Record<WidgetRid, WidgetDevModeSettings>;
}

/**
 * The settings for a widget set in development mode, keyed by widget ID.
 *
 * Log Safety: UNSAFE
 */
export interface WidgetSetDevModeSettingsById {
  baseHref: string;
  widgetSettings: Record<WidgetId, WidgetDevModeSettings>;
}

/**
 * A Resource Identifier (RID) identifying a widget set.
 *
 * Log Safety: SAFE
 */
export type WidgetSetRid = LooselyBrandedString<"WidgetSetRid">;
