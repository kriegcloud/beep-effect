/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
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

import type * as ir from "@osdk/docs-spec-platform";
import { getNamespacePlatform } from "./getNamespacePlatform.js";
import type { ErrorType } from "./model/ErrorType.js";

export function isPrefixCorrectForComponent(
  component: ir.Component | ir.Error,
  prefix: string,
): boolean {
  return doesPlatformMatchPrefix(
    getNamespacePlatform(component.locator.namespaceName),
    prefix,
  );
}

export function isPrefixCorrectForNamespace(
  namespace: ir.Namespace,
  prefix: string,
): boolean {
  return doesPlatformMatchPrefix(
    getNamespacePlatform(namespace.name),
    prefix,
  );
}

function doesPlatformMatchPrefix(
  platform: string,
  prefix: string,
): boolean {
  const mappedPrefix = prefix === "internal.foundry" ? "foundry" : prefix;
  if (
    (mappedPrefix !== platform && platform !== "both")
  ) {
    return false;
  }
  return true;
}
