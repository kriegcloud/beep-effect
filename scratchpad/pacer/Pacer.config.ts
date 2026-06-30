/**
 * Typed configuration + base URLs for the PACER POC.
 *
 * Secrets are read through {@link effect/Config} (never `process.env` directly),
 * so the live runner can resolve 1Password `op://` refs via `op run`. The mock
 * runner uses {@link mockPacerConfig} and reads no secrets at all.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $ScratchpadId } from "@beep/identity";
import { SchemaUtils } from "@beep/schema";
import { Config, Effect, Redacted } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { PacerConfigError } from "./Pacer.errors.ts";
import { PacerEnvironment } from "./Pacer.tokens.ts";

const $I = $ScratchpadId.create("pacer/pcl/Pacer.config");

/**
 * PACER Authentication API host per environment.
 *
 * @category configuration
 * @since 0.0.0
 */
export const PACER_AUTH_BASE_URL = {
  qa: "https://qa-login.uscourts.gov",
  prod: "https://pacer.login.uscourts.gov",
} as const;

/**
 * PACER Case Locator (PCL) API host per environment.
 *
 * @category configuration
 * @since 0.0.0
 */
export const PACER_PCL_BASE_URL = {
  qa: "https://qa-pcl.uscourts.gov",
  prod: "https://pcl.uscourts.gov",
} as const;

/**
 * Environment variable names the live runner reads. The `op run --env-file`
 * mapping binds each of these to its `op://BEEP_SECRETS/...` ref (see README).
 *
 * @category configuration
 * @since 0.0.0
 */
export const PACER_ENV = {
  username: "LEGAL_QA_PACER_USERNAME",
  password: "LEGAL_QA_PACER_PASSWORD",
  clientCode: "LEGAL_QA_PACER_CLIENT_CODE",
  otp: "PACER_OTP",
} as const;

/**
 * Resolved PACER configuration consumed by the auth + PCL services.
 *
 * @category configuration
 * @since 0.0.0
 */

export class PacerConfigBase extends S.Class<PacerConfigBase>($I`PacerConfigBase`)(
	{
		authBaseUrl: S.String,
		pclBaseUrl: S.String,
		loginId: S.Redacted(S.String),
		password: S.Redacted(S.String),
		clientCode: S.Option(S.String),
		otpCode: S.String.pipe(S.Redacted, S.Option),
		isFiler: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
	},
	$I.annote("PacerConfigBase", {
		description: "Base PACER configuration consumed by the auth + PCL services"
	})
) {}

export class PacerConfigQA extends PacerConfigBase.extend<PacerConfigQA>($I`PacerConfigQA`)(
	{
		environment: S.tag(PacerEnvironment.Enum.qa)
	},
	$I.annote("PacerConfigQA", {
		description: "QA PACER configuration consumed by the auth + PCL services"
	})
) {}

export class PacerConfigProd extends PacerConfigBase.extend<PacerConfigProd>($I`PacerConfigProd`)(
	{
		environment: S.tag(PacerEnvironment.Enum.prod)
	},
	$I.annote("PacerConfigProd", {
		description: "Production PACER configuration consumed by the auth + PCL services"
	})
) {}

/**
 * Resolved PACER configuration consumed by the auth + PCL services.
 *
 * @category configuration
 * @since 0.0.0
 */
export const PacerConfig = S.Union(
	[
		PacerConfigQA,
		PacerConfigProd
	]
).pipe(
	S.toTaggedUnion("environment"),
	$I.annoteSchema("PacerConfig", {
		description: "PACER configuration consumed by the auth + PCL services"
	})
)

export type PacerConfig = typeof PacerConfig.Type;

/**
 * Load PACER configuration from the environment (secrets via {@link effect/Config}).
 *
 * `otpCode` is sourced from the explicit `options.otpCode` when present (the
 * live runner passes the freshly-typed code), otherwise from the `PACER_OTP`
 * env var, otherwise `none`.
 *
 * @category configuration
 * @since 0.0.0
 */
export const loadPacerConfig = (options: {
  readonly environment: PacerEnvironment;
  readonly otpCode?: O.Option<Redacted.Redacted<string>>;
}): Effect.Effect<PacerConfig, PacerConfigError> =>
  Effect.gen(function* () {
    const loginId = yield* Config.redacted(PACER_ENV.username);
    const password = yield* Config.redacted(PACER_ENV.password);
    const clientCode = yield* Config.string(PACER_ENV.clientCode).pipe(Config.option);
    const otpFromEnv = yield* Config.redacted(PACER_ENV.otp).pipe(Config.option);
    return PacerConfig.make({
	    environment: options.environment,
	    authBaseUrl: PACER_AUTH_BASE_URL[options.environment],
	    pclBaseUrl: PACER_PCL_BASE_URL[options.environment],
	    loginId,
	    password,
	    clientCode,
	    // `??` would keep an explicit O.none() (it is a truthy object); fall back to
	    // the PACER_OTP env value only when no OTP was explicitly provided.
	    otpCode: O.orElse(options.otpCode ?? O.none<Redacted.Redacted<string>>(), () => otpFromEnv),
    });
  }).pipe(Effect.mapError((cause) => PacerConfigError.make_(String(cause))));

/**
 * A placeholder configuration for the deterministic mock runner. Reads no
 * secrets; the credential values are never sent anywhere real.
 *
 * @category configuration
 * @since 0.0.0
 */
export const mockPacerConfig = (overrides: Partial<PacerConfig> = {}): PacerConfig => PacerConfigQA.make({
	authBaseUrl: PACER_AUTH_BASE_URL.qa,
	pclBaseUrl: PACER_PCL_BASE_URL.qa,
	loginId: Redacted.make("mock-login-id"),
	password: Redacted.make("mock-password"),
	clientCode: O.some("MOCK-CLIENT-CODE"),
	otpCode: O.none(),
	...overrides,
	environment: "qa",
})
