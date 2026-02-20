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

import {
    IExternalReference,
    IListType,
    IMapType,
    IOptionalType,
    ISetType,
    IType,
    ITypeDefinition,
    ITypeName,
    PrimitiveType,
} from "conjure-api";
import { ITypeGenerationFlags } from "../types/typeGenerationFlags";
import { isFlavorizable } from "./flavorizingUtils";
import { createHashableTypeName } from "./hashingUtils";

export const resolveTsType = (
    conjureType: IType,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
    isParameterType: boolean,
    isTopLevelBinary: boolean,
): string => {
    switch (conjureType.type) {
        case "primitive":
            return resolveTsTypeForPrimitiveType(conjureType.primitive, isParameterType, isTopLevelBinary);
        case "list":
            return resolveTsTypeForListType(
                conjureType.list,
                baseType,
                knownConjureTypes,
                typeGenerationFlags,
                isParameterType,
            );
        case "set":
            return resolveTsTypeForSetType(
                conjureType.set,
                baseType,
                knownConjureTypes,
                typeGenerationFlags,
                isParameterType,
            );
        case "map":
            return resolveTsTypeForMapType(
                conjureType.map,
                baseType,
                knownConjureTypes,
                typeGenerationFlags,
                isParameterType,
            );
        case "optional":
            return resolveTsTypeForOptionalType(
                conjureType.optional,
                baseType,
                knownConjureTypes,
                typeGenerationFlags,
                isParameterType,
                isTopLevelBinary,
            );
        case "reference":
            return resolveTsTypeForReferenceType(
                conjureType.reference,
                baseType,
                knownConjureTypes,
                typeGenerationFlags,
                isParameterType,
                isTopLevelBinary,
            );
        case "external":
            return resolveTsTypeForExternalType(
                conjureType.external,
                baseType,
                knownConjureTypes,
                typeGenerationFlags,
                isParameterType,
            );
    }
};

export const resolveTsTypeForPrimitiveType = (
    primitiveType: PrimitiveType,
    isParameterType: boolean,
    isTopLevelBinary: boolean,
): string => {
    switch (primitiveType) {
        case PrimitiveType.STRING:
            return "string";
        case PrimitiveType.DATETIME:
            return "string";
        case PrimitiveType.RID:
            return "string";
        case PrimitiveType.BEARERTOKEN:
            return "string";
        case PrimitiveType.UUID:
            return "string";
        case PrimitiveType.BINARY:
            if (isParameterType) {
                return isTopLevelBinary ? "ReadableStream<Uint8Array> | BufferSource | Blob" : "string";
            }
            return isTopLevelBinary ? "ReadableStream<Uint8Array>" : "string";
        case PrimitiveType.INTEGER:
            return "number";
        case PrimitiveType.SAFELONG:
            return "number";
        case PrimitiveType.DOUBLE:
            return 'number | "NaN"';
        case PrimitiveType.BOOLEAN:
            return "boolean";
        case PrimitiveType.ANY:
            return "any";
        default:
            throw new Error("Unknown primitive type");
    }
};

export const resolveTsTypeForListType = (
    listType: IListType,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
    isParameterType: boolean,
): string => {
    const itemType = resolveTsType(
        listType.itemType,
        baseType,
        knownConjureTypes,
        typeGenerationFlags,
        isParameterType,
        false,
    );
    return typeGenerationFlags.readonlyInterfaces ? `ReadonlyArray<${itemType}>` : `Array<${itemType}>`;
};

export const resolveTsTypeForSetType = (
    setType: ISetType,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
    isParameterType: boolean,
): string => {
    const itemType = resolveTsType(
        setType.itemType,
        baseType,
        knownConjureTypes,
        typeGenerationFlags,
        isParameterType,
        false,
    );
    return typeGenerationFlags.readonlyInterfaces ? `ReadonlyArray<${itemType}>` : `Array<${itemType}>`;
};

export const resolveTsTypeForOptionalType = (
    optionalType: IOptionalType,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
    isParameterType: boolean,
    isTopLevelBinary: boolean,
): string => {
    return (
        resolveTsType(
            optionalType.itemType,
            baseType,
            knownConjureTypes,
            typeGenerationFlags,
            isParameterType,
            isTopLevelBinary,
        ) + " | null"
    );
};

export const resolveTsTypeForMapType = (
    mapType: IMapType,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
    isParameterType: boolean,
): string => {
    const resolvedValueType = resolveTsType(
        mapType.valueType,
        baseType,
        knownConjureTypes,
        typeGenerationFlags,
        isParameterType,
        false,
    );
    const maybeReadonly = typeGenerationFlags.readonlyInterfaces ? "readonly " : "";

    if (IType.isReference(mapType.keyType)) {
        const keyTypeDefinition = knownConjureTypes.get(createHashableTypeName(mapType.keyType.reference));

        if (keyTypeDefinition == null) {
            throw new Error(
                `Unknown reference type. package: '${mapType.keyType.reference.package}', name: '${mapType.keyType.reference.name}'`,
            );
        }

        if (ITypeDefinition.isEnum(keyTypeDefinition)) {
            return `{ ${maybeReadonly}[key in ${mapType.keyType.reference.name}]?: ${resolvedValueType} }`;
        } else if (
            ITypeDefinition.isAlias(keyTypeDefinition) &&
            isFlavorizable(keyTypeDefinition.alias.alias, typeGenerationFlags.flavorizedAliases)
        ) {
            return `{ ${maybeReadonly}[key: I${mapType.keyType.reference.name}]: ${resolvedValueType} }`;
        }
    }

    return `{ ${maybeReadonly}[key: string]: ${resolvedValueType} }`;
};

export const resolveTsTypeForReferenceType = (
    referencedType: ITypeName,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
    isParameterType: boolean,
    isTopLevelBinary: boolean,
): string => {
    const referencedTypeDefinition = knownConjureTypes.get(createHashableTypeName(referencedType));

    if (referencedTypeDefinition == null) {
        throw new Error(`Unknown reference type. package: '${referencedType.package}', name: '${referencedType.name}'`);
    }

    const typeName = ITypeDefinition.isEnum(referencedTypeDefinition) ? referencedType.name : `I${referencedType.name}`;

    if (
        ITypeDefinition.isAlias(referencedTypeDefinition) &&
        !isFlavorizable(referencedTypeDefinition.alias.alias, typeGenerationFlags.flavorizedAliases)
    ) {
        return resolveTsType(
            referencedTypeDefinition.alias.alias,
            baseType,
            knownConjureTypes,
            typeGenerationFlags,
            isParameterType,
            isTopLevelBinary,
        );
    } else if (ITypeDefinition.isUnion(referencedTypeDefinition)) {
        // If the type reference is recursive, use a direct reference rather than a namespaced one
        if (referencedType.name === baseType.name && referencedType.package === baseType.package) {
            return typeName;
        }
        return `${typeName}.${typeName}`;
    }

    return typeName;
};

export const resolveTsTypeForExternalType = (
    externalType: IExternalReference,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
    isParameterType: boolean,
): string => {
    return resolveTsType(
        externalType.fallback,
        baseType,
        knownConjureTypes,
        typeGenerationFlags,
        isParameterType,
        false,
    );
};
