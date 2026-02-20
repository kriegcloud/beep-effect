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

import type { Flavored } from "@palantir/pack.core";

export type UserId = Flavored<"pack:UserId">;

export const UserRefBrand: unique symbol = Symbol("pack:UserRef");

/**
 * A reference providing an API to interact with a user.
 *
 * @experimental
 */
export interface UserRef {
  readonly userId: UserId;
  readonly [UserRefBrand]: typeof UserRefBrand;
  readonly get: (force?: boolean) => Promise<unknown>;
}
