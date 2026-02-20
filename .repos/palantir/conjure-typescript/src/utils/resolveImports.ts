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
import { ImportDeclarationStructure, ImportSpecifierStructure, StructureKind } from "ts-morph";
import { ITypeGenerationFlags } from "../types/typeGenerationFlags";
import { relativePath } from "./fileUtils";
import { isFlavorizable } from "./flavorizingUtils";
import { createHashableTypeName } from "./hashingUtils";
import { resolveTsTypeForReferenceType } from "./resolveTsType";

export const resolveImports = (
    conjureType: IType,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
): ImportDeclarationStructure[] => {
    switch (conjureType.type) {
        case "primitive":
            return resolveImportsForPrimitiveType(conjureType.primitive);
        case "list":
            return resolveImportsForListType(conjureType.list, baseType, knownConjureTypes, typeGenerationFlags);
        case "set":
            return resolveImportsForSetType(conjureType.set, baseType, knownConjureTypes, typeGenerationFlags);
        case "map":
            return resolveImportsForMapType(conjureType.map, baseType, knownConjureTypes, typeGenerationFlags);
        case "optional":
            return resolveImportsForOptionalType(
                conjureType.optional,
                baseType,
                knownConjureTypes,
                typeGenerationFlags,
            );
        case "reference":
            return resolveImportsForReferenceType(
                conjureType.reference,
                baseType,
                knownConjureTypes,
                typeGenerationFlags,
            );
        case "external":
            return resolveImportsForExternalType(
                conjureType.external,
                baseType,
                knownConjureTypes,
                typeGenerationFlags,
            );
    }
};

export const resolveImportsForPrimitiveType = (_primitiveType: PrimitiveType): ImportDeclarationStructure[] => {
    return [];
};

export const resolveImportsForListType = (
    listType: IListType,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
): ImportDeclarationStructure[] => {
    return resolveImports(listType.itemType, baseType, knownConjureTypes, typeGenerationFlags);
};

export const resolveImportsForSetType = (
    setType: ISetType,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
): ImportDeclarationStructure[] => {
    return resolveImports(setType.itemType, baseType, knownConjureTypes, typeGenerationFlags);
};

export const resolveImportsForMapType = (
    mapType: IMapType,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
): ImportDeclarationStructure[] => {
    return [
        ...resolveImports(mapType.keyType, baseType, knownConjureTypes, typeGenerationFlags),
        ...resolveImports(mapType.valueType, baseType, knownConjureTypes, typeGenerationFlags),
    ];
};

export const resolveImportsForOptionalType = (
    optionalType: IOptionalType,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
): ImportDeclarationStructure[] => {
    return resolveImports(optionalType.itemType, baseType, knownConjureTypes, typeGenerationFlags);
};

export const resolveImportsForReferenceType = (
    referencedType: ITypeName,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
): ImportDeclarationStructure[] => {
    const referencedTypeDefinition = knownConjureTypes.get(createHashableTypeName(referencedType));

    if (referencedTypeDefinition == null) {
        throw new Error(`Unknown reference type. package: '${referencedType.package}', name: '${referencedType.name}'`);
    }

    if (
        ITypeDefinition.isAlias(referencedTypeDefinition) &&
        !isFlavorizable(referencedTypeDefinition.alias.alias, typeGenerationFlags.flavorizedAliases)
    ) {
        return resolveImports(referencedTypeDefinition.alias.alias, baseType, knownConjureTypes, typeGenerationFlags);
    }

    if (referencedType.name === baseType.name && referencedType.package === baseType.package) {
        return [];
    }

    const moduleSpecifier = relativePath(baseType, referencedType);
    const name = resolveTsTypeForReferenceType(
        referencedType,
        baseType,
        knownConjureTypes,
        typeGenerationFlags,
        false,
        false,
    );

    if (ITypeDefinition.isUnion(referencedTypeDefinition)) {
        return [
            {
                kind: StructureKind.ImportDeclaration,
                moduleSpecifier,
                // Assumes that union names are of the form IMyUnion.IMyUnion
                namespaceImport: name.split(".")[0],
            },
        ];
    }

    return [
        {
            kind: StructureKind.ImportDeclaration,
            moduleSpecifier,
            namedImports: [{ name }],
        },
    ];
};

export const resolveImportsForExternalType = (
    externalReference: IExternalReference,
    baseType: ITypeName,
    knownConjureTypes: Map<string, ITypeDefinition>,
    typeGenerationFlags: ITypeGenerationFlags,
): ImportDeclarationStructure[] => {
    return resolveImports(externalReference.fallback, baseType, knownConjureTypes, typeGenerationFlags);
};

export const sortImports = (imports: ImportDeclarationStructure[]): ImportDeclarationStructure[] => {
    const namedImports = new Map();
    const namespaceImports = new Map();
    imports.forEach(i => {
        const isNamedImport = i.namedImports != null;
        const isNamespaceImport = i.namespaceImport != null;
        if (isNamedImport === isNamespaceImport) {
            throw new Error("expected only one of the fields 'namedImports' and 'namespaceImport' to be defined");
        }
        if (isNamedImport) {
            const curImport = namedImports.get(i.moduleSpecifier);
            if (curImport != null && Array.isArray(i.namedImports)) {
                const newImports = i.namedImports.filter(namedImport => {
                    const newName = typeof namedImport === "string" ? namedImport : namedImport.name;
                    return (
                        curImport.namedImports.find(({ name }: ImportSpecifierStructure) => name === newName) == null
                    );
                });
                curImport.namedImports.push(...newImports);
            } else {
                namedImports.set(i.moduleSpecifier, i);
            }
        } else if (isNamespaceImport) {
            const curImport = namespaceImports.get(i.moduleSpecifier);
            if (curImport != null && curImport.namespaceImport !== i.namespaceImport) {
                throw new Error(`Only one namespace import for module '${i.moduleSpecifier}' is permitted`);
            } else {
                namespaceImports.set(i.moduleSpecifier, i);
            }
        }
    });

    return Array.from(namedImports.values())
        .concat(Array.from(namespaceImports.values()))
        .sort((a, b) => (a.moduleSpecifier < b.moduleSpecifier ? -1 : a.moduleSpecifier > b.moduleSpecifier ? 1 : 0));
};
