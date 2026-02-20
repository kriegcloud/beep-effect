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

import type { ModuleKey, PackAppInternal } from "@palantir/pack.core";
import type { AuthModule } from "../types/AuthModule.js";
import type { AuthModuleConfig } from "../utils/AuthModuleConfig.js";
import { AuthModuleImpl } from "../utils/AuthModuleImpl.js";

export const AUTH_MODULE_KEY: ModuleKey<AuthModule, AuthModuleConfig> = {
  appMemberName: "auth",
  key: Symbol.for("pack.auth"),
  initModule: (app: PackAppInternal, config?: AuthModuleConfig) => {
    if (!config) {
      throw new Error("AuthModuleConfig is required to initialize AuthModule");
    }
    return new AuthModuleImpl(app, config.authService);
  },
};
