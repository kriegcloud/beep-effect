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

import { ErrorCode, IType, PrimitiveType } from "conjure-api";
import * as fs from "fs";
import * as path from "path";
import { directory } from "tempy";
import { DEFAULT_TYPE_GENERATION_FLAGS } from "../../../__tests__/utils/constants";
import { generateError } from "../generators/generateError";
import { SimpleAst } from "../simpleAst";
import { assertOutputAndExpectedAreEqual } from "./testTypesGeneratorTest";

describe("generateError", () => {
    const expectedDir = path.join(__dirname, "./resources");
    let outDir: string;
    let simpleAst: SimpleAst;

    beforeEach(() => {
        outDir = directory();
        simpleAst = new SimpleAst(outDir);
    });

    it("emits to the correct location", async () => {
        await generateError(
            {
                code: ErrorCode.INVALID_ARGUMENT,
                errorName: { name: "Error", package: "com.palantir.errors" },
                namespace: "Metadata",
                safeArgs: [],
                unsafeArgs: [],
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );

        const outFile1 = path.join(outDir, "errors/error.ts");
        expect(fs.existsSync(outFile1)).toBeTruthy();
    });

    it("emits error interface and type guard", async () => {
        await generateError(
            {
                code: ErrorCode.INVALID_ARGUMENT,
                docs: "The views defined by following inputs cover zero transactions.",
                errorName: { name: "PrimitiveError", package: "com.palantir.errors" },
                namespace: "Metadata",
                safeArgs: [
                    {
                        fieldName: "datasetRids",
                        type: IType.list({ itemType: IType.primitive(PrimitiveType.RID) }),
                    },
                    {
                        fieldName: "endTransactionRids",
                        type: IType.list({ itemType: IType.primitive(PrimitiveType.RID) }),
                    },
                ],
                unsafeArgs: [
                    {
                        fieldName: "branchIds",
                        type: IType.list({ itemType: IType.primitive(PrimitiveType.STRING) }),
                    },
                ],
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );

        assertOutputAndExpectedAreEqual(outDir, expectedDir, "errors/primitiveError.ts");
    });

    it("emits errors with imports types", async () => {
        await generateError(
            {
                code: ErrorCode.INVALID_ARGUMENT,
                errorName: { name: "ImportError", package: "com.palantir.errors" },
                namespace: "Metadata",
                safeArgs: [
                    {
                        fieldName: "aliasName",
                        type: IType.primitive(PrimitiveType.UUID),
                    },
                ],
                unsafeArgs: [],
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "errors/importError.ts");
    });
});
