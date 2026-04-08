import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit, Redacted } from "effect";
import * as ConfigProvider from "effect/ConfigProvider";
import * as O from "effect/Option";
import {
  fixtureBitcoinAddress,
  fixtureEvmAddressLowercase,
  fixtureMissingPurchaseTransactionHash,
  fixtureTransactionHash,
  scratchpadCryptoFixtureEnv,
} from "./TestFixtures.ts";
import { CryptoServiceConfig } from "./index.ts";

const configLayer = (entries: Record<string, string>) => ConfigProvider.layer(ConfigProvider.fromUnknown(entries));

const loadFromEnv = (entries: Record<string, string>) =>
  Effect.gen(function* () {
    return yield* CryptoServiceConfig;
  }).pipe(Effect.provide(CryptoServiceConfig.layer), Effect.provide(configLayer(entries)));

describe("CryptoServiceConfig", () => {
  it.effect("loads scratchpad crypto datasets from redacted config secrets", () =>
    Effect.gen(function* () {
      const config = yield* loadFromEnv(scratchpadCryptoFixtureEnv);
      const firstWallet = config.cryptoWallets[0];
      const firstMinipool = config.rpMinipoolStatusOutputs.minipools[0];
      const firstTransaction = config.koinlyTransactions[0];
      const firstMissingPurchase = config.missingPurchaseTransactions.transactions[0];

      expect(config.cryptoWallets).toHaveLength(3);
      expect(config.rpMinipoolStatusOutputs.minipools).toHaveLength(1);
      expect(config.koinlyTransactions).toHaveLength(3);
      expect(config.missingPurchaseTransactions.transactions).toHaveLength(1);
      expect(O.isSome(config.beaconchainInApiKey)).toBe(true);
      expect(O.isSome(config.etherscanApiKey)).toBe(true);

      if (
        firstWallet === undefined ||
        firstMinipool === undefined ||
        firstTransaction === undefined ||
        firstMissingPurchase === undefined ||
        O.isNone(config.beaconchainInApiKey) ||
        O.isNone(config.etherscanApiKey) ||
        O.isNone(firstTransaction.txHash) ||
        O.isNone(firstMissingPurchase.txhash)
      ) {
        return;
      }

      expect(String(config.beaconchainInApiKey.value)).toBe("<redacted>");
      expect(String(config.etherscanApiKey.value)).toBe("<redacted>");
      expect(String(firstWallet.address)).toBe("<redacted>");
      expect(String(firstMinipool.address)).toBe("<redacted>");
      expect(String(firstTransaction.txHash.value)).toBe("<redacted>");
      expect(String(firstMissingPurchase.txhash.value)).toBe("<redacted>");
      expect(Redacted.value(firstWallet.address)).toBe(fixtureBitcoinAddress);
      expect(Redacted.value(firstMinipool.address)).toBe(fixtureEvmAddressLowercase);
      expect(Redacted.value(firstTransaction.txHash.value)).toBe(fixtureTransactionHash);
      expect(Redacted.value(firstMissingPurchase.txhash.value)).toBe(fixtureMissingPurchaseTransactionHash);
    })
  );

  it.effect("fails without leaking wallet secret payloads when the wallet JSON is malformed", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        loadFromEnv({
          ...scratchpadCryptoFixtureEnv,
          CRYPTO_TBK_WALLETS_JSON: `[
            {
              "name": "Alice BTC Vault",
              "address": "${fixtureBitcoinAddress}",
              "owner": "ALICE"
            }
          ]`,
        })
      );

      expect(Exit.isFailure(result)).toBe(true);

      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);

        expect(rendered).toContain("Invalid CRYPTO_TBK_WALLETS_JSON secret payload");
        expect(rendered).toContain("CRYPTO_TBK_WALLETS_JSON");
        expect(rendered).not.toContain(fixtureBitcoinAddress);
      }
    })
  );
});
