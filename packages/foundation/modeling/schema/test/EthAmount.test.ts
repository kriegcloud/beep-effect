import { EthAmount } from "@beep/schema/blockchain/EthAmount";
import { describe, expect, it } from "@effect/vitest";
import { BigDecimal } from "effect";
import * as S from "effect/Schema";

describe("EthAmount", () => {
  const decode = S.decodeUnknownSync(EthAmount);
  const encode = S.encodeSync(EthAmount);

  it("decodes non-negative ETH JSON numbers into BigDecimal", () => {
    const amount = decode(7.220045);

    expect(BigDecimal.format(amount)).toBe("7.220045");
  });

  it("encodes decoded ETH amounts back to JSON numbers", () => {
    const encoded = encode(decode(24));

    expect(encoded).toBe(24);
  });

  it("rejects negative ETH amounts", () => {
    expect(() => decode(-0.000001)).toThrow("EthAmount must be greater than or equal to 0");
  });
});
