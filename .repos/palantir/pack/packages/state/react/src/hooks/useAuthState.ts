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

import { type AuthModule, AuthState, type AuthStateChangeEvent } from "@palantir/pack.auth";
import type { PackApp } from "@palantir/pack.core";
import { useEffect, useState } from "react";

type PackAppWithAuth = PackApp & { auth: AuthModule };

/**
 * Gets the authentication state for the app, useful for authentication workflows.
 *
 * @param app The app instance initialized by your application.
 * @returns The current authentication state.
 *
 * @example
 * ```tsx
 * import { useAuthState } from "@palantir/pack.state.react";
 * import { app } from "./appInstance";
 *
 * const MyComponent: React.FC = () => {
 *   const authState = useAuthState(app);
 *   if (authState === AuthState.Error) {
 *     return <div>Error occurred</div>;
 *   }
 *   if (authState !== AuthState.Authenticated) {
 *     return <Spinner/>
 *   }
 *   return <div>Welcome back</div>;
 * }
 * ```
 */
export function useAuthState(app: PackAppWithAuth): AuthState {
  const [authState, setAuthState] = useState<AuthState>(AuthState.Initializing);

  useEffect(() => {
    const unsubscribe = app.auth.onAuthStateChange((event: AuthStateChangeEvent) => {
      setAuthState(event.state);
    });

    return unsubscribe;
  }, [app.auth]);

  return authState;
}
