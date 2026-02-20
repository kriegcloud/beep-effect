/**
 * @license
 * Copyright 2018 Palantir Technologies, Inc.
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

import { IExternalReference, IType, ITypeDefinition, PrimitiveType } from "conjure-api";
import { createHashableTypeName } from "../utils/hashingUtils";
import {
    resolveTsType,
    resolveTsTypeForExternalType,
    resolveTsTypeForListType,
    resolveTsTypeForMapType,
    resolveTsTypeForOptionalType,
    resolveTsTypeForPrimitiveType,
    resolveTsTypeForReferenceType,
    resolveTsTypeForSetType,
} from "../utils/resolveTsType";
import {
    DEFAULT_TYPE_GENERATION_FLAGS,
    FLAVORED_TYPE_GENERATION_FLAGS,
    READONLY_TYPE_GENERATION_FLAGS,
} from "./utils/constants";

const objectName = { name: "Object", package: "com.palantir.types" };
const objectReference = IType.reference(objectName);
const objectTypeDefinition = ITypeDefinition.object({
    fields: [],
    typeName: objectName,
});

const aliasName = { name: "Alias", package: "com.palantir.types" };
const aliasReference = IType.reference(aliasName);
const aliasTypeDefinition = ITypeDefinition.alias({
    alias: { primitive: PrimitiveType.STRING, type: "primitive" },
    typeName: aliasName,
});

const binaryAliasName = { name: "BinaryAlias", package: "com.palantir.types" };
const binaryAliasReference = IType.reference(binaryAliasName);
const binaryAliasTypeDefinition = ITypeDefinition.alias({
    alias: { primitive: PrimitiveType.BINARY, type: "primitive" },
    typeName: binaryAliasName,
});

const enumName = { name: "Enum", package: "com.palantir.types" };
const enumReference = IType.reference(enumName);
const enumTypeDefinition = ITypeDefinition.enum_({
    typeName: enumName,
    values: [{ value: "FOO" }],
});

const unionName = { name: "Union", package: "com.palantir.types" };
const unionTypeDefinition = ITypeDefinition.union({
    typeName: unionName,
    union: [],
});

const BASE_TYPE_NAME = { name: "baseType", package: "com.palantir.example" };

const KNOWN_TYPES = new Map<string, ITypeDefinition>([
    [createHashableTypeName(objectName), objectTypeDefinition],
    [createHashableTypeName(aliasName), aliasTypeDefinition],
    [createHashableTypeName(binaryAliasName), binaryAliasTypeDefinition],
    [createHashableTypeName(enumName), enumTypeDefinition],
    [createHashableTypeName(unionName), unionTypeDefinition],
]);

describe("resolveTsTypeForPrimitiveType", () => {
    it("returns correct type for non-top-level-binary and non-parameter type", () => {
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.STRING, false, false)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.DATETIME, false, false)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.RID, false, false)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.BEARERTOKEN, false, false)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.UUID, false, false)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.BINARY, false, false)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.INTEGER, false, false)).toEqual("number");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.SAFELONG, false, false)).toEqual("number");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.DOUBLE, false, false)).toEqual('number | "NaN"');
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.BOOLEAN, false, false)).toEqual("boolean");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.ANY, false, false)).toEqual("any");
    });

    it("returns correct type for non-top-level-binary and parameter type", () => {
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.STRING, true, false)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.DATETIME, true, false)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.RID, true, false)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.BEARERTOKEN, true, false)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.UUID, true, false)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.BINARY, true, false)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.INTEGER, true, false)).toEqual("number");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.SAFELONG, true, false)).toEqual("number");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.DOUBLE, true, false)).toEqual('number | "NaN"');
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.BOOLEAN, true, false)).toEqual("boolean");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.ANY, true, false)).toEqual("any");
    });

    it("returns correct type for top-level-binary and non-parameter type", () => {
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.STRING, false, true)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.DATETIME, false, true)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.RID, false, true)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.BEARERTOKEN, false, true)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.UUID, false, true)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.BINARY, false, true)).toEqual("ReadableStream<Uint8Array>");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.INTEGER, false, true)).toEqual("number");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.SAFELONG, false, true)).toEqual("number");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.DOUBLE, false, true)).toEqual('number | "NaN"');
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.BOOLEAN, false, true)).toEqual("boolean");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.ANY, false, true)).toEqual("any");
    });

    it("returns correct type for top-level-binary and parameter type", () => {
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.STRING, true, true)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.DATETIME, true, true)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.RID, true, true)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.BEARERTOKEN, true, true)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.UUID, true, true)).toEqual("string");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.BINARY, true, true)).toEqual(
            "ReadableStream<Uint8Array> | BufferSource | Blob",
        );
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.INTEGER, true, true)).toEqual("number");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.SAFELONG, true, true)).toEqual("number");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.DOUBLE, true, true)).toEqual('number | "NaN"');
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.BOOLEAN, true, true)).toEqual("boolean");
        expect(resolveTsTypeForPrimitiveType(PrimitiveType.ANY, true, true)).toEqual("any");
    });
});

describe("resolveTsTypeForListType", () => {
    it("returns correct type for non-read-only interfaces generation flag", () => {
        expect(
            resolveTsTypeForListType(
                { itemType: objectReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("Array<IObject>");

        expect(
            resolveTsTypeForListType(
                { itemType: binaryAliasReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("Array<string>");

        expect(
            resolveTsTypeForListType(
                { itemType: binaryAliasReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                true,
            ),
        ).toEqual("Array<string>");
    });

    it("returns correct type for read-only interfaces generation flag", () => {
        expect(
            resolveTsTypeForListType(
                { itemType: objectReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                READONLY_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("ReadonlyArray<IObject>");

        expect(
            resolveTsTypeForListType(
                { itemType: binaryAliasReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                READONLY_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("ReadonlyArray<string>");

        expect(
            resolveTsTypeForListType(
                { itemType: binaryAliasReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                READONLY_TYPE_GENERATION_FLAGS,
                true,
            ),
        ).toEqual("ReadonlyArray<string>");
    });
});

describe("resolveTsTypeForSetType", () => {
    it("returns correct type for non-read-only interfaces generation flag", () => {
        expect(
            resolveTsTypeForSetType(
                { itemType: objectReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("Array<IObject>");

        expect(
            resolveTsTypeForSetType(
                { itemType: binaryAliasReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("Array<string>");

        expect(
            resolveTsTypeForSetType(
                { itemType: binaryAliasReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                true,
            ),
        ).toEqual("Array<string>");
    });

    it("returns correct type for read-only interfaces generation flag", () => {
        expect(
            resolveTsTypeForSetType(
                { itemType: objectReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                READONLY_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("ReadonlyArray<IObject>");

        expect(
            resolveTsTypeForSetType(
                { itemType: binaryAliasReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                READONLY_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("ReadonlyArray<string>");

        expect(
            resolveTsTypeForSetType(
                { itemType: binaryAliasReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                READONLY_TYPE_GENERATION_FLAGS,
                true,
            ),
        ).toEqual("ReadonlyArray<string>");
    });
});

describe("resolveTsTypeForMapType", () => {
    it("returns correct type with string key for non-read-only interfaces generation flag", () => {
        expect(
            resolveTsTypeForMapType(
                { keyType: aliasReference, valueType: objectReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("{ [key: string]: IObject }");

        expect(
            resolveTsTypeForMapType(
                { keyType: aliasReference, valueType: binaryAliasReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                true,
            ),
        ).toEqual("{ [key: string]: string }");

        expect(
            resolveTsType(
                {
                    type: "map",
                    map: { keyType: aliasReference, valueType: binaryAliasReference },
                },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
                true,
            ),
        ).toEqual("{ [key: string]: string }");
    });

    it("returns correct type with enum key for non-read-only interfaces generation flag", () => {
        const resolvedType = resolveTsTypeForMapType(
            { keyType: enumReference, valueType: objectReference },
            BASE_TYPE_NAME,
            KNOWN_TYPES,
            DEFAULT_TYPE_GENERATION_FLAGS,
            true,
        );
        expect(resolvedType).toEqual(`{ [key in ${enumName.name}]?: IObject }`);
    });

    it("returns correct type with string key for read-only interfaces generation flag", () => {
        expect(
            resolveTsTypeForMapType(
                { keyType: aliasReference, valueType: objectReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                READONLY_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("{ readonly [key: string]: IObject }");

        expect(
            resolveTsTypeForMapType(
                { keyType: aliasReference, valueType: binaryAliasReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                READONLY_TYPE_GENERATION_FLAGS,
                true,
            ),
        ).toEqual("{ readonly [key: string]: string }");

        expect(
            resolveTsType(
                {
                    type: "map",
                    map: { keyType: aliasReference, valueType: binaryAliasReference },
                },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                READONLY_TYPE_GENERATION_FLAGS,
                false,
                true,
            ),
        ).toEqual("{ readonly [key: string]: string }");
    });

    it("returns correct type with enum key for read-only interfaces generation flag", () => {
        const resolvedType = resolveTsTypeForMapType(
            { keyType: enumReference, valueType: objectReference },
            BASE_TYPE_NAME,
            KNOWN_TYPES,
            READONLY_TYPE_GENERATION_FLAGS,
            true,
        );
        expect(resolvedType).toEqual(`{ readonly [key in ${enumName.name}]?: IObject }`);
    });
});

describe("resolveTsTypeForReferenceType", () => {
    it("throws an error for an unknown reference", () => {
        expect(() =>
            resolveTsTypeForReferenceType(
                objectName,
                BASE_TYPE_NAME,
                new Map(),
                FLAVORED_TYPE_GENERATION_FLAGS,
                false,
                false,
            ),
        ).toThrowError(/Unknown reference type/);
    });

    it("resolves reference type", () => {
        expect(
            resolveTsTypeForReferenceType(
                objectName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
                false,
            ),
        ).toEqual("IObject");
    });

    it("follows alias reference", () => {
        expect(
            resolveTsTypeForReferenceType(
                aliasName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
                false,
            ),
        ).toEqual("string");
        expect(
            resolveTsTypeForReferenceType(
                binaryAliasName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                true,
                false,
            ),
        ).toEqual("string");
        expect(
            resolveTsTypeForReferenceType(
                aliasName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
                true,
            ),
        ).toEqual("string");
        expect(
            resolveTsTypeForReferenceType(
                binaryAliasName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
                true,
            ),
        ).toEqual("ReadableStream<Uint8Array>");
    });

    it("follows alias reference with flavored generation flag", () => {
        expect(
            resolveTsTypeForReferenceType(
                aliasName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                FLAVORED_TYPE_GENERATION_FLAGS,
                false,
                false,
            ),
        ).toEqual("IAlias");

        expect(
            resolveTsTypeForReferenceType(
                binaryAliasName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                FLAVORED_TYPE_GENERATION_FLAGS,
                false,
                false,
            ),
        ).toEqual("string");

        expect(
            resolveTsTypeForReferenceType(
                aliasName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                FLAVORED_TYPE_GENERATION_FLAGS,
                false,
                true,
            ),
        ).toEqual("IAlias");

        expect(
            resolveTsTypeForReferenceType(
                binaryAliasName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                FLAVORED_TYPE_GENERATION_FLAGS,
                false,
                true,
            ),
        ).toEqual("ReadableStream<Uint8Array>");
    });

    it("resolves enum reference without I prefix", () => {
        expect(
            resolveTsTypeForReferenceType(
                enumName,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
                false,
            ),
        ).toEqual("Enum");
    });

    it("resolves references to a union in another package with the same name", () => {
        const similarUnionName = { name: BASE_TYPE_NAME.name, package: "com.palantir.types2" };
        const similarUnionTypeDefinition = ITypeDefinition.union({
            typeName: similarUnionName,
            union: [],
        });

        expect(
            resolveTsTypeForReferenceType(
                unionName,
                BASE_TYPE_NAME,
                new Map([
                    ...Array.from(KNOWN_TYPES.entries()),
                    [createHashableTypeName(similarUnionName), similarUnionTypeDefinition],
                ]),
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
                false,
            ),
        ).toEqual(`I${unionName.name}.I${unionName.name}`);
    });
});

describe("resolveTsTypeForOptionalType", () => {
    it("resolves optional type", () => {
        expect(
            resolveTsTypeForOptionalType(
                { itemType: objectReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
                false,
            ),
        ).toEqual("IObject | null");
        expect(
            resolveTsTypeForOptionalType(
                { itemType: binaryAliasReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                true,
                false,
            ),
        ).toEqual("string | null");
        expect(
            resolveTsTypeForOptionalType(
                { itemType: binaryAliasReference },
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
                true,
            ),
        ).toEqual("ReadableStream<Uint8Array> | null");
    });
});

describe("resolveTsTypeForExternalType", () => {
    it("returns correct type for non-read-only interfaces generation flag", () => {
        const unusedTypeName = { name: "Unused", package: "com.palantir.unused" };
        const primitiveExternalType: IExternalReference = {
            externalReference: unusedTypeName,
            fallback: IType.primitive(PrimitiveType.ANY),
        };
        expect(
            resolveTsTypeForExternalType(
                primitiveExternalType,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("any");

        const complexExternalType = {
            externalReference: unusedTypeName,
            fallback: IType.list({ itemType: objectReference }),
        };
        expect(
            resolveTsTypeForExternalType(
                complexExternalType,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                DEFAULT_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("Array<IObject>");
    });

    it("returns correct type for read-only interfaces generation flag", () => {
        const unusedTypeName = { name: "Unused", package: "com.palantir.unused" };
        const complexExternalType = {
            externalReference: unusedTypeName,
            fallback: IType.list({ itemType: objectReference }),
        };
        expect(
            resolveTsTypeForExternalType(
                complexExternalType,
                BASE_TYPE_NAME,
                KNOWN_TYPES,
                READONLY_TYPE_GENERATION_FLAGS,
                false,
            ),
        ).toEqual("ReadonlyArray<IObject>");
    });
});
