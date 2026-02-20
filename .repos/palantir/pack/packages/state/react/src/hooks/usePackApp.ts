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

import type { PackApp } from "@palantir/pack.core";
import { createContext, useContext } from "react";

const PACK_CONTEXT = createContext<PackApp | null>(null);

// TODO: this should move to a pack.app.react package as it has nothing to do with state.
export function usePackApp(): PackApp;
export function usePackApp(throwOnMissing: true): PackApp | null;
export function usePackApp(throwOnMissing = true): PackApp | null {
  const packApp = useContext(PACK_CONTEXT);
  if (packApp == null && throwOnMissing) {
    throw new Error("usePackApp must be used within a PackApp provider");
  }
  return packApp;
}

export const PackAppProvider: React.Provider<PackApp | null> = PACK_CONTEXT.Provider;
