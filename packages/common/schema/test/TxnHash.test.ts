import { TxnHash } from "@beep/schema/blockchain/TxnHash";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const evmTxnHash = "0xabababababababababababababababababababababababababababababababab";
const bitcoinTxnHash = "cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd";
const solanaSignature = "2YeNeP1Xwhs2QCXnqvbDHktoF5v2ZDByARS2fWeiW5x8oENhfydKP6pwhQ8SarrG3Nhb3AeFMiwD38oj24uqC9um";

describe("TxnHash", () => {
  const decode = S.decodeUnknownSync(TxnHash);

  it("accepts canonical EVM, Bitcoin, and Solana transaction identifiers", () => {
    expect(decode(evmTxnHash)).toBe(evmTxnHash);
    expect(decode(bitcoinTxnHash)).toBe(bitcoinTxnHash);
    expect(decode(solanaSignature)).toBe(solanaSignature);
  });

  it("rejects malformed EVM transaction hashes", () => {
    expect(() => decode(evmTxnHash.toUpperCase())).toThrow(
      "TxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
    expect(() => decode(`0x${"ab".repeat(31)}`)).toThrow(
      "TxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
    expect(() => decode(`0x${"ag".repeat(32)}`)).toThrow(
      "TxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
  });

  it("rejects malformed Bitcoin transaction hashes", () => {
    expect(() => decode(bitcoinTxnHash.toUpperCase())).toThrow(
      "TxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
    expect(() => decode(bitcoinTxnHash.slice(2))).toThrow(
      "TxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
    expect(() => decode(`g${bitcoinTxnHash.slice(1)}`)).toThrow(
      "TxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
  });

  it("rejects malformed Solana transaction signatures", () => {
    expect(() => decode("3ELeRTTg5W5hAYaEFznzFV1jknNFkjHqS8ytwvQEQP1Z")).toThrow(
      "TxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
    expect(() => decode("O0Il")).toThrow(
      "TxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier"
    );
  });

  it("reports nested field failures at the transaction hash key", () => {
    const Payload = S.Struct({
      txnHash: TxnHash,
    });

    expect(() => S.decodeUnknownSync(Payload)({ txnHash: "invalid" })).toThrow(`at ["txnHash"]`);
  });
});
