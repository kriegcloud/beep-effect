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

/* eslint-disable no-console */

import type { Logger } from "@osdk/api";
import type { Client } from "@osdk/client";
import type { AppConfig, ModuleKey, PackAppInternal } from "@palantir/pack.core";
import { mock } from "vitest-mock-extended";
import { createInMemoryDocumentServiceConfig } from "../service/InMemoryDocumentService.js";

export function createTestApp(
  config: Partial<AppConfig & { moduleConfigs: Record<symbol, unknown> }> = {},
): PackAppInternal {
  const modules = new Map<symbol, unknown>();

  // Create default configs so every test doesn't need to specify
  const docConfig = createInMemoryDocumentServiceConfig({ autoCreateDocuments: true });
  const allModuleConfigs = {
    [docConfig[0].key]: docConfig[1],
    ...config.moduleConfigs,
  };

  const mockClient = config.osdkClient ?? mock<Client>();

  const app: PackAppInternal = {
    config: {
      app: {
        appId: "test-app-id",
        ...config.app,
      },
      isDemoMode: config.isDemoMode ?? true,
      logger: config.logger ?? consoleLogger({}),
      ontologyRid: config.ontologyRid ?? Promise.resolve("ri.ontology...test"),
      osdkClient: mockClient,
      remote: {
        packWsPath: "/api/v2/packSubscriptions",
        baseUrl: "http://localhost",
        fetchFn: fetch,
        ...config.remote,
      },
    } satisfies AppConfig,
    getModule: <T, TConfig>(moduleKey: ModuleKey<T, TConfig>): T => {
      if (modules.has(moduleKey.key)) {
        // Safe assertion via ModuleKey
        return modules.get(moduleKey.key) as T;
      }

      const moduleConfig = allModuleConfigs[moduleKey.key] as TConfig;
      const instance = moduleKey.initModule(app, moduleConfig);
      modules.set(moduleKey.key, instance);

      if (moduleKey.appMemberName != null) {
        Object.defineProperty(app, moduleKey.appMemberName, {
          configurable: false,
          enumerable: true,
          get: () => instance,
        });
      }
      return instance;
    },
  };
  return app;
}

export function createTestAppNoAutocreate(
  config: Partial<AppConfig & { moduleConfigs: Record<symbol, unknown> }> = {},
): PackAppInternal {
  const docConfig = createInMemoryDocumentServiceConfig({ autoCreateDocuments: false });
  return createTestApp({
    ...config,
    moduleConfigs: {
      ...config.moduleConfigs,
      [docConfig[0].key]: docConfig[1],
    },
  });
}

function consoleLogger(
  _bindings: Record<string, unknown>,
  _options?: { level?: string; msgPrefix?: string },
): Logger {
  return {
    child: consoleLogger,
    debug: console.debug,
    error: console.error,
    fatal: console.error,
    info: console.info,
    isLevelEnabled: () => true,
    trace: console.debug,
    warn: console.warn,
  } satisfies Logger;
}
