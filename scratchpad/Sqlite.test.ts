import { describe, expect, it } from "@effect/vitest";
import { Effect, Redacted, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { tmpdir } from "node:os";
import { fixtureKoinlyTransactionsCsv } from "./TestFixtures.ts";
import { KoinlySqlite, KoinlySqliteConfig } from "./Sqlite.ts";
import { decodeKoinlyTransactionsCsv } from "./koinly/KoinlyTransaction.ts";

describe("KoinlySqlite", () => {
  it("imports transactions and serves lookups from a Bun-backed sqlite database", async () => {
    const filename = `${tmpdir()}/koinly-sqlite-${crypto.randomUUID()}.sqlite`;
    const transactions = await Effect.runPromise(decodeKoinlyTransactionsCsv(fixtureKoinlyTransactionsCsv));
    const config = S.decodeUnknownSync(KoinlySqliteConfig)({ filename });

    const sampleById = transactions[0];
    const sampleByHash = pipe(
      transactions,
      A.findFirst((transaction) => O.isSome(transaction.txHash))
    );
    const sampleWithMissingCostBasis = pipe(
      transactions,
      A.findFirst((transaction) => O.isSome(transaction.missingCostBasis))
    );
    const sampleWithNegativeBalances = pipe(
      transactions,
      A.findFirst((transaction) => transaction.negativeBalances)
    );
    const sampleTxHash = pipe(
      sampleByHash,
      O.flatMap((transaction) => transaction.txHash)
    );

    expect(O.isSome(sampleByHash)).toBe(true);
    expect(O.isSome(sampleWithMissingCostBasis)).toBe(true);
    expect(O.isSome(sampleWithNegativeBalances)).toBe(true);
    expect(O.isSome(sampleTxHash)).toBe(true);

    if (
      O.isNone(sampleByHash) ||
      O.isNone(sampleWithMissingCostBasis) ||
      O.isNone(sampleWithNegativeBalances) ||
      O.isNone(sampleTxHash)
    ) {
      return;
    }

    const program = Effect.gen(function* () {
      const repo = yield* KoinlySqlite;

      const imported = yield* repo.importTransactions(transactions);
      const byId = yield* repo.getTransactionByKoinlyId(sampleById.koinlyId);
      const byHash = yield* repo.listTransactionsByTxHash(Redacted.value(sampleTxHash.value));
      const withMissingCostBasis = yield* repo.listTransactionsWithMissingCostBasis;
      const withNegativeBalances = yield* repo.listTransactionsWithNegativeBalances;

      return {
        byHash,
        byId,
        imported,
        withMissingCostBasis,
        withNegativeBalances,
      };
    }).pipe(Effect.provide(KoinlySqlite.layer(config)));

    const result = await Effect.runPromise(program);

    expect(result.imported).toBe(transactions.length);
    expect(O.isSome(result.byId)).toBe(true);
    expect(result.byHash.length).toBeGreaterThan(0);
    expect(
      A.some(result.withMissingCostBasis, (transaction) => transaction.koinlyId === sampleWithMissingCostBasis.value.koinlyId)
    ).toBe(true);
    expect(
      A.some(result.withNegativeBalances, (transaction) => transaction.koinlyId === sampleWithNegativeBalances.value.koinlyId)
    ).toBe(true);

    if (O.isSome(result.byId)) {
      expect(result.byId.value.koinlyId).toBe(sampleById.koinlyId);
    }
  });
});
