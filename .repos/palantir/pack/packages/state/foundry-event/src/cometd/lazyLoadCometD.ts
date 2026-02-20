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

import type * as cometd from "cometd";

export async function lazyLoadCometD(): Promise<typeof cometd> {
  const cometdModule = await import("cometd");
  // cometd module does declare the extensions, however they are added to the module as side-effects
  // by importing the submodule extension files. So for any we use we'll need to import them explicitly.
  // Note that this file should be included in package.json "sideEffects" to avoid tree-shaking.

  // TODO: switch back to dynamic import with side-effect loading when supported by new cometD version. Requires
  // backend version upgrade first.
  // AckExtension.js modifies the cometd module as a side-effect to add AckExtension.
  // We need to capture the returned constructor because with ESM bundlers, the module reference
  // may not reflect the mutation.
  // @ts-expect-error TS2307: No type declarations for cometd/AckExtension.js, but its default export is the AckExtension constructor
  const { default: AckExtension } = await import("cometd/AckExtension.js");

  return { ...cometdModule, AckExtension };
}
