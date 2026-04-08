import { $ScratchId } from "@beep/identity";
import { CryptoWalletAddressRedacted, EvmAddressRedacted, TaggedErrorClass } from "@beep/schema";
import { NonEmptyTrimmedStr } from "@beep/schema/String";
import * as BunServices from "@effect/platform-bun/BunServices";
import { Config, Effect, Layer, Redacted, ServiceMap, Tuple, pipe } from "effect";
import * as S from "effect/Schema";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { CryptoNetwork } from "./CryptoNetwork.ts";
import { decodeMissingPurchaseTransactionsJson, MissingPurchaseTransactions } from "./MissingPurchaseTransactions.ts";
import { decodeRPMinipoolStatusOutputsJson, RPMinipoolStatusOutputs } from "./RPMinipoolStatus.ts";
import { KoinlyTransactions, decodeKoinlyTransactionsCsv } from "./koinly/KoinlyTransaction.ts";

const $I = $ScratchId.create("index");

const CryptoApiKey = S.RedactedFromValue(S.String).pipe(
  $I.annoteSchema("CryptoApiKey", {
    description: "Redacted crypto API key loaded from ambient config.",
  })
);

const RequiredOwnedWalletFields = {
  name: NonEmptyTrimmedStr,
  owner: NonEmptyTrimmedStr,
} as const;

const makeEvmWallet = <T extends Exclude<CryptoNetwork, "BTC">>(literal: S.Literal<T>) =>
  S.Struct({
    network: S.tag(literal.literal),
    address: EvmAddressRedacted,
    ...RequiredOwnedWalletFields,
  });

const makeBitcoinWallet = (literal: S.Literal<"BTC">) =>
  S.Struct({
    network: S.tag(literal.literal),
    address: CryptoWalletAddressRedacted,
    ...RequiredOwnedWalletFields,
  });

export const OwnedCryptoWallet = CryptoNetwork.mapMembers((members) =>
  pipe(
    members,
    Tuple.evolve([makeEvmWallet, makeEvmWallet, makeEvmWallet, makeBitcoinWallet])
  )
).pipe(
  S.toTaggedUnion("network"),
  $I.annoteSchema("OwnedCryptoWallet", {
    description: "A crypto wallet with ownership information and network association.",
  })
);

export type OwnedCryptoWallet = typeof OwnedCryptoWallet.Type;

export const OwnedCryptoWallets = S.NonEmptyArray(OwnedCryptoWallet).pipe(
  $I.annoteSchema("OwnedCryptoWallets", {
    description: "Non-empty owned crypto wallet inventory decoded from the scratchpad secret JSON.",
  })
);

export type OwnedCryptoWallets = typeof OwnedCryptoWallets.Type;

export const OwnedCryptoWalletsJson = S.fromJsonString(OwnedCryptoWallets).pipe(
  $I.annoteSchema("OwnedCryptoWalletsJson", {
    description: "JSON-string boundary schema for the owned crypto wallet inventory.",
  })
);

export const decodeOwnedCryptoWalletsJson = S.decodeUnknownEffect(OwnedCryptoWalletsJson);

export const OnePasswordSecretReference = NonEmptyTrimmedStr.check(
  S.isPattern(/^op:\/\/.+$/, {
    identifier: $I`OnePasswordSecretReferenceFormatCheck`,
    title: "1Password Secret Reference Format",
    description: "A 1Password secret reference such as op://vault/item/field.",
    message: "OnePasswordSecretReference must be a valid op:// secret reference",
  })
).pipe(
  S.brand("OnePasswordSecretReference"),
  $I.annoteSchema("OnePasswordSecretReference", {
    description: "A 1Password secret reference such as op://vault/item/field.",
  })
);

export type OnePasswordSecretReference = typeof OnePasswordSecretReference.Type;

const isOnePasswordSecretReference = S.is(OnePasswordSecretReference);

export class CryptoServiceConfigError extends TaggedErrorClass<CryptoServiceConfigError>($I`CryptoServiceConfigError`)(
  "CryptoServiceConfigError",
  {
    configKey: S.String,
    message: S.String,
  },
  $I.annote("CryptoServiceConfigError", {
    description: "Typed error raised when scratchpad crypto config is missing or malformed.",
  })
) {}

const invalidSecretPayload = (configKey: string, message: string) =>
  new CryptoServiceConfigError({
    configKey,
    message,
  });

const readOnePasswordSecretReference = Effect.fn("Scratchpad.readOnePasswordSecretReference")(function* (
  reference: OnePasswordSecretReference
) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

  return yield* spawner
    .string(ChildProcess.make`op read ${reference}`)
    .pipe(Effect.map(Redacted.make));
});

const resolveSecretText = Effect.fn("Scratchpad.resolveSecretText")(function* (
  configKey: string,
  secret: Redacted.Redacted<string>
) {
  const value = Redacted.value(secret);

  if (isOnePasswordSecretReference(value)) {
    return yield* readOnePasswordSecretReference(value).pipe(
      Effect.provide(BunServices.layer, { local: true }),
      Effect.mapError(() =>
        invalidSecretPayload(
          configKey,
          `Failed to resolve ${configKey} from its 1Password secret reference via \`op read\`.`
        )
      )
    );
  }

  return Redacted.make(value);
});

const decodeWalletSecret = (secret: Redacted.Redacted<string>) =>
  Effect.gen(function* () {
    const content = yield* resolveSecretText("CRYPTO_TBK_WALLETS_JSON", secret);

    return yield* decodeOwnedCryptoWalletsJson(Redacted.value(content)).pipe(
      Effect.mapError(() =>
        invalidSecretPayload(
          "CRYPTO_TBK_WALLETS_JSON",
          "Invalid CRYPTO_TBK_WALLETS_JSON secret payload. Expected a non-empty JSON array of wallets with network, name, address, and owner."
        )
      )
    );
  });

const decodeRpMinipoolStatusSecret = (secret: Redacted.Redacted<string>) =>
  Effect.gen(function* () {
    const content = yield* resolveSecretText("CRYPTO_RP_MINIPOOL_STATUS_OUTPUTS_JSON", secret);

    return yield* decodeRPMinipoolStatusOutputsJson(Redacted.value(content)).pipe(
      Effect.mapError(() =>
        invalidSecretPayload(
          "CRYPTO_RP_MINIPOOL_STATUS_OUTPUTS_JSON",
          "Invalid CRYPTO_RP_MINIPOOL_STATUS_OUTPUTS_JSON secret payload. Expected the Rocket Pool status export JSON document."
        )
      )
    );
  });

const decodeTransactionsCsvSecret = (secret: Redacted.Redacted<string>) =>
  Effect.gen(function* () {
    const content = yield* resolveSecretText("CRYPTO_TBK_TRANSACTIONS_CSV", secret);

    return yield* decodeKoinlyTransactionsCsv(Redacted.value(content)).pipe(
      Effect.mapError(() =>
        invalidSecretPayload(
          "CRYPTO_TBK_TRANSACTIONS_CSV",
          "Invalid CRYPTO_TBK_TRANSACTIONS_CSV secret payload. Expected a Koinly CSV export."
        )
      )
    );
  });

const decodeMissingPurchaseTransactionsSecret = (secret: Redacted.Redacted<string>) =>
  Effect.gen(function* () {
    const content = yield* resolveSecretText("CRYPTO_MISSING_PURCHASE_TXNS_JSON", secret);

    return yield* decodeMissingPurchaseTransactionsJson(Redacted.value(content)).pipe(
      Effect.mapError(() =>
        invalidSecretPayload(
          "CRYPTO_MISSING_PURCHASE_TXNS_JSON",
          "Invalid CRYPTO_MISSING_PURCHASE_TXNS_JSON secret payload. Expected the missing-purchase transaction export JSON document."
        )
      )
    );
  });

export const cryptoServiceSecretConfig = Config.all({
  beaconchainInApiKey: Config.option(Config.redacted("CRYPTO_BEACONCHAIN_IN_API_KEY")),
  etherscanApiKey: Config.option(Config.redacted("CRYPTO_ETHERSCAN_API_KEY")),
  walletsJson: Config.redacted("CRYPTO_TBK_WALLETS_JSON"),
  rpMinipoolStatusOutputsJson: Config.redacted("CRYPTO_RP_MINIPOOL_STATUS_OUTPUTS_JSON"),
  transactionsCsv: Config.redacted("CRYPTO_TBK_TRANSACTIONS_CSV"),
  missingPurchaseTransactionsJson: Config.redacted("CRYPTO_MISSING_PURCHASE_TXNS_JSON"),
});

export class CryptoServiceConfigData extends S.Class<CryptoServiceConfigData>($I`CryptoServiceConfigData`)(
  {
    beaconchainInApiKey: S.OptionFromNullOr(CryptoApiKey),
    etherscanApiKey: S.OptionFromNullOr(CryptoApiKey),
    cryptoWallets: OwnedCryptoWallets,
    rpMinipoolStatusOutputs: RPMinipoolStatusOutputs,
    koinlyTransactions: KoinlyTransactions,
    missingPurchaseTransactions: MissingPurchaseTransactions,
  },
  $I.annote("CryptoServiceConfigData", {
    description: "Decoded scratchpad crypto configuration assembled from redacted config secrets.",
  })
) {}

export const loadCryptoServiceConfig = Effect.gen(function* () {
  const secretConfig = yield* cryptoServiceSecretConfig;
  const cryptoWallets = yield* decodeWalletSecret(secretConfig.walletsJson);
  const rpMinipoolStatusOutputs = yield* decodeRpMinipoolStatusSecret(secretConfig.rpMinipoolStatusOutputsJson);
  const koinlyTransactions = yield* decodeTransactionsCsvSecret(secretConfig.transactionsCsv);
  const missingPurchaseTransactions = yield* decodeMissingPurchaseTransactionsSecret(
    secretConfig.missingPurchaseTransactionsJson
  );

  return CryptoServiceConfig.of(
    new CryptoServiceConfigData({
      beaconchainInApiKey: secretConfig.beaconchainInApiKey,
      etherscanApiKey: secretConfig.etherscanApiKey,
      cryptoWallets,
      rpMinipoolStatusOutputs,
      koinlyTransactions,
      missingPurchaseTransactions,
    })
  );
}).pipe(
  Effect.withSpan("Scratchpad.loadCryptoServiceConfig"),
  Effect.mapError((error) =>
    error instanceof CryptoServiceConfigError
      ? error
      : new CryptoServiceConfigError({
          configKey: "CRYPTO_CONFIG",
          message: error.message,
        })
  )
);

export class CryptoServiceConfig extends ServiceMap.Service<CryptoServiceConfig, CryptoServiceConfigData>()(
  $I`CryptoServiceConfig`
) {
  static readonly layer: Layer.Layer<CryptoServiceConfig, CryptoServiceConfigError> = Layer.effect(
    CryptoServiceConfig,
    loadCryptoServiceConfig
  );
}
