import { EvmAddress } from "@beep/schema/blockchain/EvmAddress";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const evmLowercase = "0x52908400098527886e0f7030069857d2e4169ee7";
const evmChecksummed = "0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE";

describe("EvmAddress", () => {
  const decode = S.decodeUnknownSync(EvmAddress);

  it("accepts lowercase and checksummed canonical EVM addresses", () => {
    expect(decode(evmLowercase)).toBe(evmLowercase);
    expect(decode(evmChecksummed)).toBe(evmChecksummed);
  });

  it("rejects malformed or non-EVM addresses", () => {
    expect(() => decode(evmChecksummed.toUpperCase())).toThrow("EvmAddress must be a canonical mainnet EVM address");
    expect(() => decode("52908400098527886e0f7030069857d2e4169ee7")).toThrow(
      "EvmAddress must be a canonical mainnet EVM address"
    );
    expect(() => decode("bc1qqypqxpq9qcrsszg2pvxq6rs0zqg3yyc5fcj4z3")).toThrow(
      "EvmAddress must be a canonical mainnet EVM address"
    );
  });
});
