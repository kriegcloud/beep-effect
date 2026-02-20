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

import { IType, ITypeDefinition, PrimitiveType } from "conjure-api";
import * as fs from "fs";
import * as path from "path";
import { directory } from "tempy";
import { createHashableTypeName } from "../../../utils/hashingUtils";
import { DEFAULT_TYPE_GENERATION_FLAGS, FLAVORED_TYPE_GENERATION_FLAGS } from "../../../__tests__/utils/constants";
import { generateAlias, generateEnum, generateObject, generateUnion } from "../generators/generateType";
import { SimpleAst } from "../simpleAst";
import {
    assertDoesNotExist,
    assertOutputAndExpectedAreEqual,
    foreignObject,
    typesLocalObject as localObject,
} from "./testTypesGeneratorTest";

const stringAliasName = { name: "StringAlias", package: "com.palantir.types" };
const stringAlias: ITypeDefinition = ITypeDefinition.alias({
    alias: { primitive: PrimitiveType.STRING, type: "primitive" },
    typeName: stringAliasName,
});
const stringAliasReference: IType = IType.reference(stringAliasName);

const integerAliasName = { name: "NumberAlias", package: "com.palantir.types" };
const integerAlias: ITypeDefinition = ITypeDefinition.alias({
    alias: { primitive: PrimitiveType.INTEGER, type: "primitive" },
    typeName: integerAliasName,
});
const integerAliasReference: IType = IType.reference(integerAliasName);

const binaryAliasName = { name: "BinaryAlias", package: "com.palantir.types" };
const binaryAlias: ITypeDefinition = ITypeDefinition.alias({
    alias: { primitive: PrimitiveType.BINARY, type: "primitive" },
    typeName: binaryAliasName,
});
const binaryAliasReference: IType = IType.reference(binaryAliasName);

const dateAliasName = { name: "DateAlias", package: "com.palantir.types" };
const dateAlias: ITypeDefinition = ITypeDefinition.alias({
    alias: { primitive: PrimitiveType.DATETIME, type: "primitive" },
    typeName: binaryAliasName,
});
const dateAliasReference: IType = IType.reference(dateAliasName);

describe("generateType", () => {
    const expectedDir = path.join(__dirname, "./resources");
    let outDir: string;
    let simpleAst: SimpleAst;

    beforeEach(() => {
        outDir = directory();
        simpleAst = new SimpleAst(outDir);
    });

    it("emits to the correct location", async () => {
        await generateEnum(
            {
                typeName: { name: "MyEnum", package: "com.palantir.types" },
                values: [{ value: "FOO" }, { value: "BAR" }],
            },
            simpleAst,
        );
        const outFile = path.join(outDir, "types/myEnum.ts");
        expect(fs.existsSync(outFile)).toBeTruthy();
    });

    it("emits enums", async () => {
        await generateEnum(
            {
                typeName: { name: "EnumExample", package: "com.palantir.types" },
                values: [{ value: "ONE" }, { value: "TWO" }],
            },
            simpleAst,
        );

        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/enumExample.ts");
    });

    it("emits enums with docs", async () => {
        await generateEnum(
            {
                docs: "Some documentation",
                typeName: { name: "EnumWithDocs", package: "com.palantir.types" },
                values: [{ value: "FOO", docs: "Some field documentation" }, { value: "BAR" }],
            },
            simpleAst,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/enumWithDocs.ts");
    });

    it("emits objects with primitive fields", async () => {
        await generateObject(
            {
                fields: [
                    {
                        fieldName: "bar",
                        type: IType.primitive(PrimitiveType.INTEGER),
                    },
                    {
                        fieldName: "foo",
                        type: IType.primitive(PrimitiveType.STRING),
                    },
                ],
                typeName: { name: "PrimitiveObject", package: "com.palantir.types" },
            },
            new Map(),
            simpleAst,
            FLAVORED_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/primitiveObject.ts");
    });

    it("emits objects with uuids when flag is on", async () => {
        await generateObject(
            {
                fields: [
                    {
                        fieldName: "uuid",
                        type: IType.primitive(PrimitiveType.UUID),
                    },
                ],
                typeName: { name: "UuidObject", package: "com.palantir.types" },
            },
            new Map(),
            simpleAst,
            FLAVORED_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/uuidObject.ts");
    });

    describe("alias for rids", () => {
        it("emits flavored type for rid when flag is on", async () => {
            await generateAlias(
                {
                    alias: IType.primitive(PrimitiveType.RID),
                    typeName: { name: "CustomEntityRid", package: "com.palantir.types" },
                },
                new Map(),
                simpleAst,
                FLAVORED_TYPE_GENERATION_FLAGS,
            );
            assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/customEntityRid.ts");
        });

        it("does not emit flavored type for rid when flag is off", async () => {
            await generateAlias(
                {
                    alias: IType.primitive(PrimitiveType.RID),
                    typeName: { name: "CustomEntityRidWithFlagOff", package: "com.palantir.types" },
                },
                new Map(),
                simpleAst,
                DEFAULT_TYPE_GENERATION_FLAGS,
            );
            assertDoesNotExist(outDir, "types/customEntityRidWithFlagOff.ts");
        });
    });

    describe("alias for strings", () => {
        it("emits flavored type for strings when flag is on", async () => {
            await generateAlias(
                {
                    alias: IType.primitive(PrimitiveType.STRING),
                    typeName: { name: "StringAlias", package: "com.palantir.types" },
                },
                new Map(),
                simpleAst,
                FLAVORED_TYPE_GENERATION_FLAGS,
            );
            assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/stringAlias.ts");
        });

        it("does not emit flavored type for strings when flag is off", async () => {
            await generateAlias(
                {
                    alias: IType.primitive(PrimitiveType.STRING),
                    typeName: { name: "StringAliasWhenFlagOff", package: "com.palantir.types" },
                },
                new Map(),
                simpleAst,
                DEFAULT_TYPE_GENERATION_FLAGS,
            );
            assertDoesNotExist(outDir, "types/stringAliasWhenFlagOff.ts");
        });
    });

    describe("alias for integers", () => {
        it("emits flavored type for integers when flag is on", async () => {
            await generateAlias(
                {
                    alias: IType.primitive(PrimitiveType.INTEGER),
                    typeName: { name: "IntegerAlias", package: "com.palantir.types" },
                },
                new Map(),
                simpleAst,
                FLAVORED_TYPE_GENERATION_FLAGS,
            );
            assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/integerAlias.ts");
        });

        it("emits flavored type for integers when flag is on", async () => {
            await generateAlias(
                {
                    alias: IType.primitive(PrimitiveType.INTEGER),
                    typeName: { name: "IntegerAliasWithFlagOff", package: "com.palantir.types" },
                },
                new Map(),
                simpleAst,
                DEFAULT_TYPE_GENERATION_FLAGS,
            );
            assertDoesNotExist(outDir, "types/integerAliasWithFlagOff.ts");
        });
    });

    describe("alias for safe longs", () => {
        it("emits flavored type for safe longs when flag is on", async () => {
            await generateAlias(
                {
                    alias: IType.primitive(PrimitiveType.SAFELONG),
                    typeName: { name: "SafeLongAlias", package: "com.palantir.types" },
                },
                new Map(),
                simpleAst,
                FLAVORED_TYPE_GENERATION_FLAGS,
            );
            assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/safeLongAlias.ts");
        });

        it("does not emit flavored type for safe longs when flag is off", async () => {
            await generateAlias(
                {
                    alias: IType.primitive(PrimitiveType.SAFELONG),
                    typeName: { name: "SafeLongAliasWithFlagOff", package: "com.palantir.types" },
                },
                new Map(),
                simpleAst,
                DEFAULT_TYPE_GENERATION_FLAGS,
            );
            assertDoesNotExist(outDir, "types/safeLongAliasWithFlagOff.ts");
        });
    });

    describe("alias for bearer tokens", () => {
        it("emits flavored type for bearer tokens when flag is on", async () => {
            await generateAlias(
                {
                    alias: IType.primitive(PrimitiveType.BEARERTOKEN),
                    typeName: { name: "BearerTokenAlias", package: "com.palantir.types" },
                },
                new Map(),
                simpleAst,
                FLAVORED_TYPE_GENERATION_FLAGS,
            );
            assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/bearerTokenAlias.ts");
        });

        it("does not emit flavored type for bearer tokens when flag is off", async () => {
            await generateAlias(
                {
                    alias: IType.primitive(PrimitiveType.BEARERTOKEN),
                    typeName: { name: "BearerTokenAliasWithFlagOff", package: "com.palantir.types" },
                },
                new Map(),
                simpleAst,
                DEFAULT_TYPE_GENERATION_FLAGS,
            );
            assertDoesNotExist(outDir, "types/bearerTokenAliasWithFlagOff.ts");
        });
    });

    describe("alias for uuids", () => {
        it("emits flavored type for uuids when flag is on", async () => {
            await generateAlias(
                {
                    alias: IType.primitive(PrimitiveType.UUID),
                    typeName: { name: "UuidAlias", package: "com.palantir.types" },
                },
                new Map(),
                simpleAst,
                FLAVORED_TYPE_GENERATION_FLAGS,
            );
            assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/uuidAlias.ts");
        });

        it("does not emit flavored type for uuids when flag is off", async () => {
            await generateAlias(
                {
                    alias: IType.primitive(PrimitiveType.UUID),
                    typeName: { name: "UuidAliasWithFlagOff", package: "com.palantir.types" },
                },
                new Map(),
                simpleAst,
                DEFAULT_TYPE_GENERATION_FLAGS,
            );
            assertDoesNotExist(outDir, "types/uuidAliasWithFlagOff.ts");
        });
    });

    it("emits objects with map of enum", async () => {
        const someEnum = {
            docs: "Some documentation",
            typeName: { name: "EnumWithDocs", package: "com.palantir.types" },
            values: [{ value: "FOO", docs: "Some field documentation" }, { value: "BAR" }],
        };
        await generateObject(
            {
                fields: [
                    {
                        fieldName: "someMap",
                        type: IType.map({
                            keyType: IType.reference(someEnum.typeName),
                            valueType: IType.primitive(PrimitiveType.STRING),
                        }),
                    },
                ],
                typeName: { name: "EnumMapObject", package: "com.palantir.types" },
            },
            new Map([[createHashableTypeName(someEnum.typeName), ITypeDefinition.enum_(someEnum)]]),
            simpleAst,
            FLAVORED_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/enumMapObject.ts");
    });

    it("emits objects with references", async () => {
        await generateObject(
            {
                fields: [
                    {
                        fieldName: "differentPackage",
                        type: foreignObject.reference,
                    },
                    {
                        fieldName: "samePackage",
                        type: localObject.reference,
                    },
                ],
                typeName: { name: "ReferenceObject", package: "com.palantir.types" },
            },
            new Map([
                [createHashableTypeName(foreignObject.typeName), foreignObject.definition],
                [createHashableTypeName(localObject.typeName), localObject.definition],
            ]),
            simpleAst,
            FLAVORED_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/referenceObject.ts");
    });

    it("emits objects with alias references", async () => {
        await generateObject(
            {
                fields: [
                    {
                        fieldName: "referenceAlias",
                        type: localObject.reference,
                    },
                    {
                        fieldName: "stringAlias",
                        type: stringAliasReference,
                    },
                ],
                typeName: { name: "AliasReferenceObject", package: "com.palantir.types" },
            },
            new Map<string, ITypeDefinition>([
                [createHashableTypeName(localObject.typeName), localObject.definition],
                [createHashableTypeName(stringAliasName), stringAlias],
            ]),
            simpleAst,
            FLAVORED_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/aliasReferenceObject.ts");
    });

    it("handles nested aliases", async () => {
        const stringAliasAlias: ITypeDefinition = ITypeDefinition.alias({
            alias: { reference: stringAlias.alias.typeName, type: "reference" },
            typeName: { name: "StringAliasAlias", package: "com.palantir.types" },
        });

        await generateObject(
            {
                fields: [
                    {
                        fieldName: "stringAliasAlias",
                        type: IType.reference(stringAliasAlias.alias.typeName),
                    },
                ],
                typeName: { name: "NestedAliasReferenceObject", package: "com.palantir.types" },
            },
            new Map([
                [createHashableTypeName(stringAliasAlias.alias.typeName), stringAliasAlias],
                [createHashableTypeName(stringAlias.alias.typeName), stringAlias],
            ]),
            simpleAst,
            FLAVORED_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/nestedAliasReferenceObject.ts");
    });

    it("emits objects with optional fields", async () => {
        await generateObject(
            {
                fields: [
                    {
                        fieldName: "optionalString",
                        type: {
                            optional: {
                                itemType: { primitive: PrimitiveType.STRING, type: "primitive" },
                            },
                            type: "optional",
                        },
                    },
                ],
                typeName: { name: "OptionalObject", package: "com.palantir.types" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/optionalObject.ts");
    });

    it("emits objects with docs", async () => {
        await generateObject(
            {
                docs: "my object",
                fields: [
                    {
                        docs: "docs",
                        fieldName: "bar",
                        type: IType.primitive(PrimitiveType.INTEGER),
                    },
                    {
                        docs: "more docs",
                        fieldName: "foo",
                        type: IType.primitive(PrimitiveType.STRING),
                    },
                ],
                typeName: { name: "ObjectWithDocs", package: "com.palantir.types" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/objectWithDocs.ts");
    });

    it("emits unions with primitive fields", async () => {
        await generateUnion(
            {
                typeName: { name: "PrimitiveUnion", package: "com.palantir.types" },
                union: [
                    {
                        fieldName: "bar",
                        type: IType.primitive(PrimitiveType.INTEGER),
                    },
                    {
                        fieldName: "foo",
                        type: IType.primitive(PrimitiveType.STRING),
                    },
                    {
                        fieldName: "uuid",
                        type: IType.primitive(PrimitiveType.UUID),
                    },
                ],
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/primitiveUnion.ts");
    });

    it("emits complex union", async () => {
        await generateUnion(
            {
                typeName: { name: "UnionTypeExample", package: "com.palantir.types" },
                union: [
                    { fieldName: "string", type: IType.primitive(PrimitiveType.STRING) },
                    { fieldName: "set", type: IType.set({ itemType: IType.primitive(PrimitiveType.STRING) }) },
                ],
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/unionTypeExample.ts");
    });

    it("emits unions with docs", async () => {
        await generateUnion(
            {
                docs: "Some documentation",
                typeName: { name: "UnionWithDocs", package: "com.palantir.types" },
                union: [
                    {
                        docs: "Some field documentation",
                        fieldName: "bar",
                        type: IType.primitive(PrimitiveType.INTEGER),
                    },
                    {
                        fieldName: "foo",
                        type: IType.primitive(PrimitiveType.STRING),
                    },
                ],
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/unionWithDocs.ts");
    });

    it("sanitizes keywords in union factory names", async () => {
        await generateUnion(
            {
                typeName: { name: "MyUnion", package: "com.palantir.types" },
                union: [
                    {
                        fieldName: "enum",
                        type: IType.primitive(PrimitiveType.STRING),
                    },
                    {
                        fieldName: "function",
                        type: IType.primitive(PrimitiveType.INTEGER),
                    },
                ],
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "types/myUnion.ts");
        const contents = fs.readFileSync(outFile, "utf8");

        expect(contents).toContain(`function enum_(obj: string): IMyUnion_Enum {
    return {
        enum: obj,
        type: "enum",
    };
}`);
        expect(contents).toContain(`function function_(obj: number): IMyUnion_Function {
    return {
        function: obj,
        type: "function",
    };
}`);
    });

    it("emits imports for unions with references", async () => {
        await generateUnion(
            {
                typeName: { name: "MyUnion", package: "com.palantir.types" },
                union: [
                    {
                        fieldName: "bar",
                        type: foreignObject.reference,
                    },
                    {
                        fieldName: "foo",
                        type: localObject.reference,
                    },
                    {
                        fieldName: "stringAliasReference",
                        type: stringAliasReference,
                    },
                ],
            },
            new Map([
                [createHashableTypeName(foreignObject.typeName), foreignObject.definition],
                [createHashableTypeName(localObject.typeName), localObject.definition],
                [createHashableTypeName(stringAliasName), stringAlias],
            ]),
            simpleAst,
            FLAVORED_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "types/myUnion.ts");
        const contents = fs.readFileSync(outFile, "utf8");
        expect(contents).toContain(
            `import { IOtherObject } from "../other/otherObject";
import { ISomeObject } from "./someObject";
import { IStringAlias } from "./stringAlias";
`,
        );
    });

    it("emits unions with alias references", async () => {
        await generateUnion(
            {
                typeName: { name: "MyUnion", package: "com.palantir.types" },
                union: [
                    {
                        fieldName: "referenceAlias",
                        type: localObject.reference,
                    },
                    {
                        fieldName: "integerAlias",
                        type: integerAliasReference,
                    },
                    {
                        fieldName: "stringAlias",
                        type: stringAliasReference,
                    },
                    {
                        fieldName: "binaryAlias",
                        type: binaryAliasReference,
                    },
                    {
                        fieldName: "dateAlias",
                        type: dateAliasReference,
                    },
                ],
            },
            new Map<string, ITypeDefinition>([
                [createHashableTypeName(localObject.typeName), localObject.definition],

                // integer and string alias should be flavorized
                [createHashableTypeName(integerAliasName), integerAlias],
                [createHashableTypeName(stringAliasName), stringAlias],

                // binary and date aliases shouldn't be "flavorized"
                [createHashableTypeName(binaryAliasName), binaryAlias],
                [createHashableTypeName(dateAliasName), dateAlias],
            ]),
            simpleAst,
            FLAVORED_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "types/myUnion.ts");
        const contents = fs.readFileSync(outFile, "utf8");
        const expectedContent = `
import { INumberAlias } from "./numberAlias";
import { ISomeObject } from "./someObject";
import { IStringAlias } from "./stringAlias";

export interface IMyUnion_ReferenceAlias {
    'referenceAlias': ISomeObject;
    'type': "referenceAlias";
}

export interface IMyUnion_IntegerAlias {
    'integerAlias': INumberAlias;
    'type': "integerAlias";
}

export interface IMyUnion_StringAlias {
    'stringAlias': IStringAlias;
    'type': "stringAlias";
}

export interface IMyUnion_BinaryAlias {
    'binaryAlias': string;
    'type': "binaryAlias";
}

export interface IMyUnion_DateAlias {
    'dateAlias': string;
    'type': "dateAlias";
}
`.trim();
        expect(contents).toContain(expectedContent);
    });

    it("emits unions of unions", async () => {
        const littleTypeName = { name: "Little", package: "com.palantir.types" };
        const littleUnion = {
            typeName: littleTypeName,
            union: [{ fieldName: "double", type: IType.primitive(PrimitiveType.DOUBLE) }],
        };
        await generateUnion(littleUnion, new Map(), simpleAst, DEFAULT_TYPE_GENERATION_FLAGS);
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/little.ts");

        await generateUnion(
            {
                typeName: { name: "Big", package: "com.palantir.types" },
                union: [{ fieldName: "little", type: IType.reference(littleTypeName) }],
            },
            new Map([[createHashableTypeName(littleTypeName), ITypeDefinition.union(littleUnion)]]),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/big.ts");
    });

    it("emits recursively defined unions", async () => {
        const recursiveObject: ITypeDefinition = ITypeDefinition.union({
            typeName: { name: "RecursiveUnion", package: "com.palantir.types" },
            union: [
                {
                    fieldName: "recursiveField",
                    type: IType.reference({ name: "RecursiveUnion", package: "com.palantir.types" }),
                },
                {
                    fieldName: "stringAlias",
                    type: stringAliasReference,
                },
            ],
        });

        await generateUnion(
            recursiveObject.union,
            new Map<string, ITypeDefinition>([
                [createHashableTypeName(recursiveObject.union.typeName), recursiveObject],
                [createHashableTypeName(stringAliasName), stringAlias],
            ]),
            simpleAst,
            FLAVORED_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/recursiveUnion.ts");
    });

    it("emits recursively defined objects", async () => {
        const recursiveObject: ITypeDefinition = ITypeDefinition.object({
            fields: [
                {
                    fieldName: "recursiveField",
                    type: IType.reference({ name: "RecursiveObject", package: "com.palantir.types" }),
                },
                {
                    fieldName: "stringAlias",
                    type: stringAliasReference,
                },
            ],
            typeName: { name: "RecursiveObject", package: "com.palantir.types" },
        });

        await generateObject(
            recursiveObject.object,
            new Map<string, ITypeDefinition>([
                [createHashableTypeName(recursiveObject.object.typeName), recursiveObject],
                [createHashableTypeName(stringAliasName), stringAlias],
            ]),
            simpleAst,
            FLAVORED_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/recursiveObject.ts");
    });
});
