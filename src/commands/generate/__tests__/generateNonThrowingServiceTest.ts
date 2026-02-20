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

import { HttpMethod, IParameterType, IType, PrimitiveType } from "conjure-api";
import * as fs from "fs";
import * as path from "path";
import { directory } from "tempy";
import { createHashableTypeName } from "../../../utils/hashingUtils";
import { DEFAULT_TYPE_GENERATION_FLAGS } from "../../../__tests__/utils/constants";
import { generateNonThrowingService } from "../generators/generateNonThrowingService";
import { SimpleAst } from "../simpleAst";
import {
    assertOutputAndExpectedAreEqual,
    foreignObject,
    servicesLocalObject as localObject,
} from "./testTypesGeneratorTest";

const stringType: IType = IType.primitive(PrimitiveType.STRING);

describe("generateNonThrowingService", () => {
    const expectedDir = path.join(__dirname, "./resources");
    let outDir: string;
    let simpleAst: SimpleAst;

    beforeEach(() => {
        outDir = directory();
        simpleAst = new SimpleAst(outDir);
    });

    it("emits service interface and class with primitive return type", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [],
                        endpointName: "getPrimitive",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/getPrimitive",
                        markers: [],
                        returns: { primitive: PrimitiveType.INTEGER, type: "primitive" },
                        tags: [],
                        errors: [],
                    },
                ],
                serviceName: { name: "PrimitiveService", package: "com.palantir.services" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "services/primitiveServiceWithErrors.ts");
    });

    it("emits service interface and class with safelong header type", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [
                            {
                                argName: "investigation",
                                markers: [],
                                paramType: IParameterType.header({ paramId: "X-Investigation" }),
                                type: IType.primitive(PrimitiveType.SAFELONG),
                                tags: [],
                            },
                        ],
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/foo",
                        markers: [],
                        tags: [],
                        errors: [],
                    },
                ],
                serviceName: { name: "ServiceWithSafelongHeader", package: "com.palantir.services" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "services/serviceWithSafelongHeaderWithErrors.ts");
    });

    it("handles endpoint with void return type", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [],
                        endpointName: "returnsVoid",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/bar",
                        markers: [],
                        tags: [],
                        errors: [],
                    },
                ],
                serviceName: { name: "MyService", package: "com.palantir.services" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "services/myServiceWithErrors.ts");
        const contents = fs.readFileSync(outFile, "utf8");
        expect(contents).toContain(`
export interface IMyServiceWithErrors {
    returnsVoid(): Promise<IConjureResult<void, never>>;
}`);
        expect(contents).toContain(`
export class MyServiceWithErrors implements IMyServiceWithErrors {
    constructor(private bridge: IHttpApiBridge) {
    }

    public returnsVoid(): Promise<IConjureResult<void, never>> {
        return this.bridge
            .call<void>(
                "MyService",
                "returnsVoid",
                "GET",
                "/bar",
                __undefined,
                __undefined,
                __undefined,
                __undefined,
                __undefined,
                __undefined
            )
            .then(result => ({ status: "success" as const, result }))
            .catch((error: any) => ({ status: "failure", error }));
    }
}`);
    });

    it("handles binary body and return types", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [],
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/bar",
                        markers: [],
                        returns: { primitive: PrimitiveType.BINARY, type: "primitive" },
                        tags: [],
                        errors: [],
                    },
                ],
                serviceName: { name: "MyService", package: "com.palantir.services" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "services/myServiceWithErrors.ts");
        const contents = fs.readFileSync(outFile, "utf8");
        expect(contents).toContain("foo(): Promise<ReadableStream<Uint8Array>>;");
        expect(contents).toContain(`"application\/octet-stream"\n`);
    });

    it("handle binary return and json request types", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [
                            {
                                argName: "body",
                                markers: [],
                                paramType: IParameterType.body({}),
                                type: { primitive: PrimitiveType.BINARY, type: "primitive" },
                                tags: [],
                            },
                        ],
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/bar",
                        markers: [],
                        returns: { primitive: PrimitiveType.BINARY, type: "primitive" },
                        tags: [],
                        errors: [],
                    },
                ],
                serviceName: { name: "MyService", package: "com.palantir.services" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "services/myServiceWithErrors.ts");
        const contents = fs.readFileSync(outFile, "utf8");
        expect(contents).toContain(
            "foo(body: ReadableStream<Uint8Array> | BufferSource | Blob): Promise<ReadableStream<Uint8Array>>;",
        );
        expect(contents).toContain(`"application\/octet-stream",\n`);
        expect(contents).toContain(`"application\/octet-stream"\n`);
    });

    it("emits imports and correct signature for service with references", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [
                            {
                                argName: "obj",
                                markers: [],
                                paramType: IParameterType.body({}),
                                type: localObject.reference,
                                tags: [],
                            },
                        ],
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/foo",
                        markers: [],
                        returns: foreignObject.reference,
                        tags: [],
                        errors: [],
                    },
                ],
                serviceName: {
                    name: "MyService",
                    package: "com.palantir.services",
                },
            },
            new Map([
                [createHashableTypeName(localObject.typeName), localObject.definition],
                [createHashableTypeName(foreignObject.typeName), foreignObject.definition],
            ]),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "services/myServiceWithErrors.ts");
        const contents = fs.readFileSync(outFile, "utf8");
        expect(contents).toContain(`import { IOtherObject } from "../other/otherObject";`);
        expect(contents).toContain(`import { ISomeObject } from "./someObject";`);
        expect(contents).toContain(`foo(obj: ISomeObject): Promise<IConjureResult<IOtherObject, never>>;`);
    });

    it("emits different param types", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [
                            {
                                argName: "body",
                                markers: [],
                                paramType: IParameterType.body({}),
                                type: stringType,
                                tags: [],
                            },
                            {
                                argName: "header",
                                markers: [],
                                paramType: {
                                    header: { paramId: "Header" },
                                    type: "header",
                                },
                                type: stringType,
                                tags: [],
                            },
                            {
                                argName: "path",
                                markers: [],
                                paramType: {
                                    path: {},
                                    type: "path",
                                },
                                type: stringType,
                                tags: [],
                            },
                            {
                                argName: "query",
                                markers: [],
                                paramType: {
                                    query: { paramId: "Query" },
                                    type: "query",
                                },
                                type: stringType,
                                tags: [],
                            },
                        ],
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/foo/{path}",
                        markers: [],
                        tags: [],
                        errors: [],
                    },
                ],
                serviceName: { name: "ParamTypeService", package: "com.palantir.services" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "services/paramTypeServiceWithErrors.ts");
    });

    it("handles out of order path params", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [
                            {
                                argName: "param1",
                                markers: [],
                                paramType: {
                                    path: {},
                                    type: "path",
                                },
                                type: stringType,
                                tags: [],
                            },
                            {
                                argName: "param2",
                                markers: [],
                                paramType: {
                                    path: {},
                                    type: "path",
                                },
                                type: stringType,
                                tags: [],
                            },
                        ],
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/{param2}/{param1}",
                        markers: [],
                        tags: [],
                        errors: [],
                    },
                ],
                serviceName: { name: "OutOfOrderPathService", package: "com.palantir.services" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "services/outOfOrderPathServiceWithErrors.ts");
    });

    it("handles header auth-type", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [
                            {
                                argName: "header",
                                markers: [],
                                paramType: IParameterType.header({ paramId: "Header" }),
                                type: stringType,
                                tags: [],
                            },
                        ],
                        auth: {
                            header: {},
                            type: "header",
                        },
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/foo",
                        markers: [],
                        tags: [],
                        errors: [],
                    },
                ],
                serviceName: { name: "MyService", package: "com.palantir.services" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "services/myServiceWithErrors.ts");
        const contents = fs.readFileSync(outFile, "utf8");
        expect(contents).toContain("foo(header: string): Promise<IConjureResult<void, never>>;");
        expect(contents).toContain("foo(header: string): Promise<IConjureResult<void, never>> {");
        expect(contents).toMatch(/{\s*"Header": header,\s*}/);
    });

    it("throws on multiple body args", async () => {
        expect.assertions(1);
        try {
            await generateNonThrowingService(
                {
                    endpoints: [
                        {
                            args: [
                                {
                                    argName: "body",
                                    markers: [],
                                    paramType: IParameterType.body({}),
                                    type: stringType,
                                    tags: [],
                                },
                                {
                                    argName: "body2",
                                    markers: [],
                                    paramType: {
                                        body: {},
                                        type: "body",
                                    },
                                    type: stringType,
                                    tags: [],
                                },
                            ],
                            endpointName: "foo",
                            httpMethod: HttpMethod.GET,
                            httpPath: "/foo",
                            markers: [],
                            tags: [],
                            errors: [],
                        },
                    ],
                    serviceName: { name: "MyService", package: "com.palantir.services" },
                },
                new Map(),
                simpleAst,
                DEFAULT_TYPE_GENERATION_FLAGS,
            );
        } catch (e) {
            expect(e).toEqual(new Error("endpoint cannot have more than one body arg, found: 2"));
        }
    });

    it("throws on header arg with no param-id", async () => {
        expect.assertions(1);
        try {
            await generateNonThrowingService(
                {
                    endpoints: [
                        {
                            args: [
                                {
                                    argName: "foo",
                                    markers: [],
                                    paramType: IParameterType.header({} as any),
                                    type: stringType,
                                    tags: [],
                                },
                            ],
                            endpointName: "foo",
                            httpMethod: HttpMethod.GET,
                            httpPath: "/foo",
                            markers: [],
                            tags: [],
                            errors: [],
                        },
                    ],
                    serviceName: { name: "MyService", package: "com.palantir.services" },
                },
                new Map(),
                simpleAst,
                DEFAULT_TYPE_GENERATION_FLAGS,
            );
        } catch (e) {
            expect(e).toEqual(new Error("header arguments must define a 'param-id': foo"));
        }
    });

    it("throws on query arg with no param-id", async () => {
        expect.assertions(1);
        try {
            await generateNonThrowingService(
                {
                    endpoints: [
                        {
                            args: [
                                {
                                    argName: "foo",
                                    markers: [],
                                    paramType: IParameterType.query({} as any),
                                    type: stringType,
                                    tags: [],
                                },
                            ],
                            endpointName: "foo",
                            httpMethod: HttpMethod.GET,
                            httpPath: "/foo",
                            markers: [],
                            tags: [],
                            errors: [],
                        },
                    ],
                    serviceName: { name: "MyService", package: "com.palantir.services" },
                },
                new Map(),
                simpleAst,
                DEFAULT_TYPE_GENERATION_FLAGS,
            );
        } catch (e) {
            expect(e).toEqual(new Error("query arguments must define a 'param-id': foo"));
        }
    });

    it("emits service interfaces with docs", async () => {
        await generateNonThrowingService(
            {
                docs: "service level docs",
                endpoints: [
                    {
                        args: [],
                        docs: "endpoint level docs",
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/foo",
                        markers: [],
                        tags: [],
                        errors: [],
                    },
                ],
                serviceName: { name: "MyService", package: "com.palantir.services" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "services/myServiceWithErrors.ts");
        const contents = fs.readFileSync(outFile, "utf8");
        expect(contents).toContain(
            `/** service level docs */
export interface IMyServiceWithErrors {
    /** endpoint level docs */
    foo(): Promise<IConjureResult<void, never>>;
}
`,
        );

        expect(contents).not.toContain(
            `
            /** endpoint level docs */
            foo(): Promise<void> {`,
        );
    });

    it("emits endpoint with incubating docs", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [],
                        tags: ["incubating"],
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/foo",
                        markers: [],
                        errors: [],
                    },
                ],
                serviceName: { name: "MyService", package: "com.palantir.services" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "services/myServiceWithErrors.ts");
        const contents = fs.readFileSync(outFile, "utf8");
        expect(contents).toContain(
            `
export interface IMyServiceWithErrors {
    /** @incubating */
    foo(): Promise<IConjureResult<void, never>>;
}
`,
        );
    });

    it("emits endpoint with error docs", async () => {
        await generateNonThrowingService(
            {
                docs: "service level docs",
                endpoints: [
                    {
                        docs: "endpoint level docs",
                        args: [],
                        tags: [],
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/foo",
                        markers: [],
                        errors: [
                            {
                                error: { name: "MyError1", namespace: "MyNamespace", package: "com.palantir.services" },
                                docs: "MyError1 documentation",
                            },
                            {
                                error: { name: "MyError2", namespace: "MyNamespace", package: "com.palantir.services" },
                                docs: "MyError2 documentation",
                            },
                        ],
                    },
                ],
                serviceName: { name: "MyService", package: "com.palantir.services" },
            },
            new Map([
                [
                    createHashableTypeName({ name: "MyError1", package: "com.palantir.services" }),
                    {
                        type: "object",
                        object: { typeName: { name: "MyError1", package: "com.palantir.services" }, fields: [] },
                    },
                ],
                [
                    createHashableTypeName({ name: "MyError2", package: "com.palantir.services" }),
                    {
                        type: "object",
                        object: { typeName: { name: "MyError2", package: "com.palantir.services" }, fields: [] },
                    },
                ],
            ]),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "services/myServiceWithErrors.ts");
        const contents = fs.readFileSync(outFile, "utf8");
        expect(contents).toContain(
            `/** service level docs */
export interface IMyServiceWithErrors {
    /** endpoint level docs */
    foo(): Promise<IConjureResult<void, IMyError1 | IMyError2>>;
}
`,
        );
    });

    it("emits service interfaces with error incubating docs", async () => {
        await generateNonThrowingService(
            {
                docs: "service level docs",
                endpoints: [
                    {
                        args: [],
                        docs: "endpoint level docs",
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/foo",
                        markers: [],
                        tags: ["incubating"],
                        errors: [
                            {
                                error: { name: "MyError", namespace: "MyNamespace", package: "com.palantir.services" },
                                docs: "MyError documentation",
                            },
                        ],
                    },
                ],
                serviceName: { name: "MyService", package: "com.palantir.services" },
            },
            new Map([
                [
                    createHashableTypeName({ name: "MyError", package: "com.palantir.services" }),
                    {
                        type: "object",
                        object: { typeName: { name: "MyError", package: "com.palantir.services" }, fields: [] },
                    },
                ],
            ]),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "services/myServiceWithErrors.ts");
        const contents = fs.readFileSync(outFile, "utf8");
        expect(contents).toContain(
            `/** service level docs */
export interface IMyServiceWithErrors {
    /**
     * endpoint level docs
     * @incubating
     */
    foo(): Promise<IConjureResult<void, IMyError>>;
}
`,
        );

        expect(contents).not.toContain(
            `
          /** endpoint level docs */
          foo(): Promise<void> {`,
        );
    });

    it("emits endpoint with incubating and deprecated docs", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [],
                        deprecated: "to be replaced",
                        tags: ["incubating"],
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/foo",
                        markers: [],
                        errors: [],
                    },
                ],
                serviceName: { name: "MyService", package: "com.palantir.services" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "services/myServiceWithErrors.ts");
        const contents = fs.readFileSync(outFile, "utf8");
        expect(contents).toContain(
            `
export interface IMyServiceWithErrors {
    /**
     * @deprecated to be replaced
     * @incubating
     */
    foo(): Promise<IConjureResult<void, never>>;
}
`,
        );
    });

    it("emits service with optional params", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [
                            {
                                argName: "name",
                                markers: [],
                                paramType: IParameterType.query({ paramId: "Query" }),
                                type: IType.optional({ itemType: IType.primitive(PrimitiveType.STRING) }),
                                tags: [],
                            },
                            {
                                argName: "header",
                                markers: [],
                                paramType: IParameterType.header({ paramId: "Header" }),
                                type: stringType,
                                tags: [],
                            },
                        ],
                        auth: {
                            header: {},
                            type: "header",
                        },
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/foo",
                        markers: [],
                        tags: [],
                        errors: [],
                    },
                ],
                serviceName: { name: "OptionalService", package: "com.palantir.services" },
            },
            new Map(),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        assertOutputAndExpectedAreEqual(outDir, expectedDir, "services/optionalServiceWithErrors.ts");
    });

    it("emits service with no duplicate error imports", async () => {
        await generateNonThrowingService(
            {
                endpoints: [
                    {
                        args: [],
                        endpointName: "foo",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/foo",
                        markers: [],
                        tags: [],
                        errors: [
                            {
                                error: { name: "MyError", namespace: "MyNamespace", package: "com.palantir.errors" },
                            },
                        ],
                    },
                    {
                        args: [],
                        endpointName: "bar",
                        httpMethod: HttpMethod.GET,
                        httpPath: "/bar",
                        markers: [],
                        tags: [],
                        errors: [
                            {
                                error: { name: "MyError", namespace: "MyNamespace", package: "com.palantir.errors" },
                            },
                        ],
                    },
                ],
                serviceName: { name: "MyService", package: "com.palantir.services" },
            },
            new Map([
                [
                    createHashableTypeName({ name: "MyError", package: "com.palantir.errors" }),
                    {
                        type: "object",
                        object: { typeName: { name: "MyError", package: "com.palantir.errors" }, fields: [] },
                    },
                ],
            ]),
            simpleAst,
            DEFAULT_TYPE_GENERATION_FLAGS,
        );
        const outFile = path.join(outDir, "services/myServiceWithErrors.ts");
        const contents = fs.readFileSync(outFile, "utf8");

        expect(contents).toContain(`import type { IMyError } from "../errors/myError";
import type { IConjureResult, IHttpApiBridge } from "conjure-client";

/** Constant reference to \`undefined\` that we expect to get minified and therefore reduce total code size */
const __undefined: undefined = undefined;

export interface IMyServiceWithErrors {
    foo(): Promise<IConjureResult<void, IMyError>>;
    bar(): Promise<IConjureResult<void, IMyError>>;
}
`);
    });
});
