import { SimpleEnum } from "./simpleEnum";
import { IHttpApiBridge, MediaType } from "conjure-client";

export interface IEteService {
    string(): Promise<string>;
    integer(): Promise<number>;
    double_(): Promise<number | "NaN">;
    boolean_(): Promise<boolean>;
    safelong(): Promise<number>;
    rid(): Promise<string>;
    bearertoken(): Promise<string>;
    optionalString(): Promise<string | null>;
    optionalEmpty(): Promise<string | null>;
    datetime(): Promise<string>;
    binary(): Promise<any>;
    path(param: string): Promise<string>;
    notNullBody(notNullBody: string): Promise<string>;
    aliasOne(queryParamName: string): Promise<string>;
    optionalAliasOne(queryParamName?: string | null): Promise<string>;
    aliasTwo(queryParamName: string): Promise<string>;
    notNullBodyExternalImport(notNullBody: string): Promise<string>;
    optionalBodyExternalImport(body?: string | null): Promise<string | null>;
    optionalQueryExternalImport(query?: string | null): Promise<string | null>;
    noReturn(): Promise<void>;
    enumQuery(queryParamName: SimpleEnum): Promise<SimpleEnum>;
    enumListQuery(queryParamName: Array<SimpleEnum>): Promise<Array<SimpleEnum>>;
    optionalEnumQuery(queryParamName?: SimpleEnum | null): Promise<SimpleEnum | null>;
    enumHeader(headerParameter: SimpleEnum): Promise<SimpleEnum>;
}

export class EteService {
    constructor(private bridge: IHttpApiBridge) {
    }

    public string(): Promise<string> {
        return this.bridge.callEndpoint<string>({
            data: undefined,
            endpointName: "string",
            endpointPath: "/base/string",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public integer(): Promise<number> {
        return this.bridge.callEndpoint<number>({
            data: undefined,
            endpointName: "integer",
            endpointPath: "/base/integer",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public double_(): Promise<number | "NaN"> {
        return this.bridge.callEndpoint<number | "NaN">({
            data: undefined,
            endpointName: "double_",
            endpointPath: "/base/double",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public boolean_(): Promise<boolean> {
        return this.bridge.callEndpoint<boolean>({
            data: undefined,
            endpointName: "boolean_",
            endpointPath: "/base/boolean",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public safelong(): Promise<number> {
        return this.bridge.callEndpoint<number>({
            data: undefined,
            endpointName: "safelong",
            endpointPath: "/base/safelong",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public rid(): Promise<string> {
        return this.bridge.callEndpoint<string>({
            data: undefined,
            endpointName: "rid",
            endpointPath: "/base/rid",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public bearertoken(): Promise<string> {
        return this.bridge.callEndpoint<string>({
            data: undefined,
            endpointName: "bearertoken",
            endpointPath: "/base/bearertoken",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public optionalString(): Promise<string | null> {
        return this.bridge.callEndpoint<string | null>({
            data: undefined,
            endpointName: "optionalString",
            endpointPath: "/base/optionalString",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public optionalEmpty(): Promise<string | null> {
        return this.bridge.callEndpoint<string | null>({
            data: undefined,
            endpointName: "optionalEmpty",
            endpointPath: "/base/optionalEmpty",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public datetime(): Promise<string> {
        return this.bridge.callEndpoint<string>({
            data: undefined,
            endpointName: "datetime",
            endpointPath: "/base/datetime",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public binary(): Promise<Blob> {
        return this.bridge.callEndpoint<any>({
            data: undefined,
            endpointName: "binary",
            endpointPath: "/base/binary",
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

    public path(param: string): Promise<string> {
        return this.bridge.callEndpoint<string>({
            data: undefined,
            endpointName: "path",
            endpointPath: "/base/path/{param}",
            headers: {
            },
            method: "GET",
            pathArguments: [
                param,
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public notNullBody(notNullBody: string): Promise<string> {
        return this.bridge.callEndpoint<string>({
            data: notNullBody,
            endpointName: "notNullBody",
            endpointPath: "/base/notNullBody",
            headers: {
            },
            method: "POST",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public aliasOne(queryParamName: string): Promise<string> {
        return this.bridge.callEndpoint<string>({
            data: undefined,
            endpointName: "aliasOne",
            endpointPath: "/base/aliasOne",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
                "queryParamName": queryParamName,
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public optionalAliasOne(queryParamName?: string | null): Promise<string> {
        return this.bridge.callEndpoint<string>({
            data: undefined,
            endpointName: "optionalAliasOne",
            endpointPath: "/base/optionalAliasOne",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
                "queryParamName": queryParamName,
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public aliasTwo(queryParamName: string): Promise<string> {
        return this.bridge.callEndpoint<string>({
            data: undefined,
            endpointName: "aliasTwo",
            endpointPath: "/base/aliasTwo",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
                "queryParamName": queryParamName,
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public notNullBodyExternalImport(notNullBody: string): Promise<string> {
        return this.bridge.callEndpoint<string>({
            data: notNullBody,
            endpointName: "notNullBodyExternalImport",
            endpointPath: "/base/external/notNullBody",
            headers: {
            },
            method: "POST",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public optionalBodyExternalImport(body?: string | null): Promise<string | null> {
        return this.bridge.callEndpoint<string | null>({
            data: body,
            endpointName: "optionalBodyExternalImport",
            endpointPath: "/base/external/optional-body",
            headers: {
            },
            method: "POST",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public optionalQueryExternalImport(query?: string | null): Promise<string | null> {
        return this.bridge.callEndpoint<string | null>({
            data: undefined,
            endpointName: "optionalQueryExternalImport",
            endpointPath: "/base/external/optional-query",
            headers: {
            },
            method: "POST",
            pathArguments: [
            ],
            queryArguments: {
                "query": query,
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public noReturn(): Promise<void> {
        return this.bridge.callEndpoint<void>({
            data: undefined,
            endpointName: "noReturn",
            endpointPath: "/base/no-return",
            headers: {
            },
            method: "POST",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public enumQuery(queryParamName: SimpleEnum): Promise<SimpleEnum> {
        return this.bridge.callEndpoint<SimpleEnum>({
            data: undefined,
            endpointName: "enumQuery",
            endpointPath: "/base/enum/query",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
                "queryParamName": queryParamName,
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public enumListQuery(queryParamName: Array<SimpleEnum>): Promise<Array<SimpleEnum>> {
        return this.bridge.callEndpoint<Array<SimpleEnum>>({
            data: undefined,
            endpointName: "enumListQuery",
            endpointPath: "/base/enum/list/query",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
                "queryParamName": queryParamName,
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public optionalEnumQuery(queryParamName?: SimpleEnum | null): Promise<SimpleEnum | null> {
        return this.bridge.callEndpoint<SimpleEnum | null>({
            data: undefined,
            endpointName: "optionalEnumQuery",
            endpointPath: "/base/enum/optional/query",
            headers: {
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
                "queryParamName": queryParamName,
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }

    public enumHeader(headerParameter: SimpleEnum): Promise<SimpleEnum> {
        return this.bridge.callEndpoint<SimpleEnum>({
            data: undefined,
            endpointName: "enumHeader",
            endpointPath: "/base/enum/header",
            headers: {
                "Custom-Header": headerParameter,
            },
            method: "GET",
            pathArguments: [
            ],
            queryArguments: {
            },
            requestMediaType: MediaType.APPLICATION_JSON,
            responseMediaType: MediaType.APPLICATION_JSON,
        });
    }
}
