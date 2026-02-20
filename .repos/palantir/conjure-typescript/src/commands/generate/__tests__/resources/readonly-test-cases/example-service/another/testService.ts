import { IBackingFileSystem } from "../product-datasets/backingFileSystem";
import { IDataset } from "../product-datasets/dataset";
import { ICreateDatasetRequest } from "../product/createDatasetRequest";
import type { IHttpApiBridge } from "conjure-client";

/** Constant reference to `undefined` that we expect to get minified and therefore reduce total code size */
const __undefined: undefined = undefined;

/**
 * A Markdown description of the service.
 *
 */
export interface ITestService {
    /**
     * Returns a mapping from file system id to backing file system configuration.
     *
     */
    getFileSystems(): Promise<{ readonly [key: string]: IBackingFileSystem }>;
    createDataset(request: ICreateDatasetRequest, testHeaderArg: string): Promise<IDataset>;
    getDataset(datasetRid: string): Promise<IDataset | null>;
    getRawData(datasetRid: string): Promise<ReadableStream<Uint8Array>>;
    getAliasedRawData(datasetRid: string): Promise<ReadableStream<Uint8Array>>;
    maybeGetRawData(datasetRid: string): Promise<ReadableStream<Uint8Array> | null>;
    getAliasedString(datasetRid: string): Promise<string>;
    uploadRawData(input: ReadableStream<Uint8Array> | BufferSource | Blob): Promise<void>;
    uploadAliasedRawData(input: ReadableStream<Uint8Array> | BufferSource | Blob): Promise<void>;
    getBranches(datasetRid: string): Promise<ReadonlyArray<string>>;
    /**
     * Gets all branches of this dataset.
     *
     * @deprecated use getBranches instead
     */
    getBranchesDeprecated(datasetRid: string): Promise<ReadonlyArray<string>>;
    resolveBranch(datasetRid: string, branch: string): Promise<string | null>;
    testParam(datasetRid: string): Promise<string | null>;
    testQueryParams(query: string, something: string, implicit: string, setEnd: ReadonlyArray<string>, optionalMiddle?: string | null, optionalEnd?: string | null): Promise<number>;
    testNoResponseQueryParams(query: string, something: string, implicit: string, setEnd: ReadonlyArray<string>, optionalMiddle?: string | null, optionalEnd?: string | null): Promise<void>;
    testBoolean(): Promise<boolean>;
    testDouble(): Promise<number | "NaN">;
    testInteger(): Promise<number>;
    testPostOptional(maybeString?: string | null): Promise<string | null>;
    testOptionalIntegerAndDouble(maybeInteger?: number | null, maybeDouble?: number | "NaN" | null): Promise<void>;
}

export class TestService implements ITestService {
    constructor(private bridge: IHttpApiBridge) {
    }

    /**
     * Returns a mapping from file system id to backing file system configuration.
     *
     */
    public getFileSystems(): Promise<{ readonly [key: string]: IBackingFileSystem }> {
        return this.bridge.call<{ readonly [key: string]: IBackingFileSystem }>(
            "TestService",
            "getFileSystems",
            "GET",
            "/catalog/fileSystems",
            __undefined,
            __undefined,
            __undefined,
            __undefined,
            __undefined,
            __undefined
        );
    }

    public createDataset(request: ICreateDatasetRequest, testHeaderArg: string): Promise<IDataset> {
        return this.bridge.call<IDataset>(
            "TestService",
            "createDataset",
            "POST",
            "/catalog/datasets",
            request,
            {
                "Test-Header": testHeaderArg,
            },
            __undefined,
            __undefined,
            __undefined,
            __undefined
        );
    }

    public getDataset(datasetRid: string): Promise<IDataset | null> {
        return this.bridge.call<IDataset | null>(
            "TestService",
            "getDataset",
            "GET",
            "/catalog/datasets/{datasetRid}",
            __undefined,
            __undefined,
            __undefined,
            [
                datasetRid,
            ],
            __undefined,
            __undefined
        );
    }

    public getRawData(datasetRid: string): Promise<ReadableStream<Uint8Array>> {
        return this.bridge.call<ReadableStream<Uint8Array>>(
            "TestService",
            "getRawData",
            "GET",
            "/catalog/datasets/{datasetRid}/raw",
            __undefined,
            __undefined,
            __undefined,
            [
                datasetRid,
            ],
            __undefined,
            "application/octet-stream"
        );
    }

    public getAliasedRawData(datasetRid: string): Promise<ReadableStream<Uint8Array>> {
        return this.bridge.call<ReadableStream<Uint8Array>>(
            "TestService",
            "getAliasedRawData",
            "GET",
            "/catalog/datasets/{datasetRid}/raw-aliased",
            __undefined,
            __undefined,
            __undefined,
            [
                datasetRid,
            ],
            __undefined,
            "application/octet-stream"
        );
    }

    public maybeGetRawData(datasetRid: string): Promise<ReadableStream<Uint8Array> | null> {
        return this.bridge.call<ReadableStream<Uint8Array> | null>(
            "TestService",
            "maybeGetRawData",
            "GET",
            "/catalog/datasets/{datasetRid}/raw-maybe",
            __undefined,
            __undefined,
            __undefined,
            [
                datasetRid,
            ],
            __undefined,
            "application/octet-stream"
        );
    }

    public getAliasedString(datasetRid: string): Promise<string> {
        return this.bridge.call<string>(
            "TestService",
            "getAliasedString",
            "GET",
            "/catalog/datasets/{datasetRid}/string-aliased",
            __undefined,
            __undefined,
            __undefined,
            [
                datasetRid,
            ],
            __undefined,
            __undefined
        );
    }

    public uploadRawData(input: ReadableStream<Uint8Array> | BufferSource | Blob): Promise<void> {
        return this.bridge.call<void>(
            "TestService",
            "uploadRawData",
            "POST",
            "/catalog/datasets/upload-raw",
            input,
            __undefined,
            __undefined,
            __undefined,
            "application/octet-stream",
            __undefined
        );
    }

    public uploadAliasedRawData(input: ReadableStream<Uint8Array> | BufferSource | Blob): Promise<void> {
        return this.bridge.call<void>(
            "TestService",
            "uploadAliasedRawData",
            "POST",
            "/catalog/datasets/upload-raw-aliased",
            input,
            __undefined,
            __undefined,
            __undefined,
            "application/octet-stream",
            __undefined
        );
    }

    public getBranches(datasetRid: string): Promise<ReadonlyArray<string>> {
        return this.bridge.call<ReadonlyArray<string>>(
            "TestService",
            "getBranches",
            "GET",
            "/catalog/datasets/{datasetRid}/branches",
            __undefined,
            __undefined,
            __undefined,
            [
                datasetRid,
            ],
            __undefined,
            __undefined
        );
    }

    /**
     * Gets all branches of this dataset.
     *
     * @deprecated use getBranches instead
     */
    public getBranchesDeprecated(datasetRid: string): Promise<ReadonlyArray<string>> {
        return this.bridge.call<ReadonlyArray<string>>(
            "TestService",
            "getBranchesDeprecated",
            "GET",
            "/catalog/datasets/{datasetRid}/branchesDeprecated",
            __undefined,
            __undefined,
            __undefined,
            [
                datasetRid,
            ],
            __undefined,
            __undefined
        );
    }

    public resolveBranch(datasetRid: string, branch: string): Promise<string | null> {
        return this.bridge.call<string | null>(
            "TestService",
            "resolveBranch",
            "GET",
            "/catalog/datasets/{datasetRid}/branches/{branch:.+}/resolve",
            __undefined,
            __undefined,
            __undefined,
            [
                datasetRid,
                branch,
            ],
            __undefined,
            __undefined
        );
    }

    public testParam(datasetRid: string): Promise<string | null> {
        return this.bridge.call<string | null>(
            "TestService",
            "testParam",
            "GET",
            "/catalog/datasets/{datasetRid}/testParam",
            __undefined,
            __undefined,
            __undefined,
            [
                datasetRid,
            ],
            __undefined,
            __undefined
        );
    }

    public testQueryParams(query: string, something: string, implicit: string, setEnd: ReadonlyArray<string>, optionalMiddle?: string | null, optionalEnd?: string | null): Promise<number> {
        return this.bridge.call<number>(
            "TestService",
            "testQueryParams",
            "POST",
            "/catalog/test-query-params",
            query,
            __undefined,
            {
                "different": something,
                "implicit": implicit,
                "setEnd": setEnd,
                "optionalMiddle": optionalMiddle,
                "optionalEnd": optionalEnd,
            },
            __undefined,
            __undefined,
            __undefined
        );
    }

    public testNoResponseQueryParams(query: string, something: string, implicit: string, setEnd: ReadonlyArray<string>, optionalMiddle?: string | null, optionalEnd?: string | null): Promise<void> {
        return this.bridge.call<void>(
            "TestService",
            "testNoResponseQueryParams",
            "POST",
            "/catalog/test-no-response-query-params",
            query,
            __undefined,
            {
                "different": something,
                "implicit": implicit,
                "setEnd": setEnd,
                "optionalMiddle": optionalMiddle,
                "optionalEnd": optionalEnd,
            },
            __undefined,
            __undefined,
            __undefined
        );
    }

    public testBoolean(): Promise<boolean> {
        return this.bridge.call<boolean>(
            "TestService",
            "testBoolean",
            "GET",
            "/catalog/boolean",
            __undefined,
            __undefined,
            __undefined,
            __undefined,
            __undefined,
            __undefined
        );
    }

    public testDouble(): Promise<number | "NaN"> {
        return this.bridge.call<number | "NaN">(
            "TestService",
            "testDouble",
            "GET",
            "/catalog/double",
            __undefined,
            __undefined,
            __undefined,
            __undefined,
            __undefined,
            __undefined
        );
    }

    public testInteger(): Promise<number> {
        return this.bridge.call<number>(
            "TestService",
            "testInteger",
            "GET",
            "/catalog/integer",
            __undefined,
            __undefined,
            __undefined,
            __undefined,
            __undefined,
            __undefined
        );
    }

    public testPostOptional(maybeString?: string | null): Promise<string | null> {
        return this.bridge.call<string | null>(
            "TestService",
            "testPostOptional",
            "POST",
            "/catalog/optional",
            maybeString,
            __undefined,
            __undefined,
            __undefined,
            __undefined,
            __undefined
        );
    }

    public testOptionalIntegerAndDouble(maybeInteger?: number | null, maybeDouble?: number | "NaN" | null): Promise<void> {
        return this.bridge.call<void>(
            "TestService",
            "testOptionalIntegerAndDouble",
            "GET",
            "/catalog/optional-integer-double",
            __undefined,
            __undefined,
            {
                "maybeInteger": maybeInteger,
                "maybeDouble": maybeDouble,
            },
            __undefined,
            __undefined,
            __undefined
        );
    }
}
