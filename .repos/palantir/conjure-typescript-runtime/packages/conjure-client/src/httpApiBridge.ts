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

export interface IHttpEndpointOptions {
    /** Conjure service name. Doesn't affect the network request. */
    serviceName?: string;

    /** Path to make a request to, e.g. "/foo/{param1}/bar". */
    endpointPath: string;

    /** Conjure endpoint name. Doesn't affect the network request. */
    endpointName?: string;

    /** HTTP headers. */
    headers?: { [header: string]: string | number | boolean | undefined | null };

    /** HTTP method. */
    method: string;

    /** MIME type of the outgoing request, usually "application/json" */
    requestMediaType?: MediaType;

    /** MIME type of the expected server response, often "application/json" or "application/octet-stream" */
    responseMediaType?: MediaType;

    /** Values to be interpolated into the endpointPath. */
    pathArguments: any[];

    /** Key-value mappings to be appended to the request query string. */
    queryArguments: any;

    /** Data to send in the body. */
    data?: any;

    /** return binary response as web stream */
    binaryAsStream?: boolean;
}

export enum MediaType {
    APPLICATION_JSON = "application/json",
    APPLICATION_OCTET_STREAM = "application/octet-stream",
    APPLICATION_X_WWW_FORM_URLENCODED = "application/x-www-form-urlencoded",
    MULTIPART_FORM_DATA = "multipart/form-data",
    TEXT_PLAIN = "text/plain",
}

export interface IHttpApiBridge {
    callEndpoint<T>(parameters: IHttpEndpointOptions): Promise<T>;

    /**
     * Identical to callEndpoint replacing a request object with individual parameters to reduce the total code size
     * because of the field name overhead.
     */
    call<T>(
        /** Conjure service name. Doesn't affect the network request. */
        serviceName: string,
        /** Conjure endpoint name. Doesn't affect the network request. */
        endpointName: string,
        /** HTTP method. */
        method: string,
        /** Path to make a request to, e.g. "/foo/{param1}/bar". */
        endpointPath: string,
        /** Data to send in the body. */
        data?: any,
        /** HTTP headers. */
        headers?: { [header: string]: string | number | boolean | undefined | null },
        /** Key-value mappings to be appended to the request query string. */
        queryArguments?: { [paramName: string]: any },
        /** Values to be interpolated into the endpointPath. */
        pathArguments?: any[],
        /** MIME type of the outgoing request, if absent defaults to "application/json" */
        requestMediaType?: string,
        /** MIME type of the expected server response, if absent defaults to "application/json" */
        responseMediaType?: string,
    ): Promise<T>;
}
