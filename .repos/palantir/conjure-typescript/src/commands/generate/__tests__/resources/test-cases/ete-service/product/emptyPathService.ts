import { IHttpApiBridge, MediaType } from "conjure-client";

export interface IEmptyPathService {
    emptyPath(): Promise<boolean>;
}

export class EmptyPathService {
    constructor(private bridge: IHttpApiBridge) {
    }

    public emptyPath(): Promise<boolean> {
        return this.bridge.callEndpoint<boolean>({
            data: undefined,
            endpointName: "emptyPath",
            endpointPath: "/",
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
}
