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
import * as fs from "fs-extra";
import * as path from "path";
import { directory } from "tempy";
import { DEFAULT_TYPE_GENERATION_FLAGS } from "../../../__tests__/utils/constants";
import { createSimpleObject } from "../../../__tests__/utils/createSimpleObject";
import { generateType } from "../generators/generateType";
import { SimpleAst } from "../simpleAst";

export function assertOutputAndExpectedAreEqual(outDir: string, expectedDir: string, fname: string) {
    const actualFilePath = path.join(outDir, fname);
    const actual = fs.readFileSync(actualFilePath, "utf8");
    const expectedFilePath = path.join(expectedDir, fname);
    if (process.env.RECREATE === "true") {
        fs.mkdirpSync(path.dirname(expectedFilePath));
        fs.writeFileSync(expectedFilePath, actual);
    } else {
        const expected = fs.readFileSync(expectedFilePath, "utf8");
        try {
            expect(actual).toEqual(expected);
        } catch (error) {
            // Ideally this would be a part of the expect fail message but that requires custom matchers.
            console.error(`Expected '${actualFilePath}' contents to match '${expectedFilePath}'`);
            throw error;
        }
    }
}

export function assertDoesNotExist(outDir: string, fname: string) {
    const doesFileExist = fs.existsSync(path.join(outDir, fname));
    expect(doesFileExist).toBe(false);
}

export const typesLocalObject = createSimpleObject("SomeObject", "com.palantir.types");
export const servicesLocalObject = createSimpleObject("SomeObject", "com.palantir.services");
export const importsLocalObject = createSimpleObject("SomeObject", "com.palantir.imports");
export const foreignObject = createSimpleObject("OtherObject", "com.palantir.other");

describe("testTypesGenerator", () => {
    const expectedDir = path.join(__dirname, "./resources");
    let outDir: string;
    let simpleAst: SimpleAst;

    beforeEach(() => {
        outDir = directory();
        simpleAst = new SimpleAst(outDir);
    });

    it("generate type with many fields", async () => {
        await generateType(
            ITypeDefinition.object({
                typeName: { package: "com.palantir.types", name: "ManyFieldExample" },
                fields: [
                    { fieldName: "string", type: IType.primitive(PrimitiveType.STRING) },
                    { fieldName: "integer", type: IType.primitive(PrimitiveType.INTEGER) },
                    {
                        fieldName: "optionalItem",
                        type: IType.optional({ itemType: IType.primitive(PrimitiveType.STRING) }),
                    },
                    { fieldName: "items", type: IType.list({ itemType: IType.primitive(PrimitiveType.STRING) }) },
                ],
            }),
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/manyFieldExample.ts");
    });

    it("generates types local object", async () => {
        await generateType(typesLocalObject.definition, new Map(), simpleAst, DEFAULT_TYPE_GENERATION_FLAGS);
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "types/someObject.ts");
    });

    it("generates services local object", async () => {
        await generateType(servicesLocalObject.definition, new Map(), simpleAst, DEFAULT_TYPE_GENERATION_FLAGS);
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "services/someObject.ts");
    });
    it("generates foreign object", async () => {
        await generateType(foreignObject.definition, new Map(), simpleAst, DEFAULT_TYPE_GENERATION_FLAGS);
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "other/otherObject.ts");
    });
});
