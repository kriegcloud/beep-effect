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

import { IHttpApiBridge, MediaType } from "../../httpApiBridge";

export class ConjureService {
    constructor(private bridge: IHttpApiBridge) {}

    public string(): Promise<string> {
        return this.bridge.callEndpoint<string>({
            data: undefined,
            endpointName: "string",
            endpointPath: "/string",
            headers: {},
            method: "GET",
            pathArguments: [],
            queryArguments: {},
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public body(data: any): Promise<string> {
        return this.bridge.callEndpoint<string>({
            data,
            endpointName: "body",
            endpointPath: "/body",
            headers: {},
            method: "POST",
            pathArguments: [],
            queryArguments: {},
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public bodyCompact(data: any): Promise<string> {
        return this.bridge.call("ConjureService", "bodyCompact", "POST", "/body", data);
    }

    public binary(): Promise<ReadableStream<Uint8Array>> {
        return this.bridge.callEndpoint<ReadableStream<Uint8Array>>({
            endpointName: "binary",
            endpointPath: "/binary",
            headers: {},
            method: "POST",
            pathArguments: [],
            queryArguments: {},
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_OCTET_STREAM,
            binaryAsStream: true,
        });
    }
}
