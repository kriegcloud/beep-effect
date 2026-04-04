/**
 * Secret reference and provider configuration models for `@beep/clawhole`.
 *
 * This module keeps the legacy helper surface for secret refs while rewriting
 * the underlying models to the repository's schema-first conventions.
 *
 * @module @beep/clawhole/config/Secrets
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import {
  ArrayOfStrings,
  FilePath,
  LiteralKit,
  NonEmptyTrimmedStr,
  NonNegativeInt,
  TaggedErrorClass,
} from "@beep/schema";
import { thunkNull } from "@beep/utils";
import { Effect, pipe, Tuple } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $ClawholeId.create("config/Secrets");

const strictParseOptions = { onExcessProperty: "error" } as const;

/**
 * Default provider alias used when a secret ref does not specify one.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const DEFAULT_SECRET_PROVIDER_ALIAS = "default"; // pragma: allowlist secret

/**
 * Regular expression for `${ENV_VAR}` env secret ref identifiers.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ENV_SECRET_REF_ID_RE = /^[A-Z][A-Z0-9_]{0,127}$/;

const ENV_SECRET_TEMPLATE_RE = /^\$\{([A-Z][A-Z0-9_]{0,127})\}$/;

const SecretProviderAlias = NonEmptyTrimmedStr.pipe(
  S.brand("SecretProviderAlias"),
  $I.annoteSchema("SecretProviderAlias", {
    description: "A non-empty provider alias used to select a configured secret provider.",
  })
);

type SecretProviderAlias = typeof SecretProviderAlias.Type;

const DefaultSecretProviderAlias: SecretProviderAlias = SecretProviderAlias.makeUnsafe(DEFAULT_SECRET_PROVIDER_ALIAS);

const EnvSecretRefId = S.Trim.check(S.isPattern(ENV_SECRET_REF_ID_RE)).pipe(
  S.brand("EnvSecretRefId"),
  $I.annoteSchema("EnvSecretRefId", {
    description: "An uppercase environment variable identifier used by env secret references.",
  })
);

type EnvSecretRefId = typeof EnvSecretRefId.Type;

const SecretLocatorId = NonEmptyTrimmedStr.pipe(
  S.brand("SecretLocatorId"),
  $I.annoteSchema("SecretLocatorId", {
    description: "A non-empty trimmed locator string for file and exec secret references.",
  })
);

type SecretLocatorId = typeof SecretLocatorId.Type;

const SecretInputString = NonEmptyTrimmedStr.pipe(
  $I.annoteSchema("SecretInputString", {
    description: "A non-empty trimmed inline secret input string.",
  })
);

/**
 * Supported secret reference sources.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const SecretRefSource = LiteralKit(["env", "file", "exec"]).pipe(
  $I.annoteSchema("SecretRefSource", {
    description: "Supported sources used to resolve secret references.",
  })
);

/**
 * Type of {@link SecretRefSource}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type SecretRefSource = typeof SecretRefSource.Type;

class EnvSecretRef extends S.Class<EnvSecretRef>($I`EnvSecretRef`)(
  {
    source: S.tag("env").annotateKey({
      description: "Discriminator for environment-variable secret references.",
    }),
    provider: SecretProviderAlias.annotateKey({
      description: "Configured provider alias for the env secret source.",
    }),
    id: EnvSecretRefId.annotateKey({
      description: "Environment variable name to read from the selected provider.",
    }),
  },
  $I.annote("EnvSecretRef", {
    description: "Stable identifier for a secret resolved from an environment variable provider.",
  })
) {}

class FileSecretRef extends S.Class<FileSecretRef>($I`FileSecretRef`)(
  {
    source: S.tag("file").annotateKey({
      description: "Discriminator for file-backed secret references.",
    }),
    provider: SecretProviderAlias.annotateKey({
      description: "Configured provider alias for the file secret source.",
    }),
    id: SecretLocatorId.annotateKey({
      description: "Logical locator within the configured file-backed provider.",
    }),
  },
  $I.annote("FileSecretRef", {
    description: "Stable identifier for a secret resolved from a file-backed provider.",
  })
) {}

class ExecSecretRef extends S.Class<ExecSecretRef>($I`ExecSecretRef`)(
  {
    source: S.tag("exec").annotateKey({
      description: "Discriminator for executable-backed secret references.",
    }),
    provider: SecretProviderAlias.annotateKey({
      description: "Configured provider alias for the exec secret source.",
    }),
    id: SecretLocatorId.annotateKey({
      description: "Logical locator passed to the configured exec-backed provider.",
    }),
  },
  $I.annote("ExecSecretRef", {
    description: "Stable identifier for a secret resolved from an executable-backed provider.",
  })
) {}

/**
 * Stable identifier for a secret in a configured source.
 *
 * Examples:
 * - env source: provider `default`, id `OPENAI_API_KEY`
 * - file source: provider `mounted-json`, id `/providers/openai/apiKey`
 * - exec source: provider `vault`, id `openai/api-key`
 *
 * @category Configuration
 * @since 0.0.0
 */
export const SecretRef = SecretRefSource.mapMembers(
  Tuple.evolve([() => EnvSecretRef, () => FileSecretRef, () => ExecSecretRef])
).pipe(
  S.toTaggedUnion("source"),
  $I.annoteSchema("SecretRef", {
    description:
      "Stable identifier for a secret in a configured source, including the source, provider alias, and source-specific id.",
  })
);

/**
 * Type of {@link SecretRef}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type SecretRef = typeof SecretRef.Type;

class LegacyEnvSecretRefWithoutProvider extends S.Class<LegacyEnvSecretRefWithoutProvider>(
  $I`LegacyEnvSecretRefWithoutProvider`
)(
  {
    source: S.tag("env"),
    id: EnvSecretRefId,
  },
  $I.annote("LegacyEnvSecretRefWithoutProvider", {
    description: "Legacy env secret ref payload without an explicit provider alias.",
  })
) {}

class LegacyFileSecretRefWithoutProvider extends S.Class<LegacyFileSecretRefWithoutProvider>(
  $I`LegacyFileSecretRefWithoutProvider`
)(
  {
    source: S.tag("file"),
    id: SecretLocatorId,
  },
  $I.annote("LegacyFileSecretRefWithoutProvider", {
    description: "Legacy file secret ref payload without an explicit provider alias.",
  })
) {}

class LegacyExecSecretRefWithoutProvider extends S.Class<LegacyExecSecretRefWithoutProvider>(
  $I`LegacyExecSecretRefWithoutProvider`
)(
  {
    source: S.tag("exec"),
    id: SecretLocatorId,
  },
  $I.annote("LegacyExecSecretRefWithoutProvider", {
    description: "Legacy exec secret ref payload without an explicit provider alias.",
  })
) {}

const LegacySecretRefWithoutProvider = SecretRefSource.mapMembers(
  Tuple.evolve([
    () => LegacyEnvSecretRefWithoutProvider,
    () => LegacyFileSecretRefWithoutProvider,
    () => LegacyExecSecretRefWithoutProvider,
  ])
).pipe(
  S.toTaggedUnion("source"),
  $I.annoteSchema("LegacySecretRefWithoutProvider", {
    description: "Legacy secret ref payloads that rely on per-source default provider aliases.",
  })
);

type LegacySecretRefWithoutProvider = typeof LegacySecretRefWithoutProvider.Type;

const EnvSecretRefIdArray = S.Array(EnvSecretRefId).pipe(
  $I.annoteSchema("EnvSecretRefIdArray", {
    description: "An array of environment variable identifiers.",
  })
);

const ExecEnvironmentRecord = S.Record(S.String, S.String).pipe(
  $I.annoteSchema("ExecEnvironmentRecord", {
    description: "A record of environment variables passed to an exec secret provider.",
  })
);

const ProvidersRecord = S.Record(
  SecretProviderAlias,
  S.suspend(() => SecretProviderConfig)
).pipe(
  $I.annoteSchema("ProvidersRecord", {
    description: "Configured secret providers keyed by provider alias.",
  })
);

/**
 * A secret input value, either inline plaintext or a secret reference.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const SecretInput = S.Union([S.String, SecretRef]).pipe(
  $I.annoteSchema("SecretInput", {
    description: "Either a literal inline secret string or a structured secret reference.",
  })
);

/**
 * Type of {@link SecretInput}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type SecretInput = typeof SecretInput.Type;

class SecretDefaults extends S.Class<SecretDefaults>($I`SecretDefaults`)(
  {
    env: S.OptionFromOptionalKey(SecretProviderAlias).annotateKey({
      description: "Default provider alias for env secret refs that omit a provider.",
    }),
    file: S.OptionFromOptionalKey(SecretProviderAlias).annotateKey({
      description: "Default provider alias for file secret refs that omit a provider.",
    }),
    exec: S.OptionFromOptionalKey(SecretProviderAlias).annotateKey({
      description: "Default provider alias for exec secret refs that omit a provider.",
    }),
  },
  $I.annote("SecretDefaults", {
    description: "Per-source default provider aliases used to upgrade legacy secret refs.",
  })
) {}

class SecretResolutionConfig extends S.Class<SecretResolutionConfig>($I`SecretResolutionConfig`)(
  {
    maxProviderConcurrency: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Maximum number of providers that may resolve secrets concurrently.",
    }),
    maxRefsPerProvider: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Maximum number of secret refs resolved per provider batch.",
    }),
    maxBatchBytes: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Maximum combined payload size for a secret resolution batch.",
    }),
  },
  $I.annote("SecretResolutionConfig", {
    description: "Concurrency and payload limits for secret resolution.",
  })
) {}

/**
 * Raised when a caller tries to read a secret input that is still a secret ref.
 *
 * @category Errors
 * @since 0.0.0
 */
export class UnresolvedSecretRefError extends TaggedErrorClass<UnresolvedSecretRefError>($I`UnresolvedSecretRefError`)(
  "UnresolvedSecretRefError",
  {
    path: S.String,
    ref: SecretRef,
    message: S.String,
  },
  $I.annote("UnresolvedSecretRefError", {
    description: "Thrown when a secret input still points at an unresolved secret reference.",
  })
) {}

/**
 * Env-backed secret provider configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class EnvSecretProviderConfig extends S.Class<EnvSecretProviderConfig>($I`EnvSecretProviderConfig`)(
  {
    source: S.tag("env").annotateKey({
      description: "Discriminator for environment-variable secret providers.",
    }),
    allowlist: S.OptionFromOptionalKey(EnvSecretRefIdArray).annotateKey({
      description: "Optional exact env-var allowlist enforced by the provider.",
    }),
  },
  $I.annote("EnvSecretProviderConfig", {
    description: "Configuration for a provider that resolves secrets from environment variables.",
  })
) {}

/**
 * Supported file-backed provider read modes.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const FileSecretProviderMode = LiteralKit(["singleValue", "json"]).pipe(
  $I.annoteSchema("FileSecretProviderMode", {
    description: "Supported file-backed secret provider read modes.",
  })
);

/**
 * Type of {@link FileSecretProviderMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type FileSecretProviderMode = typeof FileSecretProviderMode.Type;

/**
 * File-backed secret provider configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class FileSecretProviderConfig extends S.Class<FileSecretProviderConfig>($I`FileSecretProviderConfig`)(
  {
    source: S.tag("file").annotateKey({
      description: "Discriminator for file-backed secret providers.",
    }),
    path: FilePath.annotateKey({
      description: "Filesystem path read by the provider.",
    }),
    mode: S.OptionFromOptionalKey(FileSecretProviderMode).annotateKey({
      description: "How file contents should be interpreted when reading secrets.",
    }),
    timeoutMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Optional read timeout in milliseconds.",
    }),
    maxBytes: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Optional maximum number of bytes to read from the backing file.",
    }),
  },
  $I.annote("FileSecretProviderConfig", {
    description: "Configuration for a provider that resolves secrets from a file.",
  })
) {}

/**
 * Exec-backed secret provider configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class ExecSecretProviderConfig extends S.Class<ExecSecretProviderConfig>($I`ExecSecretProviderConfig`)(
  {
    source: S.tag("exec").annotateKey({
      description: "Discriminator for executable-backed secret providers.",
    }),
    command: NonEmptyTrimmedStr.annotateKey({
      description: "Executable path or command name used to resolve secrets.",
    }),
    args: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Optional argument list passed to the secret resolution command.",
    }),
    timeoutMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Optional total execution timeout in milliseconds.",
    }),
    noOutputTimeoutMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Optional timeout in milliseconds when the command stops producing output.",
    }),
    maxOutputBytes: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Optional maximum number of output bytes accepted from the command.",
    }),
    jsonOnly: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the command output must be valid JSON.",
    }),
    env: S.OptionFromOptionalKey(ExecEnvironmentRecord).annotateKey({
      description: "Optional environment variables set for the exec provider process.",
    }),
    passEnv: S.OptionFromOptionalKey(EnvSecretRefIdArray).annotateKey({
      description: "Optional environment variable names inherited from the parent process.",
    }),
    trustedDirs: FilePath.pipe(S.Array, S.OptionFromOptionalKey).annotateKey({
      description: "Optional directories trusted for resolving executable paths.",
    }),
    allowInsecurePath: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether non-trusted executable lookup paths are allowed.",
    }),
    allowSymlinkCommand: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the command may resolve through a symlink.",
    }),
  },
  $I.annote("ExecSecretProviderConfig", {
    description: "Configuration for a provider that resolves secrets by executing a command.",
  })
) {}

/**
 * Tagged union of supported provider configuration variants.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const SecretProviderConfig = SecretRefSource.mapMembers(
  Tuple.evolve([() => EnvSecretProviderConfig, () => FileSecretProviderConfig, () => ExecSecretProviderConfig])
).pipe(
  S.toTaggedUnion("source"),
  $I.annoteSchema("SecretProviderConfig", {
    description: "Tagged union of supported secret provider configuration variants.",
  })
);

/**
 * Type of {@link SecretProviderConfig}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type SecretProviderConfig = typeof SecretProviderConfig.Type;

/**
 * Top-level secret resolution configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SecretsConfig extends S.Class<SecretsConfig>($I`SecretsConfig`)(
  {
    providers: S.OptionFromOptionalKey(ProvidersRecord).annotateKey({
      description: "Configured providers keyed by provider alias.",
    }),
    defaults: S.OptionFromOptionalKey(SecretDefaults).annotateKey({
      description: "Per-source provider alias defaults used for legacy secret refs.",
    }),
    resolution: S.OptionFromOptionalKey(SecretResolutionConfig).annotateKey({
      description: "Concurrency and payload limits applied while resolving secret refs.",
    }),
  },
  $I.annote("SecretsConfig", {
    description: "Top-level configuration for secret providers, defaults, and resolution limits.",
  })
) {}

type SecretInputRefResolution = {
  readonly explicitRef: SecretRef | null;
  readonly inlineRef: SecretRef | null;
  readonly ref: SecretRef | null;
};

type SecretDefaultsInput = {
  readonly env?: unknown;
  readonly file?: unknown;
  readonly exec?: unknown;
};

type ResolveSecretInputRefParams = {
  readonly value: unknown;
  readonly refValue?: unknown;
  readonly defaults?: SecretDefaultsInput;
};

type ResolvedSecretInputParams = ResolveSecretInputRefParams & {
  readonly path: string;
};

const decodeSecretRefOption = S.decodeUnknownOption(SecretRef);
const decodeLegacySecretRefWithoutProviderOption = S.decodeUnknownOption(LegacySecretRefWithoutProvider);
const decodeSecretProviderAliasOption = S.decodeUnknownOption(SecretProviderAlias);
const decodeEnvSecretRefIdOption = S.decodeUnknownOption(EnvSecretRefId);
const decodeSecretInputStringOption = S.decodeUnknownOption(SecretInputString);

const normalizeSecretProviderAlias = (value: unknown): SecretProviderAlias =>
  pipe(
    decodeSecretProviderAliasOption(value),
    O.getOrElse(() => DefaultSecretProviderAlias)
  );

const normalizeSecretProviderAliasInput = (value: unknown): SecretProviderAlias => {
  if (O.isOption(value)) {
    return pipe(
      value,
      O.map(normalizeSecretProviderAlias),
      O.getOrElse(() => DefaultSecretProviderAlias)
    );
  }

  return normalizeSecretProviderAlias(value);
};

const defaultProviderAliasForSource = (source: SecretRefSource, defaults?: SecretDefaultsInput): SecretProviderAlias =>
  SecretRefSource.$match(source, {
    env: () => normalizeSecretProviderAliasInput(defaults?.env),
    file: () => normalizeSecretProviderAliasInput(defaults?.file),
    exec: () => normalizeSecretProviderAliasInput(defaults?.exec),
  });

const makeEnvSecretRef = (provider: SecretProviderAlias, id: EnvSecretRefId): SecretRef =>
  new EnvSecretRef({ source: "env", provider, id });

const makeFileSecretRef = (provider: SecretProviderAlias, id: SecretLocatorId): SecretRef =>
  new FileSecretRef({ source: "file", provider, id });

const makeExecSecretRef = (provider: SecretProviderAlias, id: SecretLocatorId): SecretRef =>
  new ExecSecretRef({ source: "exec", provider, id });

const formatSecretRefLabel = (ref: SecretRef): string => `${ref.source}:${ref.provider}:${ref.id}`;

/**
 * Check whether a value is a valid env secret ref identifier.
 *
 * @param value {unknown} - The value to validate as an env secret ref id.
 * @returns {boolean} - `true` when the value is a valid uppercase env secret ref id.
 * @category Validation
 * @since 0.0.0
 */
export const isValidEnvSecretRefId = (value: unknown): value is EnvSecretRefId => S.is(EnvSecretRefId)(value);

/**
 * Check whether a value is a strict `SecretRef`.
 *
 * Excess properties are rejected so the helper preserves the legacy guard
 * behavior while still relying on schema decoding.
 *
 * @param value {unknown} - The value to validate as a secret ref.
 * @returns {boolean} - `true` when the value decodes as a strict `SecretRef`.
 * @category Validation
 * @since 0.0.0
 */
export const isSecretRef = (value: unknown): value is SecretRef =>
  O.isSome(decodeSecretRefOption(value, strictParseOptions));

/**
 * Parse a `${ENV_VAR}` inline secret template into a structured env secret ref.
 *
 * @param value {unknown} - The candidate inline secret template.
 * @param provider {unknown} - Provider alias input to normalize when the template resolves successfully.
 * @returns {SecretRef | null} - The parsed env secret ref, or `null` when the input is not an env template.
 * @category Utility
 * @since 0.0.0
 */
export const parseEnvTemplateSecretRef = (
  value: unknown,
  provider: unknown = DEFAULT_SECRET_PROVIDER_ALIAS
): SecretRef | null => {
  if (!P.isString(value)) {
    return null;
  }

  return pipe(
    Str.trim(value),
    Str.match(ENV_SECRET_TEMPLATE_RE),
    O.flatMap((match) =>
      pipe(
        O.fromNullishOr(match[1]),
        O.flatMap(decodeEnvSecretRefIdOption),
        O.map((id) => makeEnvSecretRef(normalizeSecretProviderAliasInput(provider), id))
      )
    ),
    O.getOrElse(thunkNull)
  );
};

/**
 * Coerce a value into a structured `SecretRef`.
 *
 * This preserves the legacy upgrade path for `{ source, id }` objects that omit
 * `provider`, and for inline `${ENV_VAR}` templates.
 *
 * @param value {unknown} - The candidate secret ref value.
 * @param defaults {SecretDefaultsInput | undefined} - Optional per-source default provider aliases for legacy refs.
 * @returns {SecretRef | null} - The normalized secret ref, or `null` when the value is not a supported ref shape.
 * @category Utility
 * @since 0.0.0
 */
export const coerceSecretRef = (value: unknown, defaults?: SecretDefaultsInput): SecretRef | null => {
  const explicitRef = decodeSecretRefOption(value, strictParseOptions);
  if (O.isSome(explicitRef)) {
    return explicitRef.value;
  }

  const legacyRef = decodeLegacySecretRefWithoutProviderOption(value, strictParseOptions);
  if (O.isSome(legacyRef)) {
    const provider = defaultProviderAliasForSource(legacyRef.value.source, defaults);

    if (legacyRef.value.source === "env") {
      return makeEnvSecretRef(provider, legacyRef.value.id);
    }

    if (legacyRef.value.source === "file") {
      return makeFileSecretRef(provider, legacyRef.value.id);
    }

    return makeExecSecretRef(provider, legacyRef.value.id);
  }

  return parseEnvTemplateSecretRef(value, defaults?.env);
};

/**
 * Check whether a value contains a configured secret input.
 *
 * Inline plaintext values and supported secret refs both count as configured.
 *
 * @param value {unknown} - Primary secret input candidate.
 * @param defaults {SecretDefaultsInput | undefined} - Optional per-source default provider aliases for legacy refs.
 * @returns {boolean} - `true` when the value is a non-empty inline string or a supported secret ref.
 * @category Utility
 * @since 0.0.0
 */
export const hasConfiguredSecretInput = (value: unknown, defaults?: SecretDefaultsInput): boolean =>
  normalizeSecretInputString(value) !== undefined || coerceSecretRef(value, defaults) !== null;

/**
 * Normalize a raw inline secret string.
 *
 * Empty and whitespace-only strings are treated as unset.
 *
 * @param value {unknown} - The raw secret input candidate.
 * @returns {string | undefined} - The trimmed string value when configured, otherwise `undefined`.
 * @category Utility
 * @since 0.0.0
 */
export const normalizeSecretInputString = (value: unknown): string | undefined =>
  O.getOrUndefined(decodeSecretInputStringOption(value));

/**
 * Resolve explicit and inline secret refs for a secret input pair.
 *
 * Explicit `refValue` takes precedence over inline refs embedded in `value`.
 *
 * @param params {ResolveSecretInputRefParams} - Values used to resolve secret refs.
 * @returns {SecretInputRefResolution} - The explicit ref, inline ref, and effective ref in precedence order.
 * @category Utility
 * @since 0.0.0
 */
export const resolveSecretInputRef = (params: ResolveSecretInputRefParams): SecretInputRefResolution => {
  const explicitRef = coerceSecretRef(params.refValue, params.defaults);
  const inlineRef = explicitRef === null ? coerceSecretRef(params.value, params.defaults) : null;

  return {
    explicitRef,
    inlineRef,
    ref: explicitRef ?? inlineRef,
  };
};

/**
 * Assert that a secret input has already been resolved to plaintext.
 *
 * The returned `Effect` succeeds when no unresolved secret ref remains and
 * fails with `UnresolvedSecretRefError` otherwise.
 *
 * @param params {ResolvedSecretInputParams} - Values used to inspect the secret input and the config path being read.
 * @returns {Effect.Effect<void, UnresolvedSecretRefError>} - An Effect that succeeds when the secret input is already plaintext and fails when a secret ref remains.
 * @category Utility
 * @since 0.0.0
 */
export const assertSecretInputResolved: (
  params: ResolvedSecretInputParams
) => Effect.Effect<void, UnresolvedSecretRefError> = Effect.fn("Secrets.assertSecretInputResolved")(
  function* (params): Effect.fn.Return<void, UnresolvedSecretRefError> {
    const { ref } = resolveSecretInputRef(params);

    if (P.isNull(ref)) {
      return;
    }

    return yield* new UnresolvedSecretRefError({
      path: params.path,
      ref,
      message: `${params.path}: unresolved SecretRef "${formatSecretRefLabel(ref)}". Resolve this command against an active gateway runtime snapshot before reading it.`,
    });
  }
);

/**
 * Normalize a resolved secret input string.
 *
 * Plaintext values are trimmed and returned. The returned `Effect` fails with
 * `UnresolvedSecretRefError` when the input still points at a secret ref.
 *
 * @param params {ResolvedSecretInputParams} - Values used to inspect and normalize the secret input.
 * @returns {Effect.Effect<string | undefined, UnresolvedSecretRefError>} - An Effect that resolves with the trimmed plaintext secret value, `undefined`, or fails when a secret ref remains.
 * @category Utility
 * @since 0.0.0
 */
export const normalizeResolvedSecretInputString: (
  params: ResolvedSecretInputParams
) => Effect.Effect<string | undefined, UnresolvedSecretRefError> = Effect.fn(
  "Secrets.normalizeResolvedSecretInputString"
)(function* (params): Effect.fn.Return<string | undefined, UnresolvedSecretRefError> {
  yield* assertSecretInputResolved(params);
  return normalizeSecretInputString(params.value);
});
