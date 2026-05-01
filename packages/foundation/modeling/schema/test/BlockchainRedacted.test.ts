import { CryptoTxnHashRedacted } from "@beep/schema/blockchain/CryptoTxnHash";
import { CryptoWalletAddressRedacted } from "@beep/schema/blockchain/CryptoWalletAddress";
import { EthereumValidatorPublicKeyRedacted } from "@beep/schema/blockchain/EthereumValidatorPublicKey";
import { EvmAddressRedacted } from "@beep/schema/blockchain/EvmAddress";
import { describe, expect, it } from "@effect/vitest";
import { Redacted } from "effect";
import * as S from "effect/Schema";

const bitcoinAddress = "16L5yRNPTuciSgXGHqYwn9N6NeoKqopAu";
const evmAddress = "0x52908400098527886e0f7030069857d2e4169ee7";
const validatorPublicKey =
  "0x94c4002c93ce4911ae929129e444413f0b05ee5b97e5a99a95b609a0e61318332cfd601fc48e3853bf5a1cdd2be5f572";
const transactionHash = "0xabababababababababababababababababababababababababababababababab";

describe("blockchain redacted schemas", () => {
  it("decode canonical blockchain identifiers into redacted values", () => {
    const walletAddress = S.decodeUnknownSync(CryptoWalletAddressRedacted)(bitcoinAddress);
    const decodedEvmAddress = S.decodeUnknownSync(EvmAddressRedacted)(evmAddress);
    const decodedValidatorPublicKey = S.decodeUnknownSync(EthereumValidatorPublicKeyRedacted)(validatorPublicKey);
    const decodedTransactionHash = S.decodeUnknownSync(CryptoTxnHashRedacted)(transactionHash);

    expect(String(walletAddress)).toBe("<redacted>");
    expect(String(decodedEvmAddress)).toBe("<redacted>");
    expect(String(decodedValidatorPublicKey)).toBe("<redacted>");
    expect(String(decodedTransactionHash)).toBe("<redacted>");
    expect(Redacted.value(walletAddress)).toBe(bitcoinAddress);
    expect(Redacted.value(decodedEvmAddress)).toBe(evmAddress);
    expect(Redacted.value(decodedValidatorPublicKey)).toBe(validatorPublicKey);
    expect(Redacted.value(decodedTransactionHash)).toBe(transactionHash);
  });
});
