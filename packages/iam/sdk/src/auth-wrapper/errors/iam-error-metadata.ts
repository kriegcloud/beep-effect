import type { IamErrorMetadata } from "../../errors";

export interface AuthErrorMetadata extends IamErrorMetadata {}

export interface AuthErrorPayload {
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
    readonly status?: number;
    readonly statusText?: string;
    readonly cause?: unknown;
  };
  readonly data?: unknown;
}
