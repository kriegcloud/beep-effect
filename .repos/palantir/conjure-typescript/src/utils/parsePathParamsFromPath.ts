/**
 * @license
 * Copyright 2025 Palantir Technologies, Inc.
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

export function parsePathParamsFromPath(httpPath: string): string[] {
    // first fix up the path to remove any ':.+' stuff in path params
    const fixedPath = httpPath.replace(/{(.*):[^}]*}/, "{$1}");
    // follow-up by just pulling out any path segment with a starting '{' and trailing '}'
    return fixedPath
        .split("/")
        .filter(segment => segment.startsWith("{") && segment.endsWith("}"))
        .map(segment => segment.slice(1, -1));
}
