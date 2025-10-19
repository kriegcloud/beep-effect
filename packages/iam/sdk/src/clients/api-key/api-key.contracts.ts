import { Contract, ContractSet } from "@beep/iam-sdk/contract-kit";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

const NullableString = S.NullOr(S.String);
const NullableNumber = S.NullOr(S.Number);
const NullableDate = S.NullOr(BS.DateTimeFromDate());
const NullableUnknown = S.NullOr(S.Unknown);
const ApiKeyPermissionsRecord = S.Record({
  key: S.String,
  value: S.mutable(S.Array(S.String)),
});
const NullablePermissions = S.NullOr(ApiKeyPermissionsRecord);

const ApiKeyBaseFields = {
  id: IamEntityIds.ApiKeyId,
  name: NullableString,
  start: NullableString,
  prefix: NullableString,
  userId: SharedEntityIds.UserId,
  refillInterval: NullableNumber,
  refillAmount: NullableNumber,
  lastRefillAt: NullableDate,
  enabled: S.Boolean,
  rateLimitEnabled: S.Boolean,
  rateLimitTimeWindow: NullableNumber,
  rateLimitMax: NullableNumber,
  requestCount: S.Number,
  remaining: NullableNumber,
  lastRequest: NullableDate,
  expiresAt: NullableDate,
  createdAt: BS.DateTimeFromDate(),
  updatedAt: BS.DateTimeFromDate(),
  metadata: NullableUnknown,
  permissions: NullablePermissions,
};

export class ApiKeyView extends BS.Class<ApiKeyView>("ApiKeyView")(ApiKeyBaseFields, {
  schemaId: Symbol.for("@beep/iam-sdk/clients/api-key/ApiKeyView"),
  identifier: "ApiKeyView",
  title: "API Key View",
  description: "Represents an API key returned by Better Auth.",
}) {}

export declare namespace ApiKeyView {
  export type Type = S.Schema.Type<typeof ApiKeyView>;
  export type Encoded = S.Schema.Encoded<typeof ApiKeyView>;
}

export class ApiKeyCreateSuccess extends BS.Class<ApiKeyCreateSuccess>("ApiKeyCreateSuccess")(
  {
    key: S.String,
    ...ApiKeyBaseFields,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/api-key/ApiKeyCreateSuccess"),
    identifier: "ApiKeyCreateSuccess",
    title: "API Key Create Success",
    description: "Returned when an API key is created and includes the plaintext key.",
  }
) {}

export declare namespace ApiKeyCreateSuccess {
  export type Type = S.Schema.Type<typeof ApiKeyCreateSuccess>;
  export type Encoded = S.Schema.Encoded<typeof ApiKeyCreateSuccess>;
}

export class ApiKeyDeleteSuccess extends BS.Class<ApiKeyDeleteSuccess>("ApiKeyDeleteSuccess")(
  {
    success: S.Boolean,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/api-key/ApiKeyDeleteSuccess"),
    identifier: "ApiKeyDeleteSuccess",
    title: "API Key Delete Success",
    description: "Response indicating whether the API key deletion succeeded.",
  }
) {}

export declare namespace ApiKeyDeleteSuccess {
  export type Type = S.Schema.Type<typeof ApiKeyDeleteSuccess>;
  export type Encoded = S.Schema.Encoded<typeof ApiKeyDeleteSuccess>;
}

export class ApiKeyCreatePayload extends BS.Class<ApiKeyCreatePayload>("ApiKeyCreatePayload")(
  {
    name: S.optional(S.String),
    expiresIn: S.optional(S.NullOr(S.Number)),
    userId: S.optional(SharedEntityIds.UserId),
    prefix: S.optional(S.String),
    remaining: S.optional(S.NullOr(S.Number)),
    metadata: S.optional(NullableUnknown),
    refillAmount: S.optional(S.Number),
    refillInterval: S.optional(S.Number),
    rateLimitTimeWindow: S.optional(S.Number),
    rateLimitMax: S.optional(S.Number),
    rateLimitEnabled: S.optional(S.Boolean),
    permissions: S.optional(ApiKeyPermissionsRecord),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/api-key/ApiKeyCreatePayload"),
    identifier: "ApiKeyCreatePayload",
    title: "API Key Create Payload",
    description: "Payload for creating a new API key.",
  }
) {}

export declare namespace ApiKeyCreatePayload {
  export type Type = S.Schema.Type<typeof ApiKeyCreatePayload>;
  export type Encoded = S.Schema.Encoded<typeof ApiKeyCreatePayload>;
}

export class ApiKeyUpdatePayload extends BS.Class<ApiKeyUpdatePayload>("ApiKeyUpdatePayload")(
  {
    keyId: IamEntityIds.ApiKeyId,
    userId: S.optional(SharedEntityIds.UserId),
    name: S.optional(S.String),
    enabled: S.optional(S.Boolean),
    remaining: S.optional(S.Number),
    refillAmount: S.optional(S.Number),
    refillInterval: S.optional(S.Number),
    metadata: S.optional(NullableUnknown),
    expiresIn: S.optional(S.NullOr(S.Number)),
    rateLimitEnabled: S.optional(S.Boolean),
    rateLimitTimeWindow: S.optional(S.Number),
    rateLimitMax: S.optional(S.Number),
    permissions: S.optional(S.NullOr(ApiKeyPermissionsRecord)),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/api-key/ApiKeyUpdatePayload"),
    identifier: "ApiKeyUpdatePayload",
    title: "API Key Update Payload",
    description: "Payload for updating an existing API key.",
  }
) {}

export declare namespace ApiKeyUpdatePayload {
  export type Type = S.Schema.Type<typeof ApiKeyUpdatePayload>;
  export type Encoded = S.Schema.Encoded<typeof ApiKeyUpdatePayload>;
}

export class ApiKeyDeletePayload extends BS.Class<ApiKeyDeletePayload>("ApiKeyDeletePayload")(
  {
    keyId: IamEntityIds.ApiKeyId,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/api-key/ApiKeyDeletePayload"),
    identifier: "ApiKeyDeletePayload",
    title: "API Key Delete Payload",
    description: "Payload for deleting an API key.",
  }
) {}

export declare namespace ApiKeyDeletePayload {
  export type Type = S.Schema.Type<typeof ApiKeyDeletePayload>;
  export type Encoded = S.Schema.Encoded<typeof ApiKeyDeletePayload>;
}

export class ApiKeyGetPayload extends BS.Class<ApiKeyGetPayload>("ApiKeyGetPayload")(
  {
    id: IamEntityIds.ApiKeyId,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/api-key/ApiKeyGetPayload"),
    identifier: "ApiKeyGetPayload",
    title: "API Key Get Payload",
    description: "Payload for retrieving a specific API key.",
  }
) {}

export declare namespace ApiKeyGetPayload {
  export type Type = S.Schema.Type<typeof ApiKeyGetPayload>;
  export type Encoded = S.Schema.Encoded<typeof ApiKeyGetPayload>;
}

export const ApiKeyCreateContract = Contract.make("ApiKeyCreate", {
  description: "Creates a new API key with optional metadata and rate limit controls.",
  parameters: ApiKeyCreatePayload.fields,
  failure: S.instanceOf(IamError),
  success: ApiKeyCreateSuccess,
});

export const ApiKeyGetContract = Contract.make("ApiKeyGet", {
  description: "Retrieves an API key owned by the authenticated user.",
  parameters: ApiKeyGetPayload.fields,
  failure: S.instanceOf(IamError),
  success: ApiKeyView,
});

export const ApiKeyUpdateContract = Contract.make("ApiKeyUpdate", {
  description: "Updates attributes of an existing API key.",
  parameters: ApiKeyUpdatePayload.fields,
  failure: S.instanceOf(IamError),
  success: ApiKeyView,
});

export const ApiKeyDeleteContract = Contract.make("ApiKeyDelete", {
  description: "Deletes an API key by identifier.",
  parameters: ApiKeyDeletePayload.fields,
  failure: S.instanceOf(IamError),
  success: ApiKeyDeleteSuccess,
});

export const ApiKeyListContract = Contract.make("ApiKeyList", {
  description: "Lists all API keys for the authenticated user.",
  parameters: {},
  failure: S.instanceOf(IamError),
  success: S.Array(ApiKeyView),
});

export const ApiKeyContractSet = ContractSet.make(
  ApiKeyCreateContract,
  ApiKeyGetContract,
  ApiKeyUpdateContract,
  ApiKeyDeleteContract,
  ApiKeyListContract
);
