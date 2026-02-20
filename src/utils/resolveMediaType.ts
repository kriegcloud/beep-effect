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

import { IType, ITypeDefinition, PrimitiveType } from "conjure-api";
import { MediaType } from "conjure-client";
import { createHashableTypeName } from "./hashingUtils";

export const resolveMediaType = (conjureType: IType, knownConjureTypes: Map<string, ITypeDefinition>): MediaType => {
    switch (conjureType.type) {
        case "primitive":
            switch (conjureType.primitive) {
                case PrimitiveType.STRING:
                    return MediaType.APPLICATION_JSON;
                case PrimitiveType.DATETIME:
                    return MediaType.APPLICATION_JSON;
                case PrimitiveType.RID:
                    return MediaType.APPLICATION_JSON;
                case PrimitiveType.BEARERTOKEN:
                    return MediaType.APPLICATION_JSON;
                case PrimitiveType.DOUBLE:
                    return MediaType.APPLICATION_JSON;
                case PrimitiveType.INTEGER:
                    return MediaType.APPLICATION_JSON;
                case PrimitiveType.SAFELONG:
                    return MediaType.APPLICATION_JSON;
                case PrimitiveType.ANY:
                    return MediaType.APPLICATION_JSON;
                case PrimitiveType.BOOLEAN:
                    return MediaType.APPLICATION_JSON;
                case PrimitiveType.UUID:
                    return MediaType.APPLICATION_JSON;
                case PrimitiveType.BINARY:
                    return MediaType.APPLICATION_OCTET_STREAM;
                default:
                    throw new Error("Unknown primitive type");
            }
        case "list":
            return MediaType.APPLICATION_JSON;
        case "set":
            return MediaType.APPLICATION_JSON;
        case "map":
            return MediaType.APPLICATION_JSON;
        case "optional":
            return resolveMediaType(conjureType.optional.itemType, knownConjureTypes);
        case "reference":
            const referencedTypeDefinition = knownConjureTypes.get(createHashableTypeName(conjureType.reference));

            if (referencedTypeDefinition == null) {
                throw new Error(
                    `Unknown reference type. package: '${conjureType.reference.package}', name: '${conjureType.reference.name}'`,
                );
            }

            if (ITypeDefinition.isAlias(referencedTypeDefinition)) {
                return resolveMediaType(referencedTypeDefinition.alias.alias, knownConjureTypes);
            }

            return MediaType.APPLICATION_JSON;
        case "external":
            return MediaType.APPLICATION_JSON;
    }
};
