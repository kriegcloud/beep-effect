import { IHttpApiBridge, MediaType } from "conjure-client";

export interface IEteBinaryService {
    postBinary(body: Blob): Promise<Blob>;
    getOptionalBinaryPresent(): Promise<Blob | null>;
    getOptionalBinaryEmpty(): Promise<Blob | null>;
    /** Throws an exception after partially writing a binary response. */
    getBinaryFailure(numBytes: number): Promise<any>;
}

export class EteBinaryService {
    constructor(private bridge: IHttpApiBridge) {
    }

    public postBinary(body: Blob): Promise<Blob> {
        return this.bridge.callEndpoint<Blob>({
            data: body,
            endpointName: "postBinary",
            endpointPath: "/binary",
            headers: {
            },
            method: "POST",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_OCTET_STREAM,
            responseMediaType: MediaType.APPLICATION_OCTET_STREAM,
        });
    }

    public getOptionalBinaryPresent(): Promise<Blob | null> {
        return this.bridge.callEndpoint<Blob | null>({
            data: undefined,
            endpointName: "getOptionalBinaryPresent",
            endpointPath: "/binary/optional/present",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_OCTET_STREAM,
        });
    }

    public getOptionalBinaryEmpty(): Promise<Blob | null> {
        return this.bridge.callEndpoint<Blob | null>({
            data: undefined,
            endpointName: "getOptionalBinaryEmpty",
            endpointPath: "/binary/optional/empty",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_OCTET_STREAM,
        });
    }

    public getBinaryFailure(numBytes: number): Promise<Blob> {
        return this.bridge.callEndpoint<Blob>({
            data: undefined,
            endpointName: "getBinaryFailure",
            endpointPath: "/binary/failure",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
                "numBytes": numBytes,
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_OCTET_STREAM,
        });
    }
}
