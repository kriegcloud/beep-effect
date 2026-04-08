import { CryptoTxnHash } from "@beep/schema/blockchain/CryptoTxnHash";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const evmCryptoTxnHash = "0xabababababababababababababababababababababababababababababababab";
const bitcoinCryptoTxnHash = "cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd";
const solanaSignature = "2YeNeP1Xwhs2QCXnqvbDHktoF5v2ZDByARS2fWeiW5x8oENhfydKP6pwhQ8SarrG3Nhb3AeFMiwD38oj24uqC9um";

describe("CryptoTxnHash", () => {
  const decode = S.decodeUnknownSync(CryptoTxnHash);

  it("accepts canonical EVM, Bitcoin, and Solana transaction identifiers", () => {
    expect(decode(evmCryptoTxnHash)).toBe(evmCryptoTxnHash);
    expect(decode(bitcoinCryptoTxnHash)).toBe(bitcoinCryptoTxnHash);
    expect(decode(solanaSignature)).toBe(solanaSignature);
  });

  it("rejects malformed EVM transaction hashes", () => {
    expect(() => decode(evmCryptoTxnHash.toUpperCase())).toThrow(
      "CryptoTxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
    expect(() => decode(`0x${"ab".repeat(31)}`)).toThrow(
      "CryptoTxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
    expect(() => decode(`0x${"ag".repeat(32)}`)).toThrow(
      "CryptoTxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
  });

  it("rejects malformed Bitcoin transaction hashes", () => {
    expect(() => decode(bitcoinCryptoTxnHash.toUpperCase())).toThrow(
      "CryptoTxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
    expect(() => decode(bitcoinCryptoTxnHash.slice(2))).toThrow(
      "CryptoTxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
    expect(() => decode(`g${bitcoinCryptoTxnHash.slice(1)}`)).toThrow(
      "CryptoTxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
  });

  it("rejects malformed Solana transaction signatures", () => {
    expect(() => decode("3ELeRTTg5W5hAYaEFznzFV1jknNFkjHqS8ytwvQEQP1Z")).toThrow(
      "CryptoTxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
    expect(() => decode("O0Il")).toThrow(
      "CryptoTxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
  });

  it("reports nested field failures at the transaction hash key", () => {
    const Payload = S.Struct({
      txnHash: CryptoTxnHash,
    });

    expect(() => S.decodeUnknownSync(Payload)({ txnHash: "invalid" })).toThrow(`at ["txnHash"]`);
  });
});
