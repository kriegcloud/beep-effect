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

import { ConjureError, ConjureErrorType } from "../errors";
import { IMPLEMENTATION_VERSION } from "../generated";
import { IHttpApiBridge, IHttpEndpointOptions, MediaType } from "../httpApiBridge";
import { IUserAgent, UserAgent } from "../userAgent";
import { blobToReadableStream } from "./blobReadableStreamAdapter";

export interface IFetchBody {
    json(): Promise<any>;
    text(): Promise<string>;
    blob(): Promise<Blob>;
}

export interface IFetchResponse extends IFetchBody {
    readonly body: ReadableStream<Uint8Array> | null;
    readonly headers: Headers;
    readonly ok: boolean;
    readonly status: number;
}

export type FetchFunction = (url: string | Request, init?: RequestInit) => Promise<IFetchResponse>;

export type Supplier<T> = () => T;

export interface IFetchBridgeParams {
    baseUrl: string | Supplier<string>;
    /**
     * All network requests will add this userAgent as a header param called 'Fetch-User-Agent'.
     * This will be logged in receiving service's request logs as params.User-Agent
     */
    userAgent: IUserAgent | ReadonlyArray<IUserAgent | Supplier<IUserAgent | IUserAgent[]>>;
    token?: string | Supplier<string> | Supplier<Promise<string>>;
    fetch?: FetchFunction;
}

const CONJURE_USER_AGENT = {
    productName: "conjure-typescript-runtime",
    productVersion: IMPLEMENTATION_VERSION,
};

export class FetchBridge implements IHttpApiBridge {
    private static ACCEPT_HEADER = "accept";

    private readonly getBaseUrl: Supplier<string>;
    private readonly getToken: Supplier<string | Promise<string> | undefined>;
    private readonly fetch: FetchFunction | undefined;
    private readonly userAgentSuppliers: Array<Supplier<IUserAgent | IUserAgent[]>>;

    constructor(params: IFetchBridgeParams) {
        this.getBaseUrl = typeof params.baseUrl === "function" ? params.baseUrl : () => params.baseUrl as string;
        this.getToken = typeof params.token === "function" ? params.token : () => params.token as string | undefined;
        this.fetch = params.fetch;

        const userAgents = Array.isArray(params.userAgent) ? params.userAgent : [params.userAgent];
        if (userAgents.length === 0) {
            throw new Error("At least one user agent must be provided");
        }
        this.userAgentSuppliers = [];
        for (const ua of userAgents) {
            if (typeof ua === "function") {
                this.userAgentSuppliers.push(ua);
            } else {
                this.userAgentSuppliers.push(() => ua);
            }
        }
        this.userAgentSuppliers.push(() => CONJURE_USER_AGENT);
    }

    public call<T>(
        serviceName: string,
        endpointName: string,
        method: string,
        endpointPath: string,
        data?: any,
        headers?: { [p: string]: string | number | boolean | undefined | null },
        queryArguments?: { [p: string]: any },
        pathArguments?: any[],
        requestMediaType?: string,
        responseMediaType?: string,
    ): Promise<T> {
        return this.callEndpoint({
            serviceName,
            endpointName,
            method,
            endpointPath,
            data,
            headers: headers == null ? {} : headers,
            requestMediaType:
                requestMediaType == null ? MediaType.APPLICATION_JSON : this.getMediaType(requestMediaType),
            responseMediaType:
                responseMediaType == null ? MediaType.APPLICATION_JSON : this.getMediaType(responseMediaType),
            queryArguments: queryArguments == null ? {} : queryArguments,
            pathArguments: pathArguments == null ? [] : pathArguments,
            binaryAsStream: true,
        });
    }

    public async callEndpoint<T>(params: IHttpEndpointOptions): Promise<T> {
        const fetchPromise = this.makeFetchCall(params);

        try {
            const response = await fetchPromise;
            if (response.status === 204) {
                // Users of this HTTP bridge are responsible for declaring whether their endpoint might return a 204
                // by including `| undefined` in callEndpoint's generic type param. We choose this over declaring the
                // return type of this method as `Promise<T | undefined>` so that API calls which are guaranteed to
                // resolve to a non-null value (when successful) don't have to deal with an unreachable code path.
                return undefined!;
            }

            const contentType =
                response.headers.get("Content-Type") != null ? (response.headers.get("Content-Type") as string) : "";
            if (
                (contentType.includes(MediaType.APPLICATION_OCTET_STREAM) || this.isBinaryMedia(contentType)) &&
                params.binaryAsStream
            ) {
                return this.handleBinaryResponseBody(response) as any;
            }

            let bodyPromise;
            if (contentType.includes(MediaType.APPLICATION_JSON)) {
                bodyPromise = response.json();
            } else if (contentType.includes(MediaType.APPLICATION_OCTET_STREAM) || this.isBinaryMedia(contentType)) {
                bodyPromise = response.blob();
            } else {
                bodyPromise = response.text();
            }

            let body;
            try {
                body = await bodyPromise;
            } catch (error) {
                throw new ConjureError(ConjureErrorType.Parse, error, response.status);
            }

            if (!response.ok) {
                throw new ConjureError(ConjureErrorType.Status, undefined, response.status, body);
            }

            return body;
        } catch (error) {
            if (error instanceof ConjureError) {
                throw error;
            } else if (error instanceof TypeError) {
                throw new ConjureError(ConjureErrorType.Network, error);
            } else {
                throw new ConjureError(ConjureErrorType.Other, error);
            }
        }
    }

    private async makeFetchCall(params: IHttpEndpointOptions): Promise<IFetchResponse> {
        const query = this.buildQueryString(params.queryArguments);
        const url = `${this.getBaseUrl()}/${this.buildPath(params)}${query.length > 0 ? `?${query}` : ""}`;
        const { data, headers = {}, method, requestMediaType, responseMediaType } = params;
        const stringifiedHeaders: { [headerName: string]: string } = {
            "Fetch-User-Agent": this.getUserAgent().toString(),
        };

        // Only send present headers as strings
        Object.keys(headers).forEach(key => {
            const headerValue = headers[key];
            if (headerValue != null) {
                stringifiedHeaders[key] = headerValue.toString();
            }
        });

        const fetchRequestInit: RequestInit = {
            credentials: "same-origin",
            headers: stringifiedHeaders,
            method,
        };

        const token = await this.getToken();
        if (token !== undefined) {
            fetchRequestInit.headers = { ...fetchRequestInit.headers, Authorization: `Bearer ${token}` };
        }

        if (requestMediaType != null && requestMediaType !== MediaType.MULTIPART_FORM_DATA) {
            // don't include for form data because we need the browser to fill in the form boundary
            (fetchRequestInit.headers as any)["Content-Type"] = requestMediaType;
        }
        if (responseMediaType != null) {
            // If an endpoint can return multiple content types, make sure it returns the type that we're expecting
            // instead of the default `*/*
            (fetchRequestInit.headers as any)[FetchBridge.ACCEPT_HEADER] = responseMediaType;
        }

        if (data != null) {
            fetchRequestInit.body = this.handleBody(params);
        }

        const fetchFunction = this.fetch || fetch;

        return fetchFunction(url, fetchRequestInit);
    }

    private getUserAgent(): UserAgent {
        return new UserAgent(
            this.userAgentSuppliers
                .map(uaSupplier => uaSupplier())
                .reduce((uas: IUserAgent[], ua) => {
                    if (Array.isArray(ua)) {
                        uas.push(...ua);
                    } else {
                        uas.push(ua);
                    }
                    return uas;
                }, []),
        );
    }

    private async handleBinaryResponseBody(response: IFetchResponse): Promise<ReadableStream<Uint8Array>> {
        if (response.body === null) {
            return blobToReadableStream(response.blob());
        } else {
            return response.body;
        }
    }

    private appendQueryParameter(query: string[], key: string, value: any) {
        query.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }

    private buildPath(parameters: IHttpEndpointOptions) {
        const urlParameterRegex = /\{[^\}]+\}/;
        let path = this.normalizeWithNoLeadingSlash(parameters.endpointPath);
        for (let pathArgument of parameters.pathArguments) {
            pathArgument = pathArgument == null ? "" : pathArgument;
            path = path.replace(urlParameterRegex, encodeURIComponent(pathArgument));
        }
        return path;
    }

    private buildQueryString(data: { [key: string]: any }) {
        if (data == null) {
            return "";
        }

        const query: string[] = [];
        for (const key of Object.keys(data)) {
            const value = data[key];
            if (value == null) {
                continue;
            }
            if (value instanceof Array) {
                value.forEach((v: any) => this.appendQueryParameter(query, key, v));
            } else {
                this.appendQueryParameter(query, key, value);
            }
        }
        return query.join("&");
    }

    private handleBody(parameters: IHttpEndpointOptions) {
        switch (parameters.requestMediaType) {
            case MediaType.APPLICATION_JSON:
                return JSON.stringify(parameters.data);
            case MediaType.APPLICATION_OCTET_STREAM:
            case MediaType.MULTIPART_FORM_DATA:
                return parameters.data;
            case MediaType.APPLICATION_X_WWW_FORM_URLENCODED:
                return this.buildQueryString(parameters.data);
            case MediaType.TEXT_PLAIN:
                if (typeof parameters.data === "object") {
                    throw new Error("Invalid data: cannot send object as request media type text/plain");
                }
                return parameters.data;
            default:
                throw new Error("Unrecognized request media type " + parameters.requestMediaType);
        }
    }

    private normalizeWithNoLeadingSlash(input: string) {
        if (input && input[0] === "/") {
            input = input.slice(1);
        }
        return input;
    }

    private getMediaType(value: string): MediaType {
        if (value === MediaType.APPLICATION_JSON) {
            return MediaType.APPLICATION_JSON;
        } else if (value === MediaType.APPLICATION_OCTET_STREAM) {
            return MediaType.APPLICATION_OCTET_STREAM;
        } else if (value === MediaType.APPLICATION_X_WWW_FORM_URLENCODED) {
            return MediaType.APPLICATION_X_WWW_FORM_URLENCODED;
        } else if (value === MediaType.MULTIPART_FORM_DATA) {
            return MediaType.MULTIPART_FORM_DATA;
        } else if (value === MediaType.TEXT_PLAIN) {
            return MediaType.TEXT_PLAIN;
        }
        // TODO(forozco): use safe errors
        throw new Error("Unexpected media type " + value);
    }

    private isBinaryMedia(contentType: string): boolean {
        return (
            contentType.includes("image/") ||
            contentType.includes("audio/") ||
            contentType.includes("video/") ||
            contentType.includes("application/pdf") ||
            contentType.includes("application/dicom") ||
            contentType.includes("application/vnd.nitf") ||
            contentType.includes("application/vnd.openxmlformats-officedocument.presentationml") ||
            contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml") ||
            contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml")
        );
    }
}
