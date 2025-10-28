import * as Context from "effect/Context";

export declare namespace HttpServerRequest {
  export type Type = {
    readonly source: unknown;
    readonly url: string;
    readonly method: string;
    readonly headers: Record<string, string | string[] | undefined>;
  };
}

export class HttpServerRequest extends Context.Tag("HttpServerRequest")<HttpServerRequest, HttpServerRequest.Type>() {}
