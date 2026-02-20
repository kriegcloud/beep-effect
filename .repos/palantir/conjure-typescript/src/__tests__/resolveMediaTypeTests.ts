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
import { createHashableTypeName } from "../utils/hashingUtils";
import { resolveMediaType } from "../utils/resolveMediaType";

const objectName = { name: "Object", package: "com.palantir.types" };
const objectReference = IType.reference(objectName);
const object = ITypeDefinition.object({
    fields: [],
    typeName: objectName,
});

const aliasName = { name: "Alias", package: "com.palantir.types" };
const aliasReference = IType.reference(aliasName);
const alias = ITypeDefinition.alias({
    alias: { primitive: PrimitiveType.STRING, type: "primitive" },
    typeName: aliasName,
});

const binaryAliasName = { name: "BinaryAlias", package: "com.palantir.types" };
const binaryAliasReference = IType.reference(binaryAliasName);
const binaryAlias = ITypeDefinition.alias({
    alias: { primitive: PrimitiveType.BINARY, type: "primitive" },
    typeName: binaryAliasName,
});

const enumName = { name: "Enum", package: "com.palantir.types" };
const enumType = ITypeDefinition.enum_({
    typeName: enumName,
    values: [{ value: "FOO" }],
});

const KNOWN_TYPES = new Map<string, ITypeDefinition>([
    [createHashableTypeName(objectName), object],
    [createHashableTypeName(aliasName), alias],
    [createHashableTypeName(binaryAliasName), binaryAlias],
    [createHashableTypeName(enumName), enumType],
]);

describe("resolveMediaTypeTests", () => {
    it("returns correct media type for primitives", () => {
        expect(resolveMediaType({ type: "primitive", primitive: PrimitiveType.STRING }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(resolveMediaType({ type: "primitive", primitive: PrimitiveType.DATETIME }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(resolveMediaType({ type: "primitive", primitive: PrimitiveType.INTEGER }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(resolveMediaType({ type: "primitive", primitive: PrimitiveType.DOUBLE }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(resolveMediaType({ type: "primitive", primitive: PrimitiveType.SAFELONG }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(resolveMediaType({ type: "primitive", primitive: PrimitiveType.BINARY }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_OCTET_STREAM,
        );
        expect(resolveMediaType({ type: "primitive", primitive: PrimitiveType.ANY }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(resolveMediaType({ type: "primitive", primitive: PrimitiveType.BOOLEAN }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(resolveMediaType({ type: "primitive", primitive: PrimitiveType.RID }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(resolveMediaType({ type: "primitive", primitive: PrimitiveType.BEARERTOKEN }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(resolveMediaType({ type: "primitive", primitive: PrimitiveType.UUID }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
    });

    it("produces error for unknown reference", () => {
        expect(() => resolveMediaType({ type: "reference", reference: objectName }, new Map())).toThrowError(
            /Unknown reference type/,
        );
    });

    it("returns application/json for reference type", () => {
        expect(resolveMediaType({ type: "reference", reference: objectName }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
    });

    it("follows alias reference for media type", () => {
        expect(resolveMediaType({ type: "reference", reference: aliasName }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(resolveMediaType({ type: "reference", reference: binaryAliasName }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_OCTET_STREAM,
        );
    });

    it("returns application/json for enum", () => {
        expect(resolveMediaType({ type: "reference", reference: enumName }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
    });

    it("follows optional element type for media type", () => {
        expect(resolveMediaType({ type: "optional", optional: { itemType: objectReference } }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(
            resolveMediaType({ type: "optional", optional: { itemType: binaryAliasReference } }, KNOWN_TYPES),
        ).toEqual(MediaType.APPLICATION_OCTET_STREAM);
    });

    it("returns application/json for list type", () => {
        expect(resolveMediaType({ type: "list", list: { itemType: objectReference } }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(resolveMediaType({ type: "list", list: { itemType: binaryAliasReference } }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
    });

    it("returns application/json for set type", () => {
        expect(resolveMediaType({ type: "set", set: { itemType: objectReference } }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
        expect(resolveMediaType({ type: "set", set: { itemType: binaryAliasReference } }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
    });

    it("returns application/json for map type", () => {
        expect(
            resolveMediaType(
                { type: "map", map: { keyType: aliasReference, valueType: objectReference } },
                KNOWN_TYPES,
            ),
        ).toEqual(MediaType.APPLICATION_JSON);
        expect(
            resolveMediaType(
                { type: "map", map: { keyType: aliasReference, valueType: binaryAliasReference } },
                KNOWN_TYPES,
            ),
        ).toEqual(MediaType.APPLICATION_JSON);
    });

    it("returns application/json for external types", () => {
        const unusedTypeName = { name: "Unused", package: "com.palantir.types" };
        const externalType = {
            externalReference: unusedTypeName,
            fallback: IType.primitive(PrimitiveType.ANY),
        };
        expect(resolveMediaType({ type: "external", external: externalType }, KNOWN_TYPES)).toEqual(
            MediaType.APPLICATION_JSON,
        );
    });
});
