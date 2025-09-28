import { IamError } from "../../errors";

import type { BetterAuthErrorMetadata, BetterAuthErrorPayload } from "./iam-error-metadata";

export interface NormalizeErrorParams extends BetterAuthErrorMetadata {
  readonly defaultMessage?: string;
}

export const normalizeBetterAuthError = (
  payload: BetterAuthErrorPayload | null,
  params: NormalizeErrorParams
): IamError => {
  const { defaultMessage, ...metadata } = params;

  const betterAuthError = payload?.error;
  const message = betterAuthError?.message ?? defaultMessage ?? "Better Auth handler failed";

  const iamMetadata: BetterAuthErrorMetadata = {
    ...metadata,
    code: betterAuthError?.code ?? metadata.code,
    status: betterAuthError?.status ?? metadata.status,
    statusText: betterAuthError?.statusText ?? metadata.statusText,
    betterAuthCause: betterAuthError?.cause ?? metadata.betterAuthCause,
  };

  const cause = betterAuthError?.cause ?? betterAuthError ?? payload ?? metadata.betterAuthCause ?? {};

  return new IamError(cause, message, iamMetadata);
};
