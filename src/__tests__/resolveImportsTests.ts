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
import { ImportDeclarationStructure, StructureKind } from "ts-morph";
import { createHashableTypeName } from "../utils/hashingUtils";
import {
    resolveImportsForExternalType,
    resolveImportsForListType,
    resolveImportsForMapType,
    resolveImportsForOptionalType,
    resolveImportsForPrimitiveType,
    resolveImportsForReferenceType,
    resolveImportsForSetType,
    sortImports,
} from "../utils/resolveImports";
import { FLAVORED_TYPE_GENERATION_FLAGS as GENERATION_FLAGS_TO_USE_FOR_IMPORTS } from "./utils/constants";
import { createSimpleObject } from "./utils/createSimpleObject";

const localObject = createSimpleObject("SomeObject", "com.palantir.imports");
const foreignObject = createSimpleObject("OtherObject", "com.palantir.other");

const stringAliasName = { name: "Alias", package: "com.palantir.imports" };
const stringAlias = ITypeDefinition.alias({
    alias: { primitive: PrimitiveType.STRING, type: "primitive" },
    typeName: stringAliasName,
});

const listReferenceAliasName = { name: "ComplexAlias", package: "com.palantir.imports" };
const listReferenceAlias = ITypeDefinition.alias({
    alias: IType.list({ itemType: localObject.reference }),
    typeName: listReferenceAliasName,
});

const enumName = { name: "Enum", package: "com.palantir.imports" };
const enumType = ITypeDefinition.enum_({
    typeName: enumName,
    values: [{ value: "FOO" }],
});

const BASE_TYPE_NAME = { name: "Foo", package: "com.palantir.foo" };

const KNOWN_TYPES = new Map<string, ITypeDefinition>([
    [createHashableTypeName(localObject.typeName), localObject.definition],
    [createHashableTypeName(foreignObject.typeName), localObject.definition],
    [createHashableTypeName(stringAliasName), stringAlias],
    [createHashableTypeName(listReferenceAliasName), listReferenceAlias],
    [createHashableTypeName(enumName), enumType],
]);

describe("resolveImports", () => {
    it("produces no imports for all primitive types except uuid", () => {
        expect(resolveImportsForPrimitiveType(PrimitiveType.STRING)).toEqual([]);
        expect(resolveImportsForPrimitiveType(PrimitiveType.DATETIME)).toEqual([]);
        expect(resolveImportsForPrimitiveType(PrimitiveType.INTEGER)).toEqual([]);
        expect(resolveImportsForPrimitiveType(PrimitiveType.DOUBLE)).toEqual([]);
        expect(resolveImportsForPrimitiveType(PrimitiveType.SAFELONG)).toEqual([]);
        expect(resolveImportsForPrimitiveType(PrimitiveType.BINARY)).toEqual([]);
        expect(resolveImportsForPrimitiveType(PrimitiveType.ANY)).toEqual([]);
        expect(resolveImportsForPrimitiveType(PrimitiveType.BOOLEAN)).toEqual([]);
        expect(resolveImportsForPrimitiveType(PrimitiveType.RID)).toEqual([]);
        expect(resolveImportsForPrimitiveType(PrimitiveType.BEARERTOKEN)).toEqual([]);
    });

    it("produces error for unknown reference type", () => {
        resolveImportsForReferenceType(
            localObject.typeName,
            BASE_TYPE_NAME,
            KNOWN_TYPES,
            GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
        );

        expect(() =>
            resolveImportsForReferenceType(
                localObject.typeName,
                BASE_TYPE_NAME,
                new Map(),
                GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
            ),
        ).toThrowError(/Unknown reference type/);
    });

    it("produces import for reference type in the same package", () => {
        expect(
            resolveImportsForReferenceType(
                localObject.typeName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
            ),
        ).toEqual([namedImport("../imports/someObject", "ISomeObject")]);
    });

    it("produces import for reference type in different package", () => {
        expect(
            resolveImportsForReferenceType(
                foreignObject.typeName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
            ),
        ).toEqual([namedImport("../other/otherObject", "IOtherObject")]);
    });

    it("follows alias reference", () => {
        expect(
            resolveImportsForReferenceType(
                stringAliasName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
            ),
        ).toEqual([namedImport("../imports/alias", "IAlias")]);
        expect(
            resolveImportsForReferenceType(
                listReferenceAliasName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
            ),
        ).toEqual([namedImport("../imports/someObject", "ISomeObject")]);
    });

    it("returns enum import without I prefix", () => {
        expect(
            resolveImportsForReferenceType(enumName, BASE_TYPE_NAME, KNOWN_TYPES, GENERATION_FLAGS_TO_USE_FOR_IMPORTS),
        ).toEqual([namedImport("../imports/enum", "Enum")]);
    });

    it("produces imports for optional type", () => {
        expect(
            resolveImportsForOptionalType(
                { itemType: localObject.reference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
            ),
        ).toEqual([namedImport("../imports/someObject", "ISomeObject")]);
    });

    it("produces imports for list type", () => {
        expect(
            resolveImportsForListType(
                { itemType: localObject.reference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
            ),
        ).toEqual([namedImport("../imports/someObject", "ISomeObject")]);
    });

    it("produces imports for set type", () => {
        expect(
            resolveImportsForSetType(
                { itemType: localObject.reference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
            ),
        ).toEqual([namedImport("../imports/someObject", "ISomeObject")]);
    });

    it("produces imports for map type", () => {
        expect(
            resolveImportsForMapType(
                { keyType: localObject.reference, valueType: foreignObject.reference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
            ),
        ).toEqual([
            namedImport("../imports/someObject", "ISomeObject"),
            namedImport("../other/otherObject", "IOtherObject"),
        ]);
    });

    it("follows primitive external fallback", () => {
        const unusedTypeName = { name: "Unused", package: "" };
        expect(
            resolveImportsForExternalType(
                {
                    externalReference: unusedTypeName,
                    fallback: IType.primitive(PrimitiveType.ANY),
                },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
            ),
        ).toEqual([]);
    });

    it("follows complex external fallback", () => {
        const unusedTypeName = { name: "Unused", package: "" };
        expect(
            resolveImportsForExternalType(
                {
                    externalReference: unusedTypeName,
                    fallback: IType.list({ itemType: localObject.reference }),
                },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
            ),
        ).toEqual([namedImport("../imports/someObject", "ISomeObject")]);
    });

    it("sorts imports", () => {
        const module1 = "../bar";
        const module2 = "../foo";
        const module3 = "./Bar";
        const module4 = "./bar";
        expect(
            sortImports([
                namedImport(module4, "D"),
                namedImport(module3, "C"),
                namedImport(module2, "B"),
                namedImport(module1, "A"),
            ]).map(({ moduleSpecifier }) => moduleSpecifier),
        ).toEqual([module1, module2, module3, module4]);
    });

    it("does not emit duplicate imports", async () => {
        const imports = sortImports([namedImport("module", "A"), namedImport("module", "A")]);
        expect(imports.length).toEqual(1);
        expect(imports[0].namedImports!.length).toEqual(1);
    });

    it("combines imports from the same module", () => {
        const imports = sortImports([namedImport("module", "A"), namedImport("module", "B")]);
        expect(imports.length).toEqual(1);
        expect(imports[0].namedImports!.length).toEqual(2);
    });

    it("adds both named and namespace imports", async () => {
        const imports = sortImports([
            namedImport("module", "name"),
            { kind: StructureKind.ImportDeclaration, moduleSpecifier: "module", namespaceImport: "namespace" },
        ]);
        expect(imports.length).toEqual(2);
    });

    it("throws if both namespaceImport and namedImports are defined", () => {
        const sort = () =>
            sortImports([
                {
                    kind: StructureKind.ImportDeclaration,
                    moduleSpecifier: "module",
                    namedImports: [{ name: "name" }],
                    namespaceImport: "namespace",
                },
            ]);
        expect(sort).toThrowError("expected only one of the fields 'namedImports' and 'namespaceImport' to be defined");
    });

    it("throws for multiple namespace imports for same module", () => {
        const sort = () =>
            sortImports([
                {
                    kind: StructureKind.ImportDeclaration,
                    moduleSpecifier: "module",
                    namespaceImport: "namespace",
                },
                {
                    kind: StructureKind.ImportDeclaration,
                    moduleSpecifier: "module",
                    namespaceImport: "anotherNamespace",
                },
            ]);
        expect(sort).toThrowError("Only one namespace import for module 'module' is permitted");
    });

    it("generates relative imports", async () => {
        const someType = { package: "com.palantir.foo", name: "Foo" };
        const otherType = { package: "com.palantir.foo.request", name: "Bar" };

        expect(
            resolveImportsForReferenceType(
                otherType,
                someType,
                new Map([
                    [
                        createHashableTypeName(otherType),
                        ITypeDefinition.object({
                            fields: [],
                            typeName: otherType,
                        }),
                    ],
                ]),
                GENERATION_FLAGS_TO_USE_FOR_IMPORTS,
            ),
        ).toEqual([namedImport("../foo-request/bar", `I${otherType.name}`)]);
    });
});

const namedImport = (moduleSpecifier: string, name: string): ImportDeclarationStructure => {
    return {
        kind: StructureKind.ImportDeclaration,
        moduleSpecifier,
        namedImports: [{ name }],
    };
};
