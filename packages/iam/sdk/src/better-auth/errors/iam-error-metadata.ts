import type { IamErrorMetadata } from "../../errors";

export interface BetterAuthErrorMetadata extends IamErrorMetadata {}

export interface BetterAuthErrorPayload {
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
    readonly status?: number;
    readonly statusText?: string;
    readonly cause?: unknown;
  };
  readonly data?: unknown;
}
