import { IamError } from "../../errors";

import type { AuthErrorMetadata, AuthErrorPayload } from "./iam-error-metadata";

export interface NormalizeErrorParams extends AuthErrorMetadata {
  readonly defaultMessage?: string;
}

export const normalizeAuthError = (payload: AuthErrorPayload | null, params: NormalizeErrorParams): IamError => {
  const { defaultMessage, ...metadata } = params;

  const authError = payload?.error;
  const message = authError?.message ?? defaultMessage ?? "Auth handler failed";

  const iamMetadata: AuthErrorMetadata = {
    ...metadata,
    code: authError?.code ?? metadata.code,
    status: authError?.status ?? metadata.status,
    statusText: authError?.statusText ?? metadata.statusText,
    authCause: authError?.cause ?? metadata.authCause,
  };

  const cause = authError?.cause ?? authError ?? payload ?? metadata.authCause ?? {};

  return new IamError(cause, message, iamMetadata);
};
