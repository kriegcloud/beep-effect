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

import invariant from "tiny-invariant";
import type { AppConfig } from "./AppConfig.js";
import type { ModuleKey } from "./ModuleKey.js";

/**
 * PackApp provides access to various pack subsystems.
 *
 * Specific modules are available after configuration and through declarations mixed in by import.
 * Eg for state system, if you import @palantir/pack.state.core you will have access to `app.state` accessor.
 * Similarly, auth is added automatically by initPackApp.
 *
 * @example
 * ```typescript
 * import { DocumentRef } from '@palantir/pack.state.core';
 * import { DocSchema } from '@my-app/schema';
 *
 * const app = initPackApp({
 *   tokenProvider: () => 'your-token',
 *   moduleConfigs: {
 *     ...createPackDocumentServiceConfig({appId: 'your-app-id', documentType: 'your-document-type'})
 *   },
 * });
 *
 * const docRef = app.state.createDocRef(docSchema, 'your-document-id');
 * const doc = await docRef.getSnapshot(); // get pojo of your doc state.
 * ```
 */
export interface PackApp {
  readonly config: AppConfig;
  // Note auth and other module accessors are added dynamically during initialization
}

/**
 * Module configuration - either a tuple of [ModuleKey, config] or just a ModuleKey (for modules with no config)
 */
export type ModuleConfigTuple<T = unknown> = readonly [ModuleKey<T>, unknown];
export type ModuleConfig<T = unknown> = ModuleConfigTuple<T> | ModuleKey<T>;

/**
 * Type guard to check if a ModuleConfig is a tuple configuration
 */
export const isModuleConfigTuple = (
  config: ModuleConfig,
): config is readonly [ModuleKey<unknown>, unknown] => {
  return Array.isArray(config);
};

export interface PackAppInternal {
  readonly config: AppConfig;

  /**
   * Internal module accessor
   */
  // TODO: maybe prefix with _ to show it's internal ?
  getModule<T, TConfig = undefined>(moduleKey: ModuleKey<T, TConfig>): T;
}

/**
 * To simplify the public type interface on methods taking a PackApp,
 * this function asserts that the implementation is in fact a PackAppInternal
 * implementation, which allows internal module access and perhaps other
 * private functionality in the future.
 */
export function assertIsAppInternal(app: PackApp): asserts app is PackApp & PackAppInternal;
export function assertIsAppInternal(
  app: PackAppInternal,
): asserts app is PackAppInternal;
export function assertIsAppInternal(
  app: PackApp | PackAppInternal,
): asserts app is PackAppInternal {
  invariant("getModule" in app, "App is not an PackAppInternal");
}
