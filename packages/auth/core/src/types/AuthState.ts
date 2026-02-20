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

export const AuthState = {
  Authenticated: "authenticated",
  Authenticating: "authenticating",
  Error: "error",
  Initializing: "initializing",
  Unauthenticated: "unauthenticated",
} as const;

export type AuthState = typeof AuthState[keyof typeof AuthState];

export interface AuthStateChangeEvent {
  readonly previousState?: AuthState;
  readonly state: AuthState;
  readonly error?: Error;
}

export type AuthStateCallback = (event: AuthStateChangeEvent) => void;
