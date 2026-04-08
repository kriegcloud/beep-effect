import { $ScratchId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, layer } from "@effect/vitest";
import { BigDecimal, Effect, Layer, Redacted, pipe } from "effect";
import * as A from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  CurrencyPriceApiData,
  getCurrencyMeta,
  PriceProviderData,
  WalletCurrencyMetaByTicker,
  WalletCurrencyValues,
} from "./WalletCurrency.ts";
import {
  CurrencyUsdPriceQuote,
  resolveWalletCurrencyUsdPrice,
} from "./WalletCurrencyPrice.ts";
import type { PriceApiProvider as PriceApiProviderType } from "./WalletCurrency.ts";

const $I = $ScratchId.create("WalletCurrencyPrice.test");

const TestLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

class CurrencyTickerRecord extends S.Class<CurrencyTickerRecord>($I`CurrencyTickerRecord`)(
  {
    ticker: S.String,
  },
  $I.annote("CurrencyTickerRecord", {
    description: "Ticker entry loaded from the scratchpad currencies fixture.",
  })
) {}

const CurrencyTickerRecords = S.Array(CurrencyTickerRecord).pipe(
  $I.annoteSchema("CurrencyTickerRecords", {
    description: "Ticker entries loaded from the scratchpad currencies fixture.",
  })
);

const CurrencyTickerRecordsFromJson = S.fromJsonString(CurrencyTickerRecords).pipe(
  $I.annoteSchema("CurrencyTickerRecordsFromJson", {
    description: "JSON string wrapper for ticker entries loaded from the scratchpad currencies fixture.",
  })
);

class WalletCurrencyPriceApiKeyFixture extends S.Class<WalletCurrencyPriceApiKeyFixture>($I`WalletCurrencyPriceApiKeyFixture`)(
  {
    coinGeckoApiKey: S.OptionFromOptionalKey(S.String),
    coinApiApiKey: S.OptionFromOptionalKey(S.String),
    alchemyApiKey: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("WalletCurrencyPriceApiKeyFixture", {
    description: "Optional API key fixture inputs for wallet currency price tests.",
  })
) {}

class UnexpectedFetchRequestError extends TaggedErrorClass<UnexpectedFetchRequestError>($I`UnexpectedFetchRequestError`)(
  "UnexpectedFetchRequestError",
  {
    url: S.String,
    message: S.String,
  },
  $I.annote("UnexpectedFetchRequestError", {
    description: "Typed fetch mock error raised when a test issues an unexpected HTTP request.",
  })
) {}

const decodeCurrencyPriceApiData = S.decodeUnknownSync(CurrencyPriceApiData);
const encodeCurrencyPriceApiData = S.encodeSync(CurrencyPriceApiData);
const decodePriceProviderData = S.decodeUnknownSync(PriceProviderData);
const encodePriceProviderData = S.encodeSync(PriceProviderData);
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const loadUniqueCurrencyTickers = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const content = yield* fs.readFileString(path.join("scratchpad", "currencies.json"));
  const currencies = yield* S.decodeUnknownEffect(CurrencyTickerRecordsFromJson)(content);

  return pipe(currencies, A.map(({ ticker }) => ticker), HashSet.fromIterable, A.fromIterable, A.sort(Order.String));
}).pipe(Effect.withSpan("WalletCurrencyPriceTest.loadUniqueCurrencyTickers"));

const makeApiKeys = Effect.fn("WalletCurrencyPriceTest.makeApiKeys")(function* (
  input: typeof WalletCurrencyPriceApiKeyFixture.Encoded = {}
) {
  const fixture = yield* S.decodeUnknownEffect(WalletCurrencyPriceApiKeyFixture)(input);

  return {
    coinGeckoApiKey: pipe(fixture.coinGeckoApiKey, O.map(Redacted.make)),
    coinApiApiKey: pipe(fixture.coinApiApiKey, O.map(Redacted.make)),
    alchemyApiKey: pipe(fixture.alchemyApiKey, O.map(Redacted.make)),
  };
});

type MockFetchRoute = readonly [contains: string, response: Response];

const toUnexpectedFetchRequestError = (url: string): UnexpectedFetchRequestError =>
  new UnexpectedFetchRequestError({
    url,
    message: `Unexpected request: ${url}`,
  });

const resolveMockResponse = Effect.fn("WalletCurrencyPriceTest.resolveMockResponse")(function* (
  input: URL | RequestInfo,
  routes: ReadonlyArray<MockFetchRoute>
) {
  const url = P.isString(input) ? input : input.toString();
  const response = pipe(
    routes,
    A.findFirst(([contains]) => Str.includes(contains)(url)),
    O.map(([, match]) => match)
  );

  if (O.isNone(response)) {
    return yield* Effect.fail(toUnexpectedFetchRequestError(url));
  }

  return response.value;
});

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(encodeJson(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });

const makeFetchMock = (routes: ReadonlyArray<MockFetchRoute>): typeof fetch => {
  const fetchMock: typeof fetch = (input) => Effect.runPromise(resolveMockResponse(input, routes));
  fetchMock.preconnect = fetch.preconnect;
  return fetchMock;
};

const expectProviderQuote = Effect.fn("WalletCurrencyPriceTest.expectProviderQuote")(function* (
  quote: CurrencyUsdPriceQuote,
  provider: PriceApiProviderType,
  referenceFragment: string,
  usdPrice: string
) {
  yield* Effect.sync(() => {
    expect(quote.provenance.kind).toBe("provider");

    if (quote.provenance.kind !== "provider") {
      expect.fail("Expected provider provenance.");
      return;
    }

    expect(quote.provenance.provider).toBe(provider);
    expect(Str.includes(referenceFragment)(quote.provenance.reference)).toBe(true);
    expect(BigDecimal.format(quote.usdPrice)).toBe(usdPrice);
  });
});

layer(TestLayer)("WalletCurrencyPrice", (it) => {
  describe("WalletCurrency provider metadata", () => {
    it.effect(
      "covers every unique ticker in currencies.json",
      Effect.fn("WalletCurrencyPriceTest.coversEveryUniqueTicker")(function* () {
        const uniqueCurrencyTickers = yield* loadUniqueCurrencyTickers;

        yield* Effect.sync(() => expect(pipe(WalletCurrencyValues, A.sort(Order.String))).toEqual(uniqueCurrencyTickers));
      })
    );

    it.effect(
      "decodes provider-tagged metadata and defaults fallback providers",
      Effect.fn("WalletCurrencyPriceTest.decodesProviderTaggedMetadata")(function* () {
        const apiData = decodeCurrencyPriceApiData({
          preferred: {
            provider: "coinapi",
            assetId: "BTC",
          },
        });

        yield* Effect.sync(() => {
          expect(apiData.preferred.provider).toBe("coinapi");
          expect(apiData.fallbacks).toEqual([]);
          expect(encodeCurrencyPriceApiData(apiData)).toEqual({
            preferred: {
              provider: "coinapi",
              assetId: "BTC",
            },
            fallbacks: [],
          });
        });
      })
    );

    it.effect(
      "round-trips a tagged provider payload",
      Effect.fn("WalletCurrencyPriceTest.roundTripsTaggedProviderPayload")(function* () {
        const provider = decodePriceProviderData({
          provider: "alchemy",
          lookup: "contract",
          network: "AVALANCHE",
        });

        yield* Effect.sync(() => {
          expect(provider.provider).toBe("alchemy");
          expect(encodePriceProviderData(provider)).toEqual({
            provider: "alchemy",
            lookup: "contract",
            network: "AVALANCHE",
          });
        });
      })
    );

    it.effect(
      "requires an EVM network for alchemy contract lookups",
      Effect.fn("WalletCurrencyPriceTest.requiresEvmNetwork")(function* () {
        const error = yield* S.decodeUnknownEffect(PriceProviderData)({
          provider: "alchemy",
          lookup: "contract",
        }).pipe(Effect.flip);

        yield* Effect.sync(() => expect(error).toBeDefined());
      })
    );

    it.effect(
      "configures annotation metadata for every wallet currency",
      Effect.fn("WalletCurrencyPriceTest.configuresAnnotationMetadata")(function* () {
        yield* pipe(
          WalletCurrencyValues,
          Effect.forEach((currency) =>
            Effect.sync(() => {
              const meta = getCurrencyMeta(currency);
              expect(meta.name.length).toBeGreaterThan(0);
            })
          )
        );
      })
    );

    it.effect(
      "keeps contract-backed fallback metadata for unresolved bridge assets",
      Effect.fn("WalletCurrencyPriceTest.keepsContractBackedFallbackMetadata")(function* () {
        const usdcBridgeMeta = WalletCurrencyMetaByTicker["USDC.E"];

        yield* pipe(
          usdcBridgeMeta.apiData,
          O.match({
            onNone: () => Effect.sync(() => expect.fail("Expected contract-backed fallback metadata for USDC.E.")),
            onSome: (apiData) => Effect.sync(() => expect(apiData.preferred.provider).toBe("alchemy")),
          })
        );
      })
    );
  });

  describe("resolveWalletCurrencyUsdPrice", () => {
    it.effect(
      "returns a static USD quote for USD",
      Effect.fn("WalletCurrencyPriceTest.returnsStaticUsdQuote")(function* () {
        const quote = yield* resolveWalletCurrencyUsdPrice("USD");

        yield* Effect.sync(() => {
          expect(BigDecimal.format(quote.usdPrice)).toBe("1");
          expect(quote.provenance.kind).toBe("static");
        });
      })
    );

    it.effect(
      "uses the preferred CoinGecko provider when it succeeds",
      Effect.fn("WalletCurrencyPriceTest.usesPreferredCoinGeckoProvider")(function* () {
        const apiKeys = yield* makeApiKeys({
          coinGeckoApiKey: "coin-gecko-key",
        });
        const fetchMock = makeFetchMock([
          [
            "coingecko",
            jsonResponse({
              bitcoin: {
                usd: 70234.12,
                last_updated_at: 1_710_000_000,
              },
            }),
          ],
        ]);
        const quote = yield* resolveWalletCurrencyUsdPrice("BTC", {
          apiKeys,
          fetch: fetchMock,
        });

        yield* expectProviderQuote(quote, "coingecko", "coin:bitcoin", "70234.12");
      })
    );

    it.effect(
      "falls back to CoinAPI after a failed preferred provider",
      Effect.fn("WalletCurrencyPriceTest.fallsBackToCoinApi")(function* () {
        const apiKeys = yield* makeApiKeys({
          coinGeckoApiKey: "coin-gecko-key",
          coinApiApiKey: "coin-api-key",
        });
        const fetchMock = makeFetchMock([
          ["coingecko", jsonResponse({ error: "rate limited" }, 429)],
          [
            "coinapi",
            jsonResponse({
              time: "2026-04-07T12:00:00Z",
              asset_id_base: "BTC",
              asset_id_quote: "USD",
              rate: 70333.55,
            }),
          ],
        ]);
        const quote = yield* resolveWalletCurrencyUsdPrice("BTC", {
          apiKeys,
          fetch: fetchMock,
        });

        yield* expectProviderQuote(quote, "coinapi", "asset:BTC", "70333.55");
      })
    );

    it.effect(
      "resolves contract-backed bridge assets through Alchemy by address",
      Effect.fn("WalletCurrencyPriceTest.resolvesAlchemyContractQuote")(function* () {
        const apiKeys = yield* makeApiKeys({
          alchemyApiKey: "alchemy-key",
        });
        const fetchMock = makeFetchMock([
          [
            "api.g.alchemy.com",
            jsonResponse({
              data: [
                {
                  network: "avax-mainnet",
                  address: "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
                  prices: [
                    {
                      currency: "usd",
                      value: "1.0002",
                      lastUpdatedAt: "2026-04-07T15:00:00Z",
                    },
                  ],
                  error: null,
                },
              ],
            }),
          ],
        ]);
        const quote = yield* resolveWalletCurrencyUsdPrice("USDC.E", {
          apiKeys,
          fetch: fetchMock,
        });

        yield* expectProviderQuote(quote, "alchemy", "contract:avax-mainnet:", "1.0002");
      })
    );
  });
});
