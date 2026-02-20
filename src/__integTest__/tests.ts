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

import { assert } from "chai";
import { FetchBridge } from "conjure-client";
import {
    AutoDeserializeConfirmService,
    AutoDeserializeService,
    IClientTestCases,
    SingleHeaderService,
    SinglePathParamService,
    SingleQueryParamService,
} from "./__generated__/conjure-verification-server";
// HACKHACK to load test-cases
// tslint:disable:no-var-requires
const testCases: IClientTestCases = require("../../build/resources/verification-server-test-cases.json").client;

const blacklist: { [endpointName: string]: string[] } = {
    receiveStringAliasExample: ['""'],
    receiveDoubleExample: ['{"value":0.0}', '{"value":123e5}'],
    receiveDoubleAliasExample: ["10.0"],
    receiveIntegerAliasExample: ["0"],
    receiveBooleanAliasExample: ["false"],
    receiveSafeLongAliasExample: ["0"],
    receiveRawOptionalExample: ["null"],
    pathParamString: ['""'],
    pathParamAliasString: ['""'],
};

function isBlacklisted(endpointName: string, jsonString: string) {
    return endpointName in blacklist && blacklist[endpointName].indexOf(jsonString) >= 0;
}

const bridge = new FetchBridge({
    baseUrl: "http://localhost:8000",
    userAgent: {
        productName: "conjure-typescript-client",
        productVersion: "0.0.0",
    },
});

describe("AutoDeserializeService", () => {
    const testService = new AutoDeserializeService(bridge);
    const confirmService = new AutoDeserializeConfirmService(bridge);

    Object.keys(testCases.autoDeserialize).map(endpointName => {
        const bodyTestCases = testCases.autoDeserialize[endpointName];
        bodyTestCases.positive.forEach((value, i) => {
            const defineTest = isBlacklisted(endpointName, value) ? it.skip : it;
            defineTest(`${endpointName}_${i}_pass`, automaticTest(endpointName, i, true));
        });
        bodyTestCases.negative.forEach((_value, i) => {
            // const defineTest = isBlacklisted(endpointName, value) ? it.skip : it;
            // temporarily switched off all the should_fail tests:
            const defineTest = it.skip;
            const index = i + bodyTestCases.positive.length;
            defineTest(`${endpointName}_${index}_fail`, automaticTest(endpointName, index, false));
        });
    });

    function automaticTest(endpointName: string, index: number, shouldPass: boolean) {
        return async () => {
            if (shouldPass) {
                const endpointResponse = await (testService as any)[endpointName](index);
                if (endpointName === "receiveBinaryAliasExample") {
                    const streamReader = (endpointResponse as ReadableStream<Uint8Array>).getReader();
                    let result = "";
                    for (let chunk = await streamReader.read(); !chunk.done; chunk = await streamReader.read()) {
                        chunk.value.forEach(byte => (result += String.fromCharCode(byte)));
                    }
                    return confirmService.confirm(endpointName, index, btoa(result));
                } else {
                    return confirmService.confirm(endpointName, index, endpointResponse);
                }
            } else {
                assert.throws(async () => (testService as any)[endpointName](index), Error, "Should fail");
            }
        };
    }
});

describe("SingleHeaderService", () => {
    const headerService = new SingleHeaderService(bridge);
    Object.keys(testCases.singleHeaderService).forEach(endpointName =>
        testCases.singleHeaderService[endpointName].map((value, i) => {
            const defineTest = isBlacklisted(endpointName, value) ? it.skip : it;
            defineTest(`${endpointName}(${value}) [${i}]`, async () =>
                (headerService as any)[endpointName](i, JSON.parse(value)),
            );
        }),
    );
});

describe("SinglePathParamService", () => {
    const pathService = new SinglePathParamService(bridge);
    Object.keys(testCases.singlePathParamService).forEach(endpointName =>
        testCases.singlePathParamService[endpointName].map((value, i) => {
            const defineTest = isBlacklisted(endpointName, value) ? it.skip : it;
            defineTest(`${endpointName}(${value}) [${i}]`, async () =>
                (pathService as any)[endpointName](i, JSON.parse(value)),
            );
        }),
    );
});

describe("SingleQueryParamService", () => {
    const queryService = new SingleQueryParamService(bridge);
    Object.keys(testCases.singleQueryParamService).forEach(endpointName =>
        testCases.singleQueryParamService[endpointName].map((value, i) => {
            const defineTest = isBlacklisted(endpointName, value) ? it.skip : it;
            defineTest(`${endpointName}(${value}) [${i}]`, async () =>
                (queryService as any)[endpointName](i, JSON.parse(value)),
            );
        }),
    );
});
