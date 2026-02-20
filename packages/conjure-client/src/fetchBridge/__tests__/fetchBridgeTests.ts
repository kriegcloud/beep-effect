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

import * as fetchMock from "fetch-mock";
import { ConjureError, ConjureErrorType } from "../../errors";
import { IMPLEMENTATION_VERSION } from "../../generated";
import { IHttpApiBridge, IHttpEndpointOptions, MediaType } from "../../httpApiBridge";
import { IUserAgent } from "../../userAgent";
import { FetchBridge } from "../fetchBridge";

const baseUrl = "https://host.domain/path";
const token = "TOKEN";
const userAgent: IUserAgent = { productName: "foo", productVersion: "1.2.3" };
const userAgent2: IUserAgent = { productName: "bar", productVersion: "1.2.3" };
const userAgent3: IUserAgent = { productName: "baz", productVersion: "1.2.3" };
const ACCEPT_HEADER = "accept";

interface IMockResponseObject {
    body?: string | {};
    status?: number;
    headers?: { [key: string]: any };
    ok?: boolean;
    throws?: any;
    sendAsJson?: boolean;
}

describe("FetchBridgeImpl", () => {
    const mockedRequestData = {
        requestData: "REQUEST_DATA",
    };
    const mockedResponseData = {
        responseData: "RESPONSE_DATA",
    };

    let bridge: IHttpApiBridge;
    let fetchMockStub: typeof fetchMock;

    function mockFetch(expectedUrl: string, expectedRequest: RequestInit, fetchResponse: IMockResponseObject) {
        fetchMockStub = fetchMock.mock((actualUrl, actualRequest) => {
            expect(actualUrl).toBe(expectedUrl);
            expect(actualRequest).toEqual(expectedRequest);
            return true;
        }, fetchResponse);
    }

    function verifyFetchUserAgent(
        expectedUserAgent: string = `foo/1.2.3 conjure-typescript-runtime/${IMPLEMENTATION_VERSION}`,
    ) {
        expect(fetchMock.calls.length).toBe(1);
        const [, actualRequest] = fetchMock.lastCall();
        // fetch-mock does not provide reasonable types here, the default type is Int8Array
        const fetchUserAgent = (actualRequest.headers as any)["Fetch-User-Agent"];
        expect(fetchUserAgent).toBe(expectedUserAgent);
    }

    beforeEach(() => {
        bridge = new FetchBridge({ baseUrl, token, fetch: undefined, userAgent });
    });

    afterEach(() => {
        fetchMockStub.restore();
    });

    it("makes DELETE requests", async () => {
        const request: IHttpEndpointOptions = {
            endpointName: "a",
            endpointPath: "a/{var}/b",
            method: "DELETE",
            pathArguments: ["val"],
            queryArguments: {},
        };
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest({
            method: "DELETE",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(undefined, 204);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toBeUndefined();
    });

    it("makes GET request", async () => {
        const request: IHttpEndpointOptions = {
            endpointName: "a",
            endpointPath: "a/{var}/b",
            method: "GET",
            pathArguments: ["val"],
            queryArguments: {},
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest({
            method: "GET",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(mockedResponseData, 200);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toEqual(mockedResponseData);
    });

    it("makes POST request with JSON data", async () => {
        const request: IHttpEndpointOptions = {
            data: mockedRequestData,
            endpointName: "a",
            endpointPath: "a/{var}/b",
            method: "POST",
            pathArguments: ["val"],
            queryArguments: {},
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest({
            data: mockedRequestData,
            method: "POST",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(mockedResponseData, 200);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toEqual(mockedResponseData);
    });

    it("makes POST request with binary data", async () => {
        const fakeBinaryData = "dGVzdA==";
        const request: IHttpEndpointOptions = {
            data: fakeBinaryData,
            endpointName: "a",
            endpointPath: "a/{var}/b",
            method: "POST",
            pathArguments: ["val"],
            queryArguments: {},
            requestMediaType: MediaType.APPLICATION_OCTET_STREAM,
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest({
            contentType: "application/octet-stream",
            data: fakeBinaryData,
            method: "POST",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(mockedResponseData, 200);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toEqual(mockedResponseData);
    });

    it("makes POST request with plain text data", async () => {
        const fakeTextData = "Hello World";
        const request: IHttpEndpointOptions = {
            data: fakeTextData,
            endpointName: "a",
            endpointPath: "a/{var}/b",
            method: "POST",
            pathArguments: ["val"],
            queryArguments: {},
            requestMediaType: MediaType.TEXT_PLAIN,
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest({
            contentType: MediaType.TEXT_PLAIN,
            data: fakeTextData,
            method: "POST",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(mockedResponseData, 200);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toEqual(mockedResponseData);
    });

    it("makes POST request with boolean data", async () => {
        const request: IHttpEndpointOptions = {
            data: false,
            endpointName: "a",
            endpointPath: "a/{var}/b",
            method: "POST",
            pathArguments: ["val"],
            queryArguments: {},
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest({
            data: false,
            method: "POST",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse("false", 200);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toEqual(false);
    });

    it("makes POST request with form data without setting 'Content-Type'", async () => {
        const fakeBinaryData = "dGVzdA==";
        const request: IHttpEndpointOptions = {
            data: fakeBinaryData,
            endpointName: "a",
            endpointPath: "a/{var}/b",
            method: "POST",
            pathArguments: ["val"],
            queryArguments: {},
            requestMediaType: MediaType.MULTIPART_FORM_DATA,
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest({
            contentType: "multipart/form-data",
            data: fakeBinaryData,
            method: "POST",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(mockedResponseData, 200);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toEqual(mockedResponseData);
    });

    it("makes POST request with url encoded form data", async () => {
        const request: IHttpEndpointOptions = {
            data: {
                "param1": "a",
                "param2": ["b", "c"],
                "param=3": "ürl-êñçódèd",
            },
            endpointName: "a",
            endpointPath: "a/{var}/b",
            method: "POST",
            pathArguments: ["val"],
            queryArguments: {},
            requestMediaType: MediaType.APPLICATION_X_WWW_FORM_URLENCODED,
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest({
            contentType: "application/x-www-form-urlencoded",
            data: "param1=a&param2=b&param2=c&param%3D3=%C3%BCrl-%C3%AA%C3%B1%C3%A7%C3%B3d%C3%A8d",
            method: "POST",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(mockedResponseData, 200);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toEqual(mockedResponseData);
    });

    it("makes PUT request", async () => {
        const request: IHttpEndpointOptions = {
            data: mockedRequestData,
            endpointName: "a",
            endpointPath: "a/{var}/b",
            method: "PUT",
            pathArguments: ["val"],
            queryArguments: {},
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest({
            data: mockedRequestData,
            method: "PUT",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(mockedResponseData, 200);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toEqual(mockedResponseData);
    });

    it("makes request with many parameters", async () => {
        const request: IHttpEndpointOptions = {
            endpointName: "a",
            endpointPath: "a/{var1}/b/{var2}",
            method: "GET",
            pathArguments: ["val1", "val2"],
            queryArguments: { key1: "val1", key2: "val2" },
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a/val1/b/val2?key1=val1&key2=val2`;
        const expectedFetchRequest = createFetchRequest({
            method: "GET",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(mockedResponseData, 200);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toEqual(mockedResponseData);
    });

    it("encodes path and query params", async () => {
        const request: IHttpEndpointOptions = {
            endpointName: "a",
            endpointPath: "a/{var1}/b/{var2}",
            method: "GET",
            pathArguments: ["val1/foo", "val2/foo"],
            queryArguments: { key1: "val1/foo", key2: "val2/foo" },
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a/val1%2Ffoo/b/val2%2Ffoo?key1=val1%2Ffoo&key2=val2%2Ffoo`;
        const expectedFetchRequest = createFetchRequest({
            method: "GET",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(mockedResponseData, 200);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toEqual(mockedResponseData);
    });

    it("passes dynamic tokens", async () => {
        const tokenProvider: () => string = jest.fn().mockReturnValueOnce(token);
        bridge = new FetchBridge({ baseUrl, token: tokenProvider, fetch: undefined, userAgent });

        const request: IHttpEndpointOptions = {
            endpointName: "a",
            endpointPath: "a/",
            method: "GET",
            pathArguments: [],
            queryArguments: {},
        };
        const expectedUrl = `${baseUrl}/a/`;
        const expectedFetchRequest = createFetchRequest({
            method: "GET",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(undefined, 204);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toBeUndefined();
    });

    it("passes async tokens", async () => {
        const tokenProvider: () => Promise<string> = jest.fn().mockReturnValueOnce(Promise.resolve(token));
        bridge = new FetchBridge({ baseUrl, token: tokenProvider, fetch: undefined, userAgent });

        const request: IHttpEndpointOptions = {
            endpointName: "a",
            endpointPath: "a/",
            method: "GET",
            pathArguments: [],
            queryArguments: {},
        };
        const expectedUrl = `${baseUrl}/a/`;
        const expectedFetchRequest = createFetchRequest({
            method: "GET",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(undefined, 204);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toBeUndefined();
    });

    it("passes headers", async () => {
        const request: IHttpEndpointOptions = {
            endpointName: "a",
            endpointPath: "a",
            headers: {
                "Cache-Control": "max-age=60",
                "boolean-header": true,
                "null-header": null,
                "number-header": 1,
            },
            method: "GET",
            pathArguments: [],
            queryArguments: {},
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a`;
        const expectedFetchRequest = createFetchRequest({
            contentType: "application/json",
            headers: {
                "Cache-Control": "max-age=60",
                "boolean-header": "true",
                "number-header": "1",
            },
            method: "GET",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(mockedResponseData, 200);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);
        await expect(bridge.callEndpoint(request)).resolves.toEqual(mockedResponseData);
    });

    it("throws error if request media type is unrecognized", async () => {
        const unrecognizedType = "my-unrecognized-type";
        const request: IHttpEndpointOptions = {
            data: mockedRequestData,
            endpointName: "a",
            endpointPath: "a/{var}/b",
            method: "POST",
            pathArguments: [],
            queryArguments: {},
            requestMediaType: unrecognizedType as any,
            responseMediaType: MediaType.APPLICATION_JSON,
        };

        try {
            await bridge.callEndpoint(request);
            fail("Did not throw an error");
        } catch (error) {
            expect((error as any).originalError.message).toBe("Unrecognized request media type " + unrecognizedType);
        }
    });

    it("throws error if parsing the body fails", async () => {
        const request: IHttpEndpointOptions = {
            endpointName: "a",
            endpointPath: "a",
            method: "GET",
            pathArguments: [],
            queryArguments: {},
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a`;
        const expectedFetchRequest = createFetchRequest({
            method: "GET",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse("{thisIsNotJson!", 200);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);

        expect.assertions(4);
        try {
            await bridge.callEndpoint(request);
            fail("Did not throw an error");
        } catch (error) {
            expect(error).toBeInstanceOf(ConjureError);
            const typedError = error as ConjureError<typeof mockedResponseData>;
            expect(typedError.type).toBe(ConjureErrorType.Parse);
        }
    });

    it("throws error if status code is not ok", async () => {
        const request: IHttpEndpointOptions = {
            endpointName: "a",
            endpointPath: "a",
            method: "GET",
            pathArguments: [],
            queryArguments: {},
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a`;
        const expectedFetchRequest = createFetchRequest({
            method: "GET",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = createFetchResponse(mockedResponseData, 404);
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);

        expect.assertions(6);
        try {
            await bridge.callEndpoint(request);
            fail("Did not throw an error");
        } catch (error) {
            expect(error).toBeInstanceOf(ConjureError);
            const typedError = error as ConjureError<typeof mockedResponseData>;
            expect(typedError.type).toBe(ConjureErrorType.Status);
            expect(typedError.status).toBe(404);
            expect(typedError.body).toEqual(mockedResponseData);
        }
    });

    it("throws error if a network error occurs", async () => {
        const request: IHttpEndpointOptions = {
            endpointName: "a",
            endpointPath: "a",
            method: "GET",
            pathArguments: [],
            queryArguments: {},
            responseMediaType: MediaType.APPLICATION_JSON,
        };
        const expectedUrl = `${baseUrl}/a`;
        const expectedFetchRequest = createFetchRequest({
            method: "GET",
            responseMediaType: request.responseMediaType,
        });
        const expectedFetchResponse = {
            ...createFetchResponse(mockedResponseData, 404),
            throws: new TypeError("a network error occured"),
        };
        mockFetch(expectedUrl, expectedFetchRequest, expectedFetchResponse);

        expect.assertions(5);
        try {
            await bridge.callEndpoint(request);
            fail("Did not throw an error");
        } catch (error) {
            expect(error).toBeInstanceOf(ConjureError);
            const typedError = error as ConjureError<typeof mockedResponseData>;
            expect(typedError.type).toBe(ConjureErrorType.Network);
            expect(typedError.originalError).toBeInstanceOf(TypeError);
        }
    });

    it("throws error if not user agents are provided", () => {
        expect(
            () =>
                new FetchBridge({
                    baseUrl,
                    token,
                    fetch: undefined,
                    userAgent: [],
                }),
        ).toThrowError(new Error("At least one user agent must be provided"));
    });

    describe("sends correct Fetch-User-Agent", () => {
        const request: IHttpEndpointOptions = {
            endpointName: "a",
            endpointPath: "a/{var}/b",
            method: "GET",
            pathArguments: ["val"],
            queryArguments: {},
            responseMediaType: MediaType.APPLICATION_JSON,
        };

        beforeEach(() => {
            // Mocking all requests as we're only interested in request headers
            fetchMock.mock(() => true, {});
        });

        it("for user agent", async () => {
            const fetchBridge = new FetchBridge({ baseUrl, token, fetch: undefined, userAgent });

            await fetchBridge.callEndpoint(request);

            verifyFetchUserAgent();
        });

        it("for user agent array", async () => {
            const fetchBridge = new FetchBridge({ baseUrl, token, fetch: undefined, userAgent: [userAgent] });

            await fetchBridge.callEndpoint(request);

            verifyFetchUserAgent();
        });

        it("for user agent supplier array", async () => {
            const fetchBridge = new FetchBridge({ baseUrl, token, fetch: undefined, userAgent: [() => userAgent] });

            await fetchBridge.callEndpoint(request);

            verifyFetchUserAgent();
        });

        it("for array of user agent suppliers where some return an array", async () => {
            const fetchBridge = new FetchBridge({
                baseUrl,
                token,
                fetch: undefined,
                userAgent: [() => [userAgent, userAgent2], () => userAgent3],
            });

            await fetchBridge.callEndpoint(request);

            verifyFetchUserAgent(`foo/1.2.3 bar/1.2.3 baz/1.2.3 conjure-typescript-runtime/${IMPLEMENTATION_VERSION}`);
        });

        it("for a user agent with comments", async () => {
            const fetchBridge = new FetchBridge({
                baseUrl,
                token,
                fetch: undefined,
                userAgent: { productName: "foo", productVersion: "1.2.3", comments: ["comment1", "comment2"] },
            });

            await fetchBridge.callEndpoint(request);

            verifyFetchUserAgent(`foo/1.2.3 (comment1; comment2) conjure-typescript-runtime/${IMPLEMENTATION_VERSION}`);
        });

        it("for a user agent with empty coments", async () => {
            const fetchBridge = new FetchBridge({
                baseUrl,
                token,
                fetch: undefined,
                userAgent: { productName: "foo", productVersion: "1.2.3", comments: [] },
            });

            await fetchBridge.callEndpoint(request);

            verifyFetchUserAgent(`foo/1.2.3 conjure-typescript-runtime/${IMPLEMENTATION_VERSION}`);
        });

        it("for changing user agent", async () => {
            const userAgentSupplier = jest
                .fn()
                .mockImplementationOnce(() => {
                    return { productName: "foo", productVersion: "1.2.3" };
                })
                .mockImplementationOnce(() => {
                    return { productName: "bar", productVersion: "4.5.6" };
                });
            const fetchBridge = new FetchBridge({ baseUrl, token, fetch: undefined, userAgent: [userAgentSupplier] });

            await fetchBridge.callEndpoint(request);
            await fetchBridge.callEndpoint(request);

            const matchedRequests = fetchMock.calls().matched;
            expect(matchedRequests.length).toBe(2);

            const [, firstActualRequest] = matchedRequests[0];
            const firstUserAgent = (firstActualRequest.headers as any)["Fetch-User-Agent"];
            expect(firstUserAgent).toBe(`foo/1.2.3 conjure-typescript-runtime/${IMPLEMENTATION_VERSION}`);

            const [, secondActualRequest] = matchedRequests[1];
            const secondActualAgent = (secondActualRequest.headers as any)["Fetch-User-Agent"];
            expect(secondActualAgent).toBe(`bar/4.5.6 conjure-typescript-runtime/${IMPLEMENTATION_VERSION}`);
        });
    });
});

interface ICreateFetchRequestOpts {
    method: string;
    data?: any;
    contentType?: string;
    responseMediaType?: string;
    headers?: any;
}

function createFetchRequest(opts: ICreateFetchRequestOpts): RequestInit {
    const { method, data, responseMediaType } = opts;
    const contentType = opts.contentType || MediaType.APPLICATION_JSON;
    const headers = opts.headers || {};
    const request: RequestInit = {
        credentials: "same-origin",
        headers: {
            ...headers,
            "Authorization": `Bearer ${token}`,
            "Fetch-User-Agent": `foo/1.2.3 conjure-typescript-runtime/${IMPLEMENTATION_VERSION}`,
        },
        method,
    };
    if (data != null) {
        request.body = contentType === MediaType.APPLICATION_JSON ? JSON.stringify(data) : data;

        // when we do a fetch with form data, leave the Content-Type undefined so browser can set form boundary
        if (contentType !== "multipart/form-data") {
            (request.headers as any)["Content-Type"] = contentType;
        }
    }

    if (responseMediaType) {
        (request.headers as any)[ACCEPT_HEADER] = responseMediaType;
    }
    return request;
}

function createFetchResponse(data: any, status: number): IMockResponseObject {
    return {
        body: data,
        headers: {
            "Content-Type": MediaType.APPLICATION_JSON,
        },
        ok: status >= 200 && status < 300,
        sendAsJson: true,
        status,
    };
}
