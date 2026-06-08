import { $BoxId } from "@beep/identity";
import { HttpMethod } from "@beep/schema/HttpMethod";
import { HttpStatus } from "@beep/schema/HttpStatus";
import * as Box from "box-node-sdk/box";
import * as BoxSchemas from "box-node-sdk/schemas"
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/Box.schemas");

export declare namespace SerializedData {
  export type Encoded =
    | undefined
    | null
    | boolean
    | number
    | string
    | SerializedDataList.Encoded
    | SerializedDataMap.Encoded;
}

export const SerializedData = S.Union([
  S.Undefined,
  S.Null,
  S.Boolean,
  S.Finite,
  S.String,
  S.suspend((): S.Codec<SerializedDataList.Encoded> => SerializedDataList),
  S.suspend((): S.Codec<SerializedDataMap.Encoded> => SerializedDataMap),
]).pipe(
  $I.annoteSchema("SerializedData", {
    description:
      "A schema for serializable data types used in the Box driver, including undefined, null, booleans, numbers, strings, lists, and maps.",
  })
);

export type SerializedData = typeof SerializedData.Type;

export declare namespace SerializedDataList {
  export type Encoded = readonly SerializedData.Encoded[];
}

export const SerializedDataList = S.Array(S.suspend((): S.Codec<SerializedData.Encoded> => SerializedData)).pipe(
  $I.annoteSchema("SerializedDataList", {
    description:
      "A schema for serializable data lists used in the Box driver, containing encoded serialized data elements.",
  })
);

export type SerializedDataList = typeof SerializedDataList.Type;

export declare namespace SerializedDataMap {
  export type Encoded = {
    readonly [key: string]: SerializedData.Encoded;
  };
}

export const SerializedDataMap = S.Record(
  S.String,
  S.suspend((): S.Codec<SerializedData.Encoded> => SerializedData)
).pipe(
  $I.annoteSchema("SerializedDataMap", {
    description:
      "A schema for serializable data maps used in the Box driver, mapping string keys to encoded serialized data values.",
  })
);

export type SerializedDataMap = typeof SerializedDataMap.Type;

export class RequestInfo extends S.Class<RequestInfo>($I`RequestInfo`)(
  {
    contentType: S.optionalKey(S.String),
    method: HttpMethod,
    url: S.URLFromString,
    queryParams: S.Record(S.String, S.String),
    headers: S.Record(S.String, S.String),
    body: S.optionalKey(S.Any),
  },
  $I.annote("RequestInfo", {
    description: "A schema for request information used in the Box driver, encapsulating details about API requests.",
  })
) {}

export class ResponseInfo extends S.Class<ResponseInfo>($I`ResponseInfo`)(
  {
    statusCode: HttpStatus,
    headers: S.Record(S.String, S.String),
    body: S.optionalKey(SerializedData),
    rawBody: S.optionalKey(S.String),
    code: S.optionalKey(S.String),
    contextInfo: S.optionalKey(S.Record(S.String, S.Any)),
    requestId: S.optionalKey(S.String),
    helpUrl: S.optionalKey(S.String),
  },
  $I.annote("ResponseInfo", {
    description: "A schema for response information used in the Box driver, encapsulating details about API responses.",
  })
) {}

export const BoxSdkError = S.instanceOf(Box.BoxSdkError).pipe(
  $I.annoteSchema("BoxSdkError", {
    description: "A schema for errors thrown by the Box SDK, encapsulating details about the error.",
  })
);

export type BoxSdkError = typeof BoxSdkError.Type;

export const BoxApiError = S.instanceOf(Box.BoxApiError).pipe(
  $I.annoteSchema("BoxApiError", {
    description: "A schema for errors returned by the Box API, encapsulating details about the error.",
  })
);

export type BoxApiError = typeof BoxApiError.Type;

export const AiAgentAsk = S.instanceOf(BoxSchemas.AiAgentAsk).pipe(
	$I.annoteSchema("AiAgentAsk", {
		description: "A schema for requests to AI agents, encapsulating details about the request.",
	})
)

