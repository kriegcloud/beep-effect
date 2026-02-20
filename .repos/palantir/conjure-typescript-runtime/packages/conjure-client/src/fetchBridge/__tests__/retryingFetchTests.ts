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

import { IFetchResponse } from "../fetchBridge";
import { exponentialBackoff, RetryingFetch } from "../retryingFetch";

const baseUrl = "https://host.domain/path";
const token = "TOKEN";

describe("RetryingFetch", () => {
    const maxAttempts = 3;
    const backoff = exponentialBackoff(maxAttempts, 100);

    it("delegates to the passed delegate fetch", async () => {
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest("POST");
        const expectedFetchResponse = createFetchResponse(undefined, 200);

        const delegateFetch = jest.fn((_, __) => {
            return Promise.resolve(expectedFetchResponse);
        });

        const retryingFetch = new RetryingFetch(delegateFetch, backoff);

        const response = retryingFetch.fetch(expectedUrl, expectedFetchRequest);

        await expect(response).resolves.toBe(expectedFetchResponse);
        expect(delegateFetch.mock.calls.length).toBe(1);
        expect(delegateFetch.mock.calls[0]).toEqual([expectedUrl, expectedFetchRequest]);
    });

    it("retries a limited number of times", async () => {
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest("POST");
        const expectedFetchResponse = createFetchResponse(undefined, 429);

        const delegateFetch = jest.fn((_, __) => {
            return Promise.resolve(expectedFetchResponse);
        });

        const retryingFetch = new RetryingFetch(delegateFetch, backoff);

        const response = retryingFetch.fetch(expectedUrl, expectedFetchRequest);

        await expect(response).resolves.toBe(expectedFetchResponse);
        expect(delegateFetch.mock.calls.length).toBe(maxAttempts);
    });

    it("retries on 503s", async () => {
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest("POST");
        const expectedFetchResponse = createFetchResponse(undefined, 503);

        const delegateFetch = jest.fn((_, __) => {
            return Promise.resolve(expectedFetchResponse);
        });

        const retryingFetch = new RetryingFetch(delegateFetch, backoff);

        const response = retryingFetch.fetch(expectedUrl, expectedFetchRequest);

        await expect(response).resolves.toBe(expectedFetchResponse);
        expect(delegateFetch.mock.calls.length).toBe(maxAttempts);
    });

    it("does not retry non-qos error response", async () => {
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest("POST");
        const expectedFetchResponse = createFetchResponse(undefined, 400);

        const delegateFetch = jest.fn((_, __) => {
            return Promise.resolve(expectedFetchResponse);
        });

        const retryingFetch = new RetryingFetch(delegateFetch, backoff);

        const response = retryingFetch.fetch(expectedUrl, expectedFetchRequest);

        await expect(response).resolves.toBe(expectedFetchResponse);
        // check we did not retry
        expect(delegateFetch.mock.calls.length).toBe(1);
    });

    it("honours Retry-After header", async () => {
        const expectedUrl = `${baseUrl}/a/val/b`;
        const expectedFetchRequest = createFetchRequest("POST");
        const expectedFetchResponse = createFetchResponse(undefined, 429);
        if (expectedFetchResponse.headers instanceof Headers) {
            expectedFetchResponse.headers.append("Retry-After", "2");
        }

        const delegateFetch = jest.fn((_, __) => {
            return Promise.resolve(expectedFetchResponse);
        });

        const retryingFetch = new RetryingFetch(delegateFetch, backoff);

        const originalSetTimeout = window.setTimeout;
        const mockedSetTimeout = jest.fn((callback, timeout) => {
            originalSetTimeout(callback, timeout);
            return 0;
        });
        window.setTimeout = mockedSetTimeout as any;

        await retryingFetch.fetch(expectedUrl, expectedFetchRequest);
        expect(mockedSetTimeout.mock.calls[0][1]).toEqual(2000);

        // restore
        window.setTimeout = originalSetTimeout;
    });
});

function createFetchRequest(method: string, data?: any, contentType = "application/json", headers = {}): RequestInit {
    const request: RequestInit = {
        credentials: "same-origin",
        headers: {
            ...headers,
            Authorization: `Bearer ${token}`,
        },
        method,
    };
    if (data != null) {
        request.body = contentType === "application/json" ? JSON.stringify(data) : data;

        // when we do a fetch with form data, leave the Content-Type undefined so browser can set form boundary
        if (contentType !== "multipart/form-data") {
            (request.headers as any)["Content-Type"] = contentType;
        }
    }
    return request;
}

function createFetchResponse(data: any, status: number): IFetchResponse {
    return {
        body: new ReadableStream(),
        blob: () => Promise.resolve(new Blob([data])),
        headers: new Headers(),
        json: () => Promise.resolve(JSON.parse(data)),
        ok: 200 <= status && status < 300,
        status,
        text: () => Promise.resolve(data),
    };
}
