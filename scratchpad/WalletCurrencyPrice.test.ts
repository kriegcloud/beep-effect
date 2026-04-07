import { readFileSync } from "node:fs";
import { describe, expect, it } from "@effect/vitest";
import { BigDecimal, Effect, Redacted } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  CurrencyPriceApiData,
  getCurrencyMeta,
  PriceProviderData,
  WalletCurrencyMetaByTicker,
  WalletCurrencyValues,
} from "./WalletCurrency.ts";
import {
  resolveWalletCurrencyUsdPrice,
  type WalletCurrencyPriceApiKeys,
} from "./WalletCurrencyPrice.ts";

const uniqueCurrencyTickers = [
  ...new Set(
    (JSON.parse(readFileSync(new URL("./currencies.json", import.meta.url), "utf8")) as ReadonlyArray<{ ticker: string }>).map(
      (currency) => currency.ticker
    )
  ),
].sort();

const makeApiKeys = (
  input?: Partial<{
    readonly coinGeckoApiKey: string;
    readonly coinApiApiKey: string;
    readonly alchemyApiKey: string;
  }>
): WalletCurrencyPriceApiKeys => ({
  coinGeckoApiKey: input?.coinGeckoApiKey === undefined ? O.none() : O.some(Redacted.make(input.coinGeckoApiKey)),
  coinApiApiKey: input?.coinApiApiKey === undefined ? O.none() : O.some(Redacted.make(input.coinApiApiKey)),
  alchemyApiKey: input?.alchemyApiKey === undefined ? O.none() : O.some(Redacted.make(input.alchemyApiKey)),
});

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });

describe("WalletCurrency provider metadata", () => {
  it("covers every unique ticker in currencies.json", () =>
    expect([...WalletCurrencyValues].sort()).toEqual(uniqueCurrencyTickers));

  it("decodes provider-tagged metadata and defaults fallback providers", () => {
    const decode = S.decodeUnknownSync(CurrencyPriceApiData);
    const encode = S.encodeSync(CurrencyPriceApiData);

    const apiData = decode({
      preferred: {
        provider: "coinapi",
        assetId: "BTC",
      },
    });

    expect(apiData.preferred.provider).toBe("coinapi");
    expect(apiData.fallbacks).toEqual([]);
    expect(encode(apiData)).toEqual({
      preferred: {
        provider: "coinapi",
        assetId: "BTC",
      },
      fallbacks: [],
    });
  });

  it("round-trips a tagged provider payload", () => {
    const decode = S.decodeUnknownSync(PriceProviderData);
    const encode = S.encodeSync(PriceProviderData);

    const provider = decode({
      provider: "alchemy",
      lookup: "contract",
      network: "AVALANCHE",
    });

    expect(provider.provider).toBe("alchemy");
    expect(encode(provider)).toEqual({
      provider: "alchemy",
      lookup: "contract",
      network: "AVALANCHE",
    });
  });

  it("configures annotation metadata for every wallet currency", () => {
    for (const currency of WalletCurrencyValues) {
      const meta = getCurrencyMeta(currency);

      expect(meta.name.length).toBeGreaterThan(0);
    }
  });

  it("keeps contract-backed fallback metadata for unresolved bridge assets", () => {
    const usdcBridgeMeta = WalletCurrencyMetaByTicker["USDC.E"];

    expect(O.isSome(usdcBridgeMeta.apiData)).toBe(true);

    if (O.isSome(usdcBridgeMeta.apiData)) {
      expect(usdcBridgeMeta.apiData.value.preferred.provider).toBe("alchemy");
    }
  });
});

describe("resolveWalletCurrencyUsdPrice", () => {
  it("returns a static USD quote for USD", async () => {
    const quote = await Effect.runPromise(resolveWalletCurrencyUsdPrice("USD"));

    expect(BigDecimal.format(quote.usdPrice)).toBe("1");
    expect(quote.provenance.kind).toBe("static");
  });

  it("uses the preferred CoinGecko provider when it succeeds", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.includes("coingecko")) {
        return jsonResponse({
          bitcoin: {
            usd: 70234.12,
            last_updated_at: 1_710_000_000,
          },
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    };

    const quote = await Effect.runPromise(
      resolveWalletCurrencyUsdPrice("BTC", {
        apiKeys: makeApiKeys({
          coinGeckoApiKey: "coin-gecko-key",
        }),
        fetch: fetchMock,
      })
    );

    expect(quote.provenance.kind).toBe("provider");
    if (quote.provenance.kind === "provider") {
      expect(quote.provenance.provider).toBe("coingecko");
      expect(quote.provenance.reference).toBe("coin:bitcoin");
    }
    expect(BigDecimal.format(quote.usdPrice)).toBe("70234.12");
  });

  it("falls back to CoinAPI after a failed preferred provider", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.includes("coingecko")) {
        return jsonResponse({ error: "rate limited" }, 429);
      }

      if (url.includes("coinapi")) {
        return jsonResponse({
          time: "2026-04-07T12:00:00Z",
          asset_id_base: "BTC",
          asset_id_quote: "USD",
          rate: 70333.55,
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    };

    const quote = await Effect.runPromise(
      resolveWalletCurrencyUsdPrice("BTC", {
        apiKeys: makeApiKeys({
          coinGeckoApiKey: "coin-gecko-key",
          coinApiApiKey: "coin-api-key",
        }),
        fetch: fetchMock,
      })
    );

    expect(quote.provenance.kind).toBe("provider");
    if (quote.provenance.kind === "provider") {
      expect(quote.provenance.provider).toBe("coinapi");
      expect(quote.provenance.reference).toBe("asset:BTC");
    }
    expect(BigDecimal.format(quote.usdPrice)).toBe("70333.55");
  });

  it("resolves contract-backed bridge assets through Alchemy by address", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.includes("api.g.alchemy.com")) {
        return jsonResponse({
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
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    };

    const quote = await Effect.runPromise(
      resolveWalletCurrencyUsdPrice("USDC.E", {
        apiKeys: makeApiKeys({
          alchemyApiKey: "alchemy-key",
        }),
        fetch: fetchMock,
      })
    );

    expect(quote.provenance.kind).toBe("provider");
    if (quote.provenance.kind === "provider") {
      expect(quote.provenance.provider).toBe("alchemy");
      expect(quote.provenance.reference).toContain("contract:avax-mainnet:");
    }
    expect(BigDecimal.format(quote.usdPrice)).toBe("1.0002");
  });
});
