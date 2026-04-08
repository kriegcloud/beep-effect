import { CryptoWalletAddress } from "@beep/schema/blockchain/CryptoWalletAddress";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const evmLowercase = "0x52908400098527886e0f7030069857d2e4169ee7";
const evmChecksummed = "0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE";
const bitcoinP2pkh = "16L5yRNPTuciSgXGHqYwn9N6NeoKqopAu";
const bitcoinP2sh = "31nM1WuowNDzocNxPPW9NQWJEtwWpjfcLj";
const bitcoinWitness = "bc1qqypqxpq9qcrsszg2pvxq6rs0zqg3yyc5fcj4z3";
const bitcoinTaproot = "bc1ppy9qkrqdpc83qygjzv2p29shrqv35xcur50p7gppyg3jgffxyu5qus9dw3";
const solanaCryptoWalletAddress = "3ELeRTTg5W5hAYaEFznzFV1jknNFkjHqS8ytwvQEQP1Z";

describe("CryptoWalletAddress", () => {
  const decode = S.decodeUnknownSync(CryptoWalletAddress);

  it("accepts canonical EVM addresses", () => {
    expect(decode(evmLowercase)).toBe(evmLowercase);
    expect(decode(evmChecksummed)).toBe(evmChecksummed);
  });

  it("accepts canonical Bitcoin addresses", () => {
    expect(decode(bitcoinP2pkh)).toBe(bitcoinP2pkh);
    expect(decode(bitcoinP2sh)).toBe(bitcoinP2sh);
    expect(decode(bitcoinWitness)).toBe(bitcoinWitness);
    expect(decode(bitcoinTaproot)).toBe(bitcoinTaproot);
  });

  it("accepts canonical Solana addresses", () => {
    expect(decode(solanaCryptoWalletAddress)).toBe(solanaCryptoWalletAddress);
  });

  it("rejects malformed EVM addresses", () => {
    expect(() => decode(evmChecksummed.toUpperCase())).toThrow(
      "CryptoWalletAddress must be a canonical mainnet EVM, Bitcoin, or Solana wallet address"
    );
    expect(() => decode("52908400098527886e0f7030069857d2e4169ee7")).toThrow(
      "CryptoWalletAddress must be a canonical mainnet EVM, Bitcoin, or Solana wallet address"
    );
    expect(() => decode("0x52908400098527886E0F7030069857D2E4169Ee7")).toThrow(
      "CryptoWalletAddress must be a canonical mainnet EVM, Bitcoin, or Solana wallet address"
    );
  });

  it("rejects malformed Bitcoin addresses", () => {
    expect(() => decode("tb1qqypqxpq9qcrsszg2pvxq6rs0zqg3yyc5f8j3j2")).toThrow(
      "CryptoWalletAddress must be a canonical mainnet EVM, Bitcoin, or Solana wallet address"
    );
    expect(() => decode("bc1qQypqxpq9qcrsszg2pvxq6rs0zqg3yyc5fcj4z3")).toThrow(
      "CryptoWalletAddress must be a canonical mainnet EVM, Bitcoin, or Solana wallet address"
    );
    expect(() => decode("16L5yRNPTuciSgXGHqYwn9N6NeoKqopAv")).toThrow(
      "CryptoWalletAddress must be a canonical mainnet EVM, Bitcoin, or Solana wallet address"
    );
  });

  it("rejects malformed Solana addresses", () => {
    expect(() =>
      decode("2YeNeP1Xwhs2QCXnqvbDHktoF5v2ZDByARS2fWeiW5x8oENhfydKP6pwhQ8SarrG3Nhb3AeFMiwD38oj24uqC9um")
    ).toThrow("CryptoWalletAddress must be a canonical mainnet EVM, Bitcoin, or Solana wallet address");
    expect(() => decode("O0Il")).toThrow(
      "CryptoWalletAddress must be a canonical mainnet EVM, Bitcoin, or Solana wallet address"
    );
  });

  it("reports nested field failures at the address key", () => {
    const Payload = S.Struct({
      address: CryptoWalletAddress,
    });

    expect(() => S.decodeUnknownSync(Payload)({ address: "invalid" })).toThrow(`at ["address"]`);
  });
});
