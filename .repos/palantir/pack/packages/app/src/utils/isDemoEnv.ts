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

import { getPageEnv } from "./getPageEnv.js";

/**
 * Check if the current environment should use demo mode.
 * First checks for explicit pack-demoMode meta tag, then falls back to checking
 * if baseUrl is missing or empty.
 *
 * @returns true if demo mode should be used, false otherwise
 */
export function isDemoEnv(): boolean {
  const pageEnv = getPageEnv();

  if (pageEnv.demoMode != null) {
    return pageEnv.demoMode;
  }

  return pageEnv.baseUrl == null || pageEnv.baseUrl === "";
}
