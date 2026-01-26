import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { HttpMethod } from "@beep/schema/integrations/http";
import * as S from "effect/Schema";

const $I = $SharedAiId.create("models/agent");

export class ResposneType extends BS.StringLiteralKit("json", "text", "bytes").annotations(
  $I.annotations("ResposneType", {
    description: "The type of response from the tool.",
  })
) {}

export declare namespace ResposneType {
  export type Type = typeof ResposneType.Type;
}

export class QueryValue extends S.Union(S.String, S.Number, S.Boolean).annotations(
  $I.annotations("QueryValue", {
    description: "The type of query value.",
  })
) {}

export declare namespace QueryValue {
  export type Type = typeof QueryValue.Type;
}

export class HttpBodyType extends BS.StringLiteralKit("json", "text", "form").annotations(
  $I.annotations("HttpBodyType", {
    description: "The type of HTTP body.",
  })
) {}

export declare namespace HttpBodyType {
  export type Type = typeof HttpBodyType.Type;
}

const makeHttpBodyClass = HttpBodyType.toTagged("type").composer({});

export class HttpJsonBody extends S.Struct(
  {
    ...makeHttpBodyClass.json({
      value: S.Unknown,
    }).fields,
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("HttpJsonBody", {
    description: "The type of HTTP body.",
  })
) {}

export declare namespace HttpJsonBody {
  export type Type = typeof HttpJsonBody.Type;
}

export class HttpTextBody extends S.Struct(
  {
    ...makeHttpBodyClass.text({
      value: S.String,
    }).fields,
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("HttpTextBody", {
    description: "The type of HTTP body.",
  })
) {}

export declare namespace HttpTextBody {
  export type Type = typeof HttpTextBody.Type;
}

export class HttpFormBody extends S.Struct(
  {
    ...makeHttpBodyClass.form({
      value: S.Record({ key: S.String, value: S.String }),
    }).fields,
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("HttpFormBody", {
    description: "The type of HTTP body.",
  })
) {}

export declare namespace HttpFormBody {
  export type Type = typeof HttpFormBody.Type;
}

export class HttpBody extends S.Union(HttpJsonBody, HttpTextBody, HttpFormBody).annotations(
  $I.annotations("HttpBody", {
    description: "The type of HTTP body.",
  })
) {}

export declare namespace HttpBody {
  export type Type = typeof HttpBody.Type;
}

export class HttpResponseBodyType extends BS.StringLiteralKit("json", "text", "bytes").annotations(
  $I.annotations("HttpBodyType", {
    description: "The type of HTTP body.",
  })
) {}
export const makeHttpResponseBodyClass = HttpResponseBodyType.toTagged("type").composer({});

export class HttpResponseBodyJson extends S.Class<HttpResponseBodyJson>($I`HttpResponseBodyJson`)(
  makeHttpResponseBodyClass.json({
    data: S.Unknown,
    rawText: BS.OptionalAsOption(S.String),
    parseError: BS.OptionalAsOption(S.String),
  }),
  $I.annotations("HttpResponseBodyJson", {
    description: "The type of HTTP response body.",
  })
) {}

export class HttpResponseBodyText extends S.Class<HttpResponseBodyText>($I`HttpResponseBodyText`)(
  makeHttpResponseBodyClass.text({
    text: S.String,
  }),
  $I.annotations("HttpResponseBodyText", {
    description: "The type of HTTP response body.",
  })
) {}

export class HttpResponseBodyBytes extends S.Class<HttpResponseBodyBytes>($I`HttpResponseBodyBytes`)(
  makeHttpResponseBodyClass.bytes({
    base64: S.String,
  }),
  $I.annotations("HttpResponseBodyBytes", {
    description: "The type of HTTP response body.",
  })
) {}

export class HttpResponseBody extends S.Union(
  HttpResponseBodyJson,
  HttpResponseBodyText,
  HttpResponseBodyBytes
).annotations(
  $I.annotations("HttpResponseBody", {
    description: "The type of HTTP response body.",
  })
) {}

export declare namespace HttpResponseBody {
  export type Type = typeof HttpResponseBody.Type;
}

export class HttpRequestBodySummary extends S.Class<HttpRequestBodySummary>($I`HttpRequestBodySummary`)(
  {
    type: HttpBodyType,
    value: S.Unknown,
    truncated: S.optionalWith(S.Boolean, { as: "Option" }),
  },
  $I.annotations("HttpRequestBodySummary", {
    description: "Summary of the HTTP request body for logging/debugging purposes.",
  })
) {}

export declare namespace HttpRequestBodySummary {
  export type Type = typeof HttpRequestBodySummary.Type;
}

export class HttpRequestSummary extends S.Class<HttpRequestSummary>($I`HttpRequestSummary`)(
  {
    method: HttpMethod,
    url: S.String,
    headers: S.Record({ key: S.String, value: S.String }),
    query: S.optionalWith(S.Record({ key: S.String, value: S.String }), { as: "Option" }),
    body: S.optionalWith(HttpRequestBodySummary, { as: "Option" }),
    timeoutMs: S.NonNegativeInt,
    followRedirects: S.Boolean,
    maxResponseBytes: S.NonNegativeInt,
    responseType: ResposneType,
  },
  $I.annotations("HttpRequestSummary", {
    description: "Summary of the HTTP request sent.",
  })
) {}

export declare namespace HttpRequestSummary {
  export type Type = typeof HttpRequestSummary.Type;
}

export class HttpResponseSummary extends S.Class<HttpResponseSummary>($I`HttpResponseSummary`)(
  {
    status: S.NonNegativeInt,
    statusText: S.String,
    headers: S.Record({ key: S.String, value: S.String }),
    elapsedMs: S.NonNegativeInt,
    size: S.NonNegativeInt,
    truncated: S.Boolean,
    body: HttpResponseBody,
  },
  $I.annotations("HttpResponseSummary", {
    description: "Summary of the HTTP response received.",
  })
) {}

export declare namespace HttpResponseSummary {
  export type Type = typeof HttpResponseSummary.Type;
}

export class HttpRequestResult extends S.Class<HttpRequestResult>($I`HttpRequestResult`)(
  {
    request: HttpRequestSummary,
    response: HttpResponseSummary,
  },
  $I.annotations("HttpRequestResult", {
    description: "Complete result of an HTTP request including request details and response.",
  })
) {}

export declare namespace HttpRequestResult {
  export type Type = typeof HttpRequestResult.Type;
}

// Tool input schemas (matching Zod definitions)

const makeHttpToolBodyClass = HttpBodyType.toTagged("type").composer({});

export class HttpToolJsonBody extends S.Class<HttpToolJsonBody>($I`HttpToolJsonBody`)(
  makeHttpToolBodyClass.json({
    value: S.Unknown.annotations({
      description: "JSON-compatible value to serialize as the request body.",
    }),
  }),
  $I.annotations("HttpToolJsonBody", {
    description: "JSON body for HTTP tool request.",
  })
) {}

export class HttpToolTextBody extends S.Class<HttpToolTextBody>($I`HttpToolTextBody`)(
  makeHttpToolBodyClass.text({
    value: S.NonEmptyString.annotations({
      description: "Plain text body content.",
    }),
  }),
  $I.annotations("HttpToolTextBody", {
    description: "Text body for HTTP tool request.",
  })
) {}

export class HttpToolFormBody extends S.Class<HttpToolFormBody>($I`HttpToolFormBody`)(
  makeHttpToolBodyClass.form({
    value: S.Record({ key: S.String, value: S.String }).annotations({
      description: "Form data fields to encode as application/x-www-form-urlencoded.",
    }),
  }),
  $I.annotations("HttpToolFormBody", {
    description: "Form body for HTTP tool request.",
  })
) {}

export class HttpToolBody extends S.Union(HttpToolJsonBody, HttpToolTextBody, HttpToolFormBody).annotations(
  $I.annotations("HttpToolBody", {
    description: "Request body payload for HTTP tool.",
  })
) {}

export declare namespace HttpToolBody {
  export type Type = typeof HttpToolBody.Type;
}

const TimeoutMs = S.Int.pipe(S.positive(), S.lessThanOrEqualTo(120_000)).annotations({
  description: "Abort the request after this many milliseconds (default: 15000).",
});

const MaxResponseBytes = S.Int.pipe(S.positive(), S.lessThanOrEqualTo(5_000_000)).annotations({
  description: "Maximum response size in bytes before truncation (default: 1MB).",
});

export class HttpToolRequest extends S.Class<HttpToolRequest>($I`HttpToolRequest`)(
  {
    method: HttpMethod.annotations({
      description: "HTTP method to use (e.g., GET, POST, PUT).",
    }),
    url: BS.Url.annotations({
      description: "Absolute URL to request (must include protocol).",
    }),
    headers: S.optionalWith(S.Record({ key: S.String, value: S.String }), { as: "Option" }).annotations({
      description: "Optional HTTP headers (e.g., Authorization, Content-Type).",
    }),
    query: S.optionalWith(S.Record({ key: S.String, value: QueryValue }), { as: "Option" }).annotations({
      description: "Optional query parameters to merge into the URL.",
    }),
    body: S.optionalWith(HttpToolBody, { as: "Option" }).annotations({
      description: "Optional request body payload.",
    }),
    timeoutMs: S.optionalWith(TimeoutMs, { as: "Option" }).annotations({
      description: "Abort the request after this many milliseconds (default: 15000).",
    }),
    followRedirects: S.optionalWith(S.Boolean, { as: "Option" }).annotations({
      description: "Follow HTTP redirects automatically (default: true).",
    }),
    maxResponseBytes: S.optionalWith(MaxResponseBytes, { as: "Option" }).annotations({
      description: "Maximum response size in bytes before truncation (default: 1MB).",
    }),
    responseType: S.optionalWith(ResposneType, { as: "Option" }).annotations({
      description: "How to interpret the response body (default: json).",
    }),
  },
  $I.annotations("HttpToolRequest", {
    description: "HTTP request parameters for the HTTP tool.",
  })
) {}

export declare namespace HttpToolRequest {
  export type Type = typeof HttpToolRequest.Type;
}
