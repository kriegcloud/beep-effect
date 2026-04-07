import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect } from "effect";
import { readFile } from "node:fs/promises";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  KoinlySyntheticTransactionId,
  KoinlyTransactionReference,
  KoinlyUtcTimestamp,
} from "./KoinlyPrimitives.ts";
import { decodeKoinlyTransactionsCsv } from "./KoinlyTransaction.ts";

describe("Koinly primitives", () => {
  it("parses and re-encodes Koinly UTC timestamps", () => {
    const decode = S.decodeUnknownSync(KoinlyUtcTimestamp);
    const encode = S.encodeSync(KoinlyUtcTimestamp);

    const timestamp = decode("2022-01-11 04:36:39");

    expect(DateTime.formatIso(timestamp)).toBe("2022-01-11T04:36:39.000Z");
    expect(encode(timestamp)).toBe("2022-01-11 04:36:39");
  });

  it("accepts synthetic Koinly transaction identifiers in the mixed reference schema", () => {
    const decode = S.decodeUnknownSync(KoinlyTransactionReference);

    expect(decode("78341818_bnb")).toBe(S.decodeUnknownSync(KoinlySyntheticTransactionId)("78341818_bnb"));
  });
});

describe("decodeKoinlyTransactionsCsv", () => {
  it("decodes the real Koinly CSV export into normalized transactions", async () => {
    const csv = await readFile(new URL("./transactions.csv", import.meta.url), "utf8");
    const transactions = await Effect.runPromise(decodeKoinlyTransactionsCsv(csv));

    expect(transactions).toHaveLength(2103);

    const first = transactions[0];

    expect(first.koinlyId).toBe("770AF28689FFAB912F2353F051CE04DA");
    expect(first.type).toBe("transfer");
    expect(first.deleted).toBe(false);
    expect(O.isSome(first.fromWallet)).toBe(true);
    expect(first.valueCurrency.symbol).toBe("USD");
  });
});
