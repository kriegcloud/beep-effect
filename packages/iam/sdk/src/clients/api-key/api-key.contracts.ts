import { ApiKey } from "@beep/iam-domain/entities";
import { Contract, ContractKit } from "@beep/iam-sdk/contract-kit";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

export class ApiKeyView extends BS.Class<ApiKeyView>("ApiKeyView")(
  ApiKey.Model.select.pick(
    "id",
    "name",
    "start",
    "prefix",
    "userId",
    "organizationId",
    "refillInterval",
    "refillAmount",
    "lastRefillAt",
    "enabled",
    "rateLimitEnabled",
    "rateLimitTimeWindow",
    "rateLimitMax",
    "requestCount",
    "remaining",
    "lastRequest",
    "expiresAt",
    "createdAt",
    "updatedAt",
    "metadata",
    "permissions"
  ),
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/api-key/ApiKeyView"),
    identifier: "ApiKeyView",
    title: "API Key View",
    description: "Represents an API key returned by Better Auth.",
  }
) {}

export declare namespace ApiKeyView {
  export type Type = S.Schema.Type<typeof ApiKeyView>;
  export type Encoded = S.Schema.Encoded<typeof ApiKeyView>;
}

export class ApiKeyCreateSuccess extends BS.Class<ApiKeyCreateSuccess>("ApiKeyCreateSuccess")(
  S.Struct({
    key: S.Redacted(S.String),
    ...ApiKey.Model.select.pick(
      "id",
      "name",
      "start",
      "prefix",
      "userId",
      "organizationId",
      "refillInterval",
      "refillAmount",
      "lastRefillAt",
      "enabled",
      "rateLimitEnabled",
      "rateLimitTimeWindow",
      "rateLimitMax",
      "requestCount",
      "remaining",
      "lastRequest",
      "expiresAt",
      "createdAt",
      "updatedAt",
      "metadata",
      "permissions"
    ).fields,
  }),
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
  S.Struct({
    ...ApiKey.Model.insert.pick(
      "name",
      "userId",
      "prefix",
      "remaining",
      "metadata",
      "refillAmount",
      "refillInterval",
      "rateLimitTimeWindow",
      "rateLimitMax",
      "rateLimitEnabled",
      "permissions",
      "organizationId"
    ).fields,
    expiresIn: S.optional(S.NullOr(BS.DurationFromSeconds)),
  }),
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
  S.Struct({
    keyId: IamEntityIds.ApiKeyId,
    ...ApiKey.Model.update.pick(
      "userId",
      "name",
      "enabled",
      "remaining",
      "refillAmount",
      "refillInterval",
      "metadata",
      "rateLimitEnabled",
      "rateLimitTimeWindow",
      "rateLimitMax",
      "permissions",
      "organizationId"
    ).fields,
    expiresIn: S.optional(S.NullOr(BS.DurationFromSeconds)),
  }),
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

export const ApiKeyContractKit = ContractKit.make(
  ApiKeyCreateContract,
  ApiKeyGetContract,
  ApiKeyUpdateContract,
  ApiKeyDeleteContract,
  ApiKeyListContract
);
