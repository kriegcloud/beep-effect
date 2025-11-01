import type { ApiKeyDeletePayload, OrganizationUpdatePayload, PasskeyDeletePayload } from "@beep/iam-sdk";

type MutateFn<T = Record<string, unknown>> = (params: T) => Promise<unknown> | Promise<void>;

export interface AuthMutators {
  readonly deleteApiKey: MutateFn<ApiKeyDeletePayload.Type>;
  readonly deletePasskey: MutateFn<PasskeyDeletePayload.Type>;
  readonly revokeDeviceSession: MutateFn<{ readonly sessionToken: string }>;
  readonly revokeSession: MutateFn<{ readonly token: string }>;
  readonly setActiveSession: MutateFn<{ readonly sessionToken: string }>;
  readonly updateOrganization: MutateFn<OrganizationUpdatePayload.Type>;
  readonly updateUser: MutateFn;
  readonly unlinkAccount: MutateFn<{ readonly providerId: string; readonly accountId?: undefined | string }>;
}
