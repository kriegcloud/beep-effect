import type { PromiseTypes } from "@beep/types";
import { type JwtOptions, jwt } from "better-auth/plugins/jwt";
import * as Effect from "effect/Effect";
import type { JWTPayload } from "jose";

export const _jwt: (options?: JwtOptions | undefined) => ReturnType<typeof jwt> = (
  options?: JwtOptions | undefined
): JwtPlugin => {
  const jwksOpt = options?.jwks
    ? {
        ...(options.jwks.remoteUrl ? { remoteUrl: options.jwks.remoteUrl } : {}),
        ...(options.jwks.keyPairConfig ? { keyPairConfig: options.jwks.keyPairConfig } : {}),
        ...(options.jwks.disablePrivateKeyEncryption
          ? { disablePrivateKeyEncryption: options.jwks.disablePrivateKeyEncryption }
          : {}),
      }
    : {};
  const jwtOpt = options?.jwt
    ? {
        ...(options.jwt.issuer ? { issuer: options.jwt.issuer } : {}),
        ...(options.jwt.audience ? { audience: options.jwt.audience } : {}),
        ...(options.jwt.expirationTime ? { expirationTime: options.jwt.expirationTime } : {}),
        ...(options.jwt.definePayload ? { definePayload: options.jwt.definePayload } : {}),
        ...(options.jwt.getSubject ? { getSubject: options.jwt.getSubject } : {}),
        ...(options.jwt.sign
          ? ({ sign: options.jwt.sign } as {
              sign: (payload: JWTPayload) => PromiseTypes.Awaitable<string>;
            })
          : {}),
      }
    : {};

  const disableSettingsJwtHeaderOpt = options?.disableSettingJwtHeader
    ? {
        disableSettingJwtHeader: options.disableSettingJwtHeader,
      }
    : {};

  const schemaOpt = options?.schema
    ? {
        schema: options.schema,
      }
    : {};

  return jwt({
    ...jwtOpt,
    ...jwksOpt,
    ...disableSettingsJwtHeaderOpt,
    ...schemaOpt,
  });
};

export type JwtPluginEffect = Effect.Effect<ReturnType<typeof _jwt>, never, never>;
export type JwtPlugin = Effect.Effect.Success<JwtPluginEffect>;
export const jwtPlugin: JwtPluginEffect = Effect.succeed(_jwt());
