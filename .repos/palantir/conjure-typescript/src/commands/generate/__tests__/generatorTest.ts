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

import {
    IAliasDefinition,
    IConjureDefinition,
    IEnumDefinition,
    IObjectDefinition,
    IServiceDefinition,
    ITypeDefinition,
    ITypeDefinitionVisitor,
    ITypeName,
    IUnionDefinition,
} from "conjure-api";
import * as fs from "fs-extra";
import * as path from "path";
import { directory } from "tempy";
import { IServiceGenerationFlags } from "../../../types/serviceGenerationFlags";
import { ITypeGenerationFlags } from "../../../types/typeGenerationFlags";
import { isFlavorizable } from "../../../utils/flavorizingUtils";
import {
    DEFAULT_SERVICE_GENERATION_FLAGS,
    DEFAULT_TYPE_GENERATION_FLAGS,
    FLAVORED_TYPE_GENERATION_FLAGS,
    NON_THROWING_SERVICE_GENERATION_FLAGS,
    READONLY_TYPE_GENERATION_FLAGS,
} from "../../../__tests__/utils/constants";
import { loadConjureDefinition } from "../command";
import { generate } from "../generator";
import { typeNameToFilePath } from "../simpleAst";
import { assertOutputAndExpectedAreEqual } from "./testTypesGeneratorTest";

describe("generator", () => {
    let outDir: string;

    beforeEach(() => {
        outDir = directory();
    });

    it("emits multiple files into same directory without errors", async () => {
        const enumDefinition1: ITypeDefinition = ITypeDefinition.enum_({
            typeName: { name: "MyEnum", package: "com.palantir.integration" },
            values: [{ value: "FOO" }],
        });
        const enumDefinition2: ITypeDefinition = ITypeDefinition.enum_({
            typeName: { name: "MyEnum2", package: "com.palantir.integration" },
            values: [{ value: "FOO" }],
        });
        await generate(
            {
                errors: [],
                services: [],
                types: [enumDefinition1, enumDefinition2],
                version: 1,
                extensions: {},
            },
            outDir,
            DEFAULT_TYPE_GENERATION_FLAGS,
            DEFAULT_SERVICE_GENERATION_FLAGS,
        );
        const outFile1 = path.join(outDir, "integration/myEnum.ts");
        const outFile2 = path.join(outDir, "integration/myEnum2.ts");
        expect(fs.existsSync(outFile1)).toBeTruthy();
        expect(fs.existsSync(outFile2)).toBeTruthy();
    });

    it("throws on service name collisions", async () => {
        const serviceDefinition1: IServiceDefinition = {
            serviceName: {
                name: "IMyService",
                package: "com.palantir.foo",
            },
            endpoints: [],
        };
        const serviceDefinition2: IServiceDefinition = {
            serviceName: {
                name: "IMyServiceWithErrors",
                package: "com.palantir.foo",
            },
            endpoints: [],
        };

        await expect(
            generate(
                {
                    errors: [],
                    services: [serviceDefinition1, serviceDefinition2],
                    types: [],
                    version: 1,
                    extensions: {},
                },
                outDir,
                DEFAULT_TYPE_GENERATION_FLAGS,
                NON_THROWING_SERVICE_GENERATION_FLAGS,
            ),
        ).rejects.toThrow();

        await expect(
            generate(
                {
                    errors: [],
                    services: [serviceDefinition1, serviceDefinition2],
                    types: [],
                    version: 1,
                    extensions: {},
                },
                outDir,
                DEFAULT_TYPE_GENERATION_FLAGS,
                DEFAULT_SERVICE_GENERATION_FLAGS,
            ),
        ).resolves.not.toThrow();
    });

    it("generates multiple modules", async () => {
        const enumDefinition1: ITypeDefinition = ITypeDefinition.enum_({
            typeName: { name: "MyEnum", package: "com.palantir.integration.first" },
            values: [{ value: "FOO" }],
        });
        const enumDefinition2: ITypeDefinition = ITypeDefinition.enum_({
            typeName: { name: "MyEnum2", package: "com.palantir.integration.second" },
            values: [{ value: "FOO" }],
        });
        await generate(
            {
                errors: [],
                services: [],
                types: [enumDefinition1, enumDefinition2],
                version: 1,
                extensions: {},
            },
            outDir,
            DEFAULT_TYPE_GENERATION_FLAGS,
            DEFAULT_SERVICE_GENERATION_FLAGS,
        );
        expect(fs.existsSync(path.join(outDir, "integration-first/myEnum.ts"))).toBeTruthy();
        expect(fs.existsSync(path.join(outDir, "integration-second/myEnum2.ts"))).toBeTruthy();
        expect(fs.existsSync(path.join(outDir, "integration-first/index.ts"))).toBeTruthy();
        expect(fs.existsSync(path.join(outDir, "integration-second/index.ts"))).toBeTruthy();
        expect(fs.readFileSync(path.join(outDir, "index.ts"), "utf8")).toEqual(
            `import * as integrationFirst from "./integration-first";
import * as integrationSecond from "./integration-second";

export { integrationFirst };
export { integrationSecond };
`,
        );
    });
});

const irDir = path.join(__dirname, "../../../../build/ir-test-cases");
const testCaseDir = path.join(__dirname, "resources/test-cases");
const flavoredTestCaseDir = path.join(__dirname, "resources/flavored-test-cases");
const readonlyTestCaseDir = path.join(__dirname, "resources/readonly-test-cases");

describe("definitionTests", () => {
    for (const fileName of fs.readdirSync(irDir)) {
        const definitionFilePath = path.join(irDir, fileName);
        const paths = fileName.substring(0, fileName.lastIndexOf("."));
        const actualTestCaseDir = path.join(testCaseDir, paths);
        const actualFlavoredTestCaseDir = path.join(flavoredTestCaseDir, paths);
        const actualReadonlyTestCaseDir = path.join(readonlyTestCaseDir, paths);

        it(
            `${fileName} produces equivalent TypeScript`,
            testGenerateAllFilesAreTheSame(
                definitionFilePath,
                paths,
                actualTestCaseDir,
                DEFAULT_TYPE_GENERATION_FLAGS,
                DEFAULT_SERVICE_GENERATION_FLAGS,
            ),
        );

        it(
            `${fileName} produces equivalent non-throwing services TypeScript`,
            testGenerateAllFilesAreTheSame(
                definitionFilePath,
                paths,
                actualTestCaseDir,
                DEFAULT_TYPE_GENERATION_FLAGS,
                NON_THROWING_SERVICE_GENERATION_FLAGS,
            ),
        );

        // Not every test has a flavored version
        if (fs.existsSync(actualFlavoredTestCaseDir)) {
            it(
                `${fileName} produces equivalent flavored TypeScript`,
                testGenerateAllFilesAreTheSame(
                    definitionFilePath,
                    paths,
                    actualFlavoredTestCaseDir,
                    FLAVORED_TYPE_GENERATION_FLAGS,
                    DEFAULT_SERVICE_GENERATION_FLAGS,
                ),
            );
        }

        // Not every test has a readonly version
        if (fs.existsSync(actualReadonlyTestCaseDir)) {
            it(
                `${fileName} produces equivalent readonly TypeScript`,
                testGenerateAllFilesAreTheSame(
                    definitionFilePath,
                    paths,
                    actualReadonlyTestCaseDir,
                    READONLY_TYPE_GENERATION_FLAGS,
                    DEFAULT_SERVICE_GENERATION_FLAGS,
                ),
            );
        }
    }
});

function testGenerateAllFilesAreTheSame(
    definitionFilePath: string,
    paths: string,
    actualTestCaseDir: string,
    typeGenerationFlags: ITypeGenerationFlags,
    serviceGenerationFlags: IServiceGenerationFlags,
) {
    return async () => {
        const tempDir = directory();
        const outputDir = path.join(tempDir, paths);
        await fs.mkdirp(outputDir);
        const conjureDefinition = await loadConjureDefinition(definitionFilePath);

        await generate(conjureDefinition, outputDir, typeGenerationFlags, serviceGenerationFlags);

        expectAllFilesAreTheSame(
            conjureDefinition,
            outputDir,
            actualTestCaseDir,
            typeGenerationFlags,
            serviceGenerationFlags,
        );
    };
}

function expectAllFilesAreTheSame(
    definition: IConjureDefinition,
    actualDir: string,
    expectedDir: string,
    typeGenerationFlags: ITypeGenerationFlags,
    serviceGenerationFlags: IServiceGenerationFlags,
) {
    for (const type of definition.types) {
        // We do not generate flavoured types for all aliases
        if (type.type === "alias" && !isFlavorizable(type.alias.alias, typeGenerationFlags.flavorizedAliases)) {
            continue;
        }
        const relativeFilePath = typeNameToFilePath(ITypeDefinition.visit(type, typeNameVisitor));
        assertOutputAndExpectedAreEqual(actualDir, expectedDir, relativeFilePath);
    }

    if (serviceGenerationFlags.generateThrowingServices) {
        for (const service of definition.services) {
            const relativeFilePath = typeNameToFilePath(service.serviceName);
            assertOutputAndExpectedAreEqual(actualDir, expectedDir, relativeFilePath);
        }
    }

    if (serviceGenerationFlags.generateNonThrowingServices) {
        for (const service of definition.services) {
            const serviceName = {
                package: service.serviceName.package,
                name: `${service.serviceName.name}WithErrors`,
            };
            const relativeFilePath = typeNameToFilePath(serviceName);
            assertOutputAndExpectedAreEqual(actualDir, expectedDir, relativeFilePath);
        }
    }
}

const typeNameVisitor: ITypeDefinitionVisitor<ITypeName> = {
    alias: (p1: IAliasDefinition) => p1.typeName,
    enum: (p1: IEnumDefinition) => p1.typeName,
    object: (p1: IObjectDefinition) => p1.typeName,
    union: (p1: IUnionDefinition) => p1.typeName,
    unknown: (p1: ITypeDefinition) => {
        throw new Error(`unknown type ${p1}`);
    },
};
