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

import { IType, PrimitiveType } from "conjure-api";

const NO_CONVERSION_SUFFIX = "";
const CONVERSION_SUFFIX = ".toString()";

export const resolveStringConversion = (conjureType: IType): string => {
    switch (conjureType.type) {
        case "primitive":
            if (conjureType.primitive === PrimitiveType.SAFELONG) {
                return CONVERSION_SUFFIX;
            }
            return NO_CONVERSION_SUFFIX;
        case "list":
            return NO_CONVERSION_SUFFIX;
        case "set":
            return NO_CONVERSION_SUFFIX;
        case "map":
            return NO_CONVERSION_SUFFIX;
        case "optional":
            return NO_CONVERSION_SUFFIX;
        case "reference":
            return NO_CONVERSION_SUFFIX;
        case "external":
            return NO_CONVERSION_SUFFIX;
    }
};
