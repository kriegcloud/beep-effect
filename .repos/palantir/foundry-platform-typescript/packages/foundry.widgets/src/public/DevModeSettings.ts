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
import type {
  SharedClient as $OldClient,
  SharedClientContext as $OldClientContext,
} from "@osdk/shared.client";
import type {
  SharedClient as $Client,
  SharedClientContext as $ClientContext,
} from "@osdk/shared.client2";
import type { FoundryPlatformMethod as $FoundryPlatformMethod } from "@osdk/shared.net.platformapi";
import { foundryPlatformFetch as $foundryPlatformFetch } from "@osdk/shared.net.platformapi";
import type * as _Widgets from "../_components.js";

//

const _get: $FoundryPlatformMethod<
  ($queryParams?: {
    preview?: _Core.PreviewMode | undefined;
  }) => Promise<_Widgets.DevModeSettings>
> = [0, "/v2/widgets/devModeSettings", 2];

/**
 * Get the dev mode settings for the user associated with the provided token.
 *
 * @alpha
 *
 * Required Scopes: [api:widgets-read]
 * URL: /v2/widgets/devModeSettings
 */
export function get(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$queryParams?: { preview?: _Core.PreviewMode | undefined }]
): Promise<_Widgets.DevModeSettings> {
  return $foundryPlatformFetch($ctx, _get, ...args);
}

const _enable: $FoundryPlatformMethod<
  ($queryParams?: {
    preview?: _Core.PreviewMode | undefined;
  }) => Promise<_Widgets.DevModeSettings>
> = [1, "/v2/widgets/devModeSettings/enable", 2];

/**
 * Enable dev mode for the user associated with the provided token.
 *
 * @alpha
 *
 * Required Scopes: [api:widgets-write]
 * URL: /v2/widgets/devModeSettings/enable
 */
export function enable(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$queryParams?: { preview?: _Core.PreviewMode | undefined }]
): Promise<_Widgets.DevModeSettings> {
  return $foundryPlatformFetch($ctx, _enable, ...args);
}

const _pause: $FoundryPlatformMethod<
  ($queryParams?: {
    preview?: _Core.PreviewMode | undefined;
  }) => Promise<_Widgets.DevModeSettings>
> = [1, "/v2/widgets/devModeSettings/pause", 2];

/**
 * Pause dev mode for the user associated with the provided token.
 *
 * @alpha
 *
 * Required Scopes: [api:widgets-write]
 * URL: /v2/widgets/devModeSettings/pause
 */
export function pause(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$queryParams?: { preview?: _Core.PreviewMode | undefined }]
): Promise<_Widgets.DevModeSettings> {
  return $foundryPlatformFetch($ctx, _pause, ...args);
}

const _disable: $FoundryPlatformMethod<
  ($queryParams?: {
    preview?: _Core.PreviewMode | undefined;
  }) => Promise<_Widgets.DevModeSettings>
> = [1, "/v2/widgets/devModeSettings/disable", 2];

/**
 * Disable dev mode for the user associated with the provided token.
 *
 * @alpha
 *
 * Required Scopes: [api:widgets-write]
 * URL: /v2/widgets/devModeSettings/disable
 */
export function disable(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [$queryParams?: { preview?: _Core.PreviewMode | undefined }]
): Promise<_Widgets.DevModeSettings> {
  return $foundryPlatformFetch($ctx, _disable, ...args);
}

const _setWidgetSet: $FoundryPlatformMethod<
  (
    $body: _Widgets.SetWidgetSetDevModeSettingsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Widgets.DevModeSettings>
> = [1, "/v2/widgets/devModeSettings/setWidgetSet", 3];

/**
 * Set the dev mode settings for the given widget set for the user associated with the provided token.
 *
 * @alpha
 *
 * Required Scopes: [api:widgets-write]
 * URL: /v2/widgets/devModeSettings/setWidgetSet
 */
export function setWidgetSet(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _Widgets.SetWidgetSetDevModeSettingsRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Widgets.DevModeSettings> {
  return $foundryPlatformFetch($ctx, _setWidgetSet, ...args);
}

const _setWidgetSetById: $FoundryPlatformMethod<
  (
    $body: _Widgets.SetWidgetSetDevModeSettingsByIdRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ) => Promise<_Widgets.DevModeSettings>
> = [1, "/v2/widgets/devModeSettings/setWidgetSetById", 3];

/**
 * Set the dev mode settings for the given widget set for the user associated with the
 * provided token. Uses widget IDs to identify widgets within the set.
 *
 * @alpha
 *
 * Required Scopes: [api:widgets-write]
 * URL: /v2/widgets/devModeSettings/setWidgetSetById
 */
export function setWidgetSetById(
  $ctx: $Client | $ClientContext | $OldClient | $OldClientContext,
  ...args: [
    $body: _Widgets.SetWidgetSetDevModeSettingsByIdRequest,
    $queryParams?: { preview?: _Core.PreviewMode | undefined },
  ]
): Promise<_Widgets.DevModeSettings> {
  return $foundryPlatformFetch($ctx, _setWidgetSetById, ...args);
}
