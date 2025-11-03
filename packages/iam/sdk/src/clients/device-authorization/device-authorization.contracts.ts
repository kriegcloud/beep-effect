import { Contract, ContractKit } from "@beep/contract";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

export class DeviceAuthorizationCodePayload extends BS.Class<DeviceAuthorizationCodePayload>(
  "DeviceAuthorizationCodePayload"
)(
  {
    client_id: S.String,
    scope: S.optional(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/device-authorization/DeviceAuthorizationCodePayload"),
    identifier: "DeviceAuthorizationCodePayload",
    title: "Device Authorization Code Payload",
    description: "Payload for initiating the device authorization flow.",
  }
) {}

export declare namespace DeviceAuthorizationCodePayload {
  export type Type = S.Schema.Type<typeof DeviceAuthorizationCodePayload>;
  export type Encoded = S.Schema.Encoded<typeof DeviceAuthorizationCodePayload>;
}

export class DeviceAuthorizationCodeSuccess extends BS.Class<DeviceAuthorizationCodeSuccess>(
  "DeviceAuthorizationCodeSuccess"
)(
  {
    device_code: S.String,
    user_code: S.String,
    verification_uri: S.String,
    verification_uri_complete: S.String,
    expires_in: S.Number,
    interval: S.Number,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/device-authorization/DeviceAuthorizationCodeSuccess"),
    identifier: "DeviceAuthorizationCodeSuccess",
    title: "Device Authorization Code Success",
    description: "Response data for a successful device authorization initiation.",
  }
) {}

export declare namespace DeviceAuthorizationCodeSuccess {
  export type Type = S.Schema.Type<typeof DeviceAuthorizationCodeSuccess>;
  export type Encoded = S.Schema.Encoded<typeof DeviceAuthorizationCodeSuccess>;
}

export class DeviceAuthorizationTokenPayload extends BS.Class<DeviceAuthorizationTokenPayload>(
  "DeviceAuthorizationTokenPayload"
)(
  {
    grant_type: S.Literal("urn:ietf:params:oauth:grant-type:device_code"),
    device_code: S.String,
    client_id: S.String,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/device-authorization/DeviceAuthorizationTokenPayload"),
    identifier: "DeviceAuthorizationTokenPayload",
    title: "Device Authorization Token Payload",
    description: "Payload for exchanging an approved device code for access tokens.",
  }
) {}

export declare namespace DeviceAuthorizationTokenPayload {
  export type Type = S.Schema.Type<typeof DeviceAuthorizationTokenPayload>;
  export type Encoded = S.Schema.Encoded<typeof DeviceAuthorizationTokenPayload>;
}

export class DeviceAuthorizationTokenSuccess extends BS.Class<DeviceAuthorizationTokenSuccess>(
  "DeviceAuthorizationTokenSuccess"
)(
  {
    access_token: S.Redacted(S.String),
    token_type: S.String,
    expires_in: S.Number,
    scope: S.String,
    refresh_token: S.optional(S.Redacted(S.String)),
    id_token: S.optional(S.Redacted(S.String)),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/device-authorization/DeviceAuthorizationTokenSuccess"),
    identifier: "DeviceAuthorizationTokenSuccess",
    title: "Device Authorization Token Success",
    description: "Tokens returned after completing the device authorization flow.",
  }
) {}

export declare namespace DeviceAuthorizationTokenSuccess {
  export type Type = S.Schema.Type<typeof DeviceAuthorizationTokenSuccess>;
  export type Encoded = S.Schema.Encoded<typeof DeviceAuthorizationTokenSuccess>;
}

export class DeviceAuthorizationStatusPayload extends BS.Class<DeviceAuthorizationStatusPayload>(
  "DeviceAuthorizationStatusPayload"
)(
  {
    user_code: S.String,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/device-authorization/DeviceAuthorizationStatusPayload"),
    identifier: "DeviceAuthorizationStatusPayload",
    title: "Device Authorization Status Payload",
    description: "Payload for querying the status of a device authorization request.",
  }
) {}

export declare namespace DeviceAuthorizationStatusPayload {
  export type Type = S.Schema.Type<typeof DeviceAuthorizationStatusPayload>;
  export type Encoded = S.Schema.Encoded<typeof DeviceAuthorizationStatusPayload>;
}

export const DeviceAuthorizationStatusEnum = S.Literal("pending", "approved", "denied");

export class DeviceAuthorizationStatusSuccess extends BS.Class<DeviceAuthorizationStatusSuccess>(
  "DeviceAuthorizationStatusSuccess"
)(
  {
    user_code: S.String,
    status: DeviceAuthorizationStatusEnum,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/device-authorization/DeviceAuthorizationStatusSuccess"),
    identifier: "DeviceAuthorizationStatusSuccess",
    title: "Device Authorization Status Success",
    description: "Response for querying the status of a device authorization request.",
  }
) {}

export declare namespace DeviceAuthorizationStatusSuccess {
  export type Type = S.Schema.Type<typeof DeviceAuthorizationStatusSuccess>;
  export type Encoded = S.Schema.Encoded<typeof DeviceAuthorizationStatusSuccess>;
}

export class DeviceAuthorizationDecisionPayload extends BS.Class<DeviceAuthorizationDecisionPayload>(
  "DeviceAuthorizationDecisionPayload"
)(
  {
    userCode: S.String,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/device-authorization/DeviceAuthorizationDecisionPayload"),
    identifier: "DeviceAuthorizationDecisionPayload",
    title: "Device Authorization Decision Payload",
    description: "Payload for approving or denying a device authorization request.",
  }
) {}

export declare namespace DeviceAuthorizationDecisionPayload {
  export type Type = S.Schema.Type<typeof DeviceAuthorizationDecisionPayload>;
  export type Encoded = S.Schema.Encoded<typeof DeviceAuthorizationDecisionPayload>;
}

export class DeviceAuthorizationDecisionSuccess extends BS.Class<DeviceAuthorizationDecisionSuccess>(
  "DeviceAuthorizationDecisionSuccess"
)(
  {
    success: S.Boolean,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/device-authorization/DeviceAuthorizationDecisionSuccess"),
    identifier: "DeviceAuthorizationDecisionSuccess",
    title: "Device Authorization Decision Success",
    description: "Indicates whether approving or denying the device request succeeded.",
  }
) {}

export declare namespace DeviceAuthorizationDecisionSuccess {
  export type Type = S.Schema.Type<typeof DeviceAuthorizationDecisionSuccess>;
  export type Encoded = S.Schema.Encoded<typeof DeviceAuthorizationDecisionSuccess>;
}

export const DeviceAuthorizationCodeContract = Contract.make("DeviceAuthorizationCode", {
  description: "Starts the OAuth2 device authorization flow.",
  payload: DeviceAuthorizationCodePayload.fields,
  failure: S.instanceOf(IamError),
  success: DeviceAuthorizationCodeSuccess,
});

export const DeviceAuthorizationTokenContract = Contract.make("DeviceAuthorizationToken", {
  description: "Exchanges an approved device code for access tokens.",
  payload: DeviceAuthorizationTokenPayload.fields,
  failure: S.instanceOf(IamError),
  success: DeviceAuthorizationTokenSuccess,
});

export const DeviceAuthorizationStatusContract = Contract.make("DeviceAuthorizationStatus", {
  description: "Retrieves the current status of a device authorization request.",
  payload: DeviceAuthorizationStatusPayload.fields,
  failure: S.instanceOf(IamError),
  success: DeviceAuthorizationStatusSuccess,
});

export const DeviceAuthorizationApproveContract = Contract.make("DeviceAuthorizationApprove", {
  description: "Approves a pending device authorization request.",
  payload: DeviceAuthorizationDecisionPayload.fields,
  failure: S.instanceOf(IamError),
  success: DeviceAuthorizationDecisionSuccess,
});

export const DeviceAuthorizationDenyContract = Contract.make("DeviceAuthorizationDeny", {
  description: "Denies a pending device authorization request.",
  payload: DeviceAuthorizationDecisionPayload.fields,
  failure: S.instanceOf(IamError),
  success: DeviceAuthorizationDecisionSuccess,
});

export const DeviceAuthorizationContractKit = ContractKit.make(
  DeviceAuthorizationCodeContract,
  DeviceAuthorizationTokenContract,
  DeviceAuthorizationStatusContract,
  DeviceAuthorizationApproveContract,
  DeviceAuthorizationDenyContract
);
