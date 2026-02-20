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

import type { UserId } from "./UserRef.js";

/**
 * Represents the parsed payload from a JWT token (unverified).
 * The information provided should not be used for security-sensitive
 * applications unless verified through some other process.
 */
export interface UnverifiedTokenInfo {
  readonly expiryInstantUtc?: number;
  readonly orgId?: string;
  readonly sessionId?: string;
  readonly tokenId?: string;
  readonly userId?: UserId;
}
