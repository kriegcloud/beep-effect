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

export { getAuthModule } from "./types/AuthModule.js";
export type { AuthModule } from "./types/AuthModule.js";
export { AuthState } from "./types/AuthState.js";
export type { AuthStateCallback, AuthStateChangeEvent } from "./types/AuthState.js";
export type { BaseAuthService } from "./types/BaseAuthService.js";
export type { TokenChangeCallback } from "./types/TokenChange.js";
export type { UnverifiedTokenInfo } from "./types/UnverifiedTokenInfo.js";
export { createUserRef, invalidUserRef, isValidUserRef } from "./types/UserRef.js";
export type { UserId, UserRef } from "./types/UserRef.js";
export { type AuthModuleConfig, createAuthModuleConfig } from "./utils/AuthModuleConfig.js";
export { AuthModuleImpl } from "./utils/AuthModuleImpl.js";
