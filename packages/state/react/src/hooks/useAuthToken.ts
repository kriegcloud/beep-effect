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

import type { AuthModule } from "@palantir/pack.auth";
import type { PackApp } from "@palantir/pack.core";
import { useEffect, useState } from "react";

type PackAppWithAuth = PackApp & { auth: AuthModule };

/**
 * Gets the authentication token from the app, useful for making authenticated API requests.
 *
 * Prefer using OSDK APIs with an OsdkClient for available APIs, this hook is primarily
 * for internal or experimental API calls.
 *
 * This hook will update when the token refreshes.
 *
 * @param app The app instance initialized by your application.
 * @returns The current authentication token or undefined if not available.
 * @example
 * ```tsx
 * import { useAuthToken } from "@palantir/pack.state.react";
 * import { app } from "./appInstance";
 *
 * const MyComponent: React.FC = () => {
 *   const authToken = useAuthToken(app);
 *   useEffect(() => {
 *     async function fetchData() {
 *       const response = await fetch("/api/data", {
 *         headers: {
 *           Authorization: `Bearer ${authToken}`,
 *         },
 *       });
 *       const data = await response.json();
 *       // handle data
 *     }
 *     if (authToken) {
 *       fetchData();
 *     }
 *   }, [authToken]);
 *
 *   return <div>Data fetching component</div>;
 * }
 * ```
 */
export function useAuthToken(app: PackAppWithAuth): string | undefined {
  const [token, setToken] = useState<string | undefined>(() => app.auth.getTokenOrUndefined());

  useEffect(() => {
    const unsubscribe = app.auth.onTokenChange(token => {
      setToken(token);
    });

    return unsubscribe;
  }, [app.auth]);

  return token;
}
