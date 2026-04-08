/**
 * Runtime price-resolution helpers for scratchpad wallet currencies.
 *
 * @module scratchpad/WalletCurrencyPrice
 * @since 0.0.0
 */

import { $ScratchId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { BigDecimal, Config, DateTime, Effect, Redacted, SchemaGetter, SchemaIssue, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  ExplorerNetwork,
  getCurrencyMeta,
  PriceApiProvider,
  type PriceProviderData,
  WalletCurrency,
  WalletCurrencyValues,
} from "./WalletCurrency.ts";
import type {
  PriceApiProvider as PriceApiProviderType,
  WalletCurrency as WalletCurrencyType,
} from "./WalletCurrency.ts";
import { CryptoWalletAddress } from "@beep/schema";

const $I = $ScratchId.create("WalletCurrencyPrice");

const invalidUsdPrice = (input: string): SchemaIssue.Issue =>
  new SchemaIssue.InvalidValue(O.some(input), {
    message: "UsdPrice must be a valid decimal string.",
  });

/**
 * Exact-decimal USD price decoded from a textual API response.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const UsdPrice = S.String.pipe(
  S.decodeTo(S.BigDecimal, {
    decode: SchemaGetter.transformOrFail((input) =>
      pipe(
        BigDecimal.fromString(input),
        O.match({
          onNone: () => Effect.fail(invalidUsdPrice(input)),
          onSome: Effect.succeed,
        })
      )
    ),
    encode: SchemaGetter.transform(BigDecimal.format),
  }),
  $I.annoteSchema("UsdPrice", {
    description: "Exact-decimal USD price decoded from a textual API response.",
  })
);

export type UsdPrice = typeof UsdPrice.Type;

class StaticCurrencyUsdPriceQuoteProvenance extends S.Class<StaticCurrencyUsdPriceQuoteProvenance>(
  $I`StaticCurrencyUsdPriceQuoteProvenance`
)(
  {
    kind: S.tag("static"),
    reason: S.String,
  },
  $I.annote("StaticCurrencyUsdPriceQuoteProvenance", {
    description: "Static provenance for wallet currencies whose USD quote is locally known.",
  })
) {}

class ProviderCurrencyUsdPriceQuoteProvenance extends S.Class<ProviderCurrencyUsdPriceQuoteProvenance>(
  $I`ProviderCurrencyUsdPriceQuoteProvenance`
)(
  {
    kind: S.tag("provider"),
    provider: PriceApiProvider,
    reference: S.String,
  },
  $I.annote("ProviderCurrencyUsdPriceQuoteProvenance", {
    description: "Provider-backed provenance for a resolved wallet currency USD quote.",
  })
) {}

/**
 * Provenance for a wallet currency USD quote.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const CurrencyUsdPriceQuoteProvenance = S.Union([
  StaticCurrencyUsdPriceQuoteProvenance,
  ProviderCurrencyUsdPriceQuoteProvenance,
]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("CurrencyUsdPriceQuoteProvenance", {
    description: "Provenance for a wallet currency USD quote.",
  })
);

export type CurrencyUsdPriceQuoteProvenance = typeof CurrencyUsdPriceQuoteProvenance.Type;

type CurrencyUsdPriceQuoteInput = {
  readonly currency: WalletCurrencyType;
  readonly usdPrice: string;
  readonly quotedAt: string;
  readonly provenance: typeof CurrencyUsdPriceQuoteProvenance.Encoded;
};

/**
 * Current USD quote for a wallet currency with provenance and timestamp.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CurrencyUsdPriceQuote extends S.Class<CurrencyUsdPriceQuote>($I`CurrencyUsdPriceQuote`)(
  {
    currency: WalletCurrency,
    usdPrice: UsdPrice,
    quotedAt: S.DateTimeUtcFromString,
    provenance: CurrencyUsdPriceQuoteProvenance,
  },
  $I.annote("CurrencyUsdPriceQuote", {
    description: "Current USD quote for a wallet currency with provenance and timestamp.",
  })
) {
  /**
   * Builds a validated USD price quote from encoded provider payloads.
   *
   * @since 0.0.0
   */
  static readonly makeQuote = (input: CurrencyUsdPriceQuoteInput): CurrencyUsdPriceQuote =>
    S.decodeUnknownSync(CurrencyUsdPriceQuote)(input);
}

/**
 * Typed error raised when the scratchpad price resolvers cannot produce a current USD quote.
 *
 * @category Errors
 * @since 0.0.0
 */
export class CurrencyPriceLookupError extends TaggedErrorClass<CurrencyPriceLookupError>($I`CurrencyPriceLookupError`)(
  "CurrencyPriceLookupError",
  {
    currency: WalletCurrency,
    message: S.String,
    providersAttempted: S.Array(PriceApiProvider),
    provider: S.optionalKey(PriceApiProvider),
    cause: S.optionalKey(S.DefectWithStack),
  },
  $I.annote("CurrencyPriceLookupError", {
    description: "Typed error raised when the scratchpad price resolvers cannot produce a current USD quote.",
  })
) {}

const makeLookupError = (options: {
  readonly currency: WalletCurrency;
  readonly message: string;
  readonly providersAttempted: ReadonlyArray<PriceApiProviderType>;
  readonly provider?: undefined | PriceApiProviderType;
  readonly cause?: unknown;
}): CurrencyPriceLookupError =>
  new CurrencyPriceLookupError({
    currency: options.currency,
    message: options.message,
    providersAttempted: [...options.providersAttempted],
    ...(options.provider === undefined ? {} : { provider: options.provider }),
    ...(options.cause === undefined ? {} : { cause: options.cause }),
  });

class WalletCurrencyUsdPriceLookupSuccess extends S.Class<WalletCurrencyUsdPriceLookupSuccess>(
  $I`WalletCurrencyUsdPriceLookupSuccess`
)(
  {
    kind: S.tag("success"),
    quote: CurrencyUsdPriceQuote,
  },
  $I.annote("WalletCurrencyUsdPriceLookupSuccess", {
    description: "Successful USD price lookup outcome for a wallet currency.",
  })
) {}

class WalletCurrencyUsdPriceLookupFailure extends S.Class<WalletCurrencyUsdPriceLookupFailure>(
  $I`WalletCurrencyUsdPriceLookupFailure`
)(
  {
    kind: S.tag("failure"),
    currency: WalletCurrency,
    message: S.String,
    providersAttempted: S.Array(PriceApiProvider),
  },
  $I.annote("WalletCurrencyUsdPriceLookupFailure", {
    description: "Failed USD price lookup outcome for a wallet currency.",
  })
) {}

/**
 * Success or failure outcome for a bulk wallet currency USD price lookup.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const WalletCurrencyUsdPriceLookupResult = S.Union([
  WalletCurrencyUsdPriceLookupSuccess,
  WalletCurrencyUsdPriceLookupFailure,
]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("WalletCurrencyUsdPriceLookupResult", {
    description: "Success or failure outcome for a bulk wallet currency USD price lookup.",
  })
);

export type WalletCurrencyUsdPriceLookupResult = typeof WalletCurrencyUsdPriceLookupResult.Type;

export type WalletCurrencyPriceApiKeys = {
  readonly coinGeckoApiKey: O.Option<Redacted.Redacted>;
  readonly coinApiApiKey: O.Option<Redacted.Redacted>;
  readonly alchemyApiKey: O.Option<Redacted.Redacted>;
};

/**
 * Loads provider API keys for scratchpad wallet currency price lookups from ambient config.
 *
 * @category DomainLogic
 * @since 0.0.0
 */
export const loadWalletCurrencyPriceApiKeys = Config.all({
  coinGeckoApiKey: Config.option(Config.redacted("CRYPTO_COINGECKO_API_KEY")),
  coinApiApiKey: Config.option(Config.redacted("CRYPTO_COINAPI_API_KEY")),
  alchemyApiKey: Config.option(Config.redacted("CRYPTO_ALCHEMY_API_KEY")),
});

export type ResolveWalletCurrencyUsdPriceOptions = {
  readonly apiKeys?: WalletCurrencyPriceApiKeys;
  readonly fetch?: typeof fetch;
};

type RequestJsonOptions<Schema extends S.Top & { readonly DecodingServices: never }> = {
  readonly currency: WalletCurrency;
  readonly provider: PriceApiProviderType;
  readonly providersAttempted: ReadonlyArray<PriceApiProviderType>;
  readonly url: string;
  readonly init?: RequestInit;
  readonly schema: Schema;
  readonly fetchImpl: typeof fetch;
};

const currentIsoTimestamp = (): string => DateTime.formatIso(DateTime.nowUnsafe());

const alchemyNetworkByCryptoNetwork: Record<ExplorerNetwork, string> = {
  ETH: "eth-mainnet",
  BNB: "bnb-mainnet",
  AVALANCHE: "avax-mainnet",
};

const CoinGeckoPriceResponse = S.Record(
  S.String,
  S.Struct({
    usd: S.Number,
    last_updated_at: S.optionalKey(S.Number),
  })
);

const CoinApiExchangeRateResponse = S.Struct({
  time: S.String,
  asset_id_base: S.String,
  asset_id_quote: S.String,
  rate: S.Number,
});

const AlchemyPricePoint = S.Struct({
  currency: S.String,
  value: S.String,
  lastUpdatedAt: S.String,
});

const AlchemySymbolPriceResponse = S.Struct({
  data: S.Array(
    S.Struct({
      symbol: S.String,
      prices: S.Array(AlchemyPricePoint),
      error: S.String.pipe(S.NullOr, S.optionalKey),
    })
  ),
});

const AlchemyAddressPriceResponse = S.Struct({
  data: S.Array(
    S.Struct({
      network: S.String,
      address: S.String,
      prices: S.Array(AlchemyPricePoint),
      error: S.String.pipe(S.NullOr, S.optionalKey),
    })
  ),
});

const requestJson = <Schema extends S.Top & { readonly DecodingServices: never }>(
  options: RequestJsonOptions<Schema>
) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => options.fetchImpl(options.url, options.init),
      catch: (cause) =>
        makeLookupError({
          currency: options.currency,
          provider: options.provider,
          providersAttempted: options.providersAttempted,
          message: `HTTP request failed for ${options.provider}.`,
          cause,
        }),
    });

    const bodyText = yield* Effect.tryPromise({
      try: () => response.text(),
      catch: (cause) =>
        makeLookupError({
          currency: options.currency,
          provider: options.provider,
          providersAttempted: options.providersAttempted,
          message: `Failed to read response body for ${options.provider}.`,
          cause,
        }),
    });

    if (!response.ok) {
      return yield*
        makeLookupError({
          currency: options.currency,
          provider: options.provider,
          providersAttempted: options.providersAttempted,
          message: `${options.provider} returned HTTP ${response.status}: ${bodyText}`,
        })
    }

    const json = yield* S.decodeUnknownEffect(S.UnknownFromJsonString)(bodyText).pipe(
      Effect.mapError((cause) =>
        makeLookupError({
          currency: options.currency,
          provider: options.provider,
          providersAttempted: options.providersAttempted,
          message: `Expected valid JSON from ${options.provider}, received: ${bodyText}`,
          cause,
        })
      )
    );

    return yield* S.decodeUnknownEffect(options.schema)(json).pipe(
      Effect.mapError((cause) =>
        makeLookupError({
          currency: options.currency,
          provider: options.provider,
          providersAttempted: options.providersAttempted,
          message: `Expected ${options.provider} response to match its schema.`,
          cause,
        })
      )
    );
  });

const makeStaticQuote = (currency: "USD"): CurrencyUsdPriceQuote =>
  CurrencyUsdPriceQuote.makeQuote({
    currency,
    usdPrice: "1",
    quotedAt: currentIsoTimestamp(),
    provenance: {
      kind: "static",
      reason: "usd-parity",
    },
  });

const makeProviderQuote = (options: {
  readonly currency: WalletCurrency;
  readonly usdPrice: string;
  readonly quotedAt: string;
  readonly provider: PriceApiProviderType;
  readonly reference: string;
}): CurrencyUsdPriceQuote =>
  CurrencyUsdPriceQuote.makeQuote({
    currency: options.currency,
    usdPrice: options.usdPrice,
    quotedAt: options.quotedAt,
    provenance: {
      kind: "provider",
      provider: options.provider,
      reference: options.reference,
    },
  });

const getCoinApiKey = (
  currency: WalletCurrency,
  providersAttempted: ReadonlyArray<PriceApiProviderType>,
  apiKeys: WalletCurrencyPriceApiKeys
): Effect.Effect<Redacted.Redacted, CurrencyPriceLookupError> =>
  pipe(
    apiKeys.coinApiApiKey,
    O.match({
      onNone: () =>
        Effect.fail(
          makeLookupError({
            currency,
            provider: "coinapi",
            providersAttempted,
            message: "CoinAPI lookup requires CRYPTO_COINAPI_API_KEY.",
          })
        ),
      onSome: Effect.succeed,
    })
  );

const getAlchemyApiKey = (
  currency: WalletCurrency,
  providersAttempted: ReadonlyArray<PriceApiProviderType>,
  apiKeys: WalletCurrencyPriceApiKeys
): Effect.Effect<Redacted.Redacted, CurrencyPriceLookupError> =>
  pipe(
    apiKeys.alchemyApiKey,
    O.match({
      onNone: () =>
        Effect.fail(
          makeLookupError({
            currency,
            provider: "alchemy",
            providersAttempted,
            message: "Alchemy lookup requires CRYPTO_ALCHEMY_API_KEY.",
          })
        ),
      onSome: Effect.succeed,
    })
  );

const resolveCoinGeckoQuote = (options: {
  readonly currency: WalletCurrency;
  readonly coinId: string;
  readonly providersAttempted: ReadonlyArray<PriceApiProviderType>;
  readonly apiKeys: WalletCurrencyPriceApiKeys;
  readonly fetchImpl: typeof fetch;
}): Effect.Effect<CurrencyUsdPriceQuote, CurrencyPriceLookupError> =>
  Effect.gen(function* () {
    const maybeApiKey = options.apiKeys.coinGeckoApiKey;
    const baseUrl = O.isSome(maybeApiKey) ? "https://pro-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3";
    const url = new URL(`${baseUrl}/simple/price`);

    url.searchParams.set("ids", options.coinId);
    url.searchParams.set("vs_currencies", "usd");
    url.searchParams.set("include_last_updated_at", "true");

    const headers: HeadersInit =
      O.isSome(maybeApiKey)
        ? {
            accept: "application/json",
            "x-cg-demo-api-key": Redacted.value(maybeApiKey.value),
            "x-cg-pro-api-key": Redacted.value(maybeApiKey.value),
          }
        : {
            accept: "application/json",
          };

    const response = yield* requestJson({
      currency: options.currency,
      provider: "coingecko",
      providersAttempted: options.providersAttempted,
      url: url.toString(),
      init: {
        headers,
      },
      schema: CoinGeckoPriceResponse,
      fetchImpl: options.fetchImpl,
    });

    const priceEntry = response[options.coinId];

    if (priceEntry === undefined) {
      return yield*
        makeLookupError({
          currency: options.currency,
          provider: "coingecko",
          providersAttempted: options.providersAttempted,
          message: `CoinGecko did not return a USD quote for coin ID ${options.coinId}.`,
        })

    }

    return makeProviderQuote({
      currency: options.currency,
      provider: "coingecko",
      reference: `coin:${options.coinId}`,
      usdPrice: String(priceEntry.usd),
      quotedAt:
        priceEntry.last_updated_at === undefined
          ? currentIsoTimestamp()
          : new Date(priceEntry.last_updated_at * 1000).toISOString(),
    });
  });

const resolveCoinApiQuote = (options: {
  readonly currency: WalletCurrency;
  readonly assetId: string;
  readonly providersAttempted: ReadonlyArray<PriceApiProviderType>;
  readonly apiKeys: WalletCurrencyPriceApiKeys;
  readonly fetchImpl: typeof fetch;
}): Effect.Effect<CurrencyUsdPriceQuote, CurrencyPriceLookupError> =>
  Effect.gen(function* () {
    const apiKey = yield* getCoinApiKey(options.currency, options.providersAttempted, options.apiKeys);
    const response = yield* requestJson({
      currency: options.currency,
      provider: "coinapi",
      providersAttempted: options.providersAttempted,
      url: `https://rest.coinapi.io/v1/exchangerate/${options.assetId}/USD`,
      init: {
        headers: {
          accept: "application/json",
          "X-CoinAPI-Key": Redacted.value(apiKey),
        },
      },
      schema: CoinApiExchangeRateResponse,
      fetchImpl: options.fetchImpl,
    });

    return makeProviderQuote({
      currency: options.currency,
      provider: "coinapi",
      reference: `asset:${options.assetId}`,
      usdPrice: String(response.rate),
      quotedAt: response.time,
    });
  });

const findUsdAlchemyPrice = (prices: ReadonlyArray<typeof AlchemyPricePoint.Type>) =>
  A.findFirst(prices, (price) => price.currency.toLowerCase() === "usd");

const resolveAlchemySymbolQuote = (options: {
  readonly currency: WalletCurrency;
  readonly providersAttempted: ReadonlyArray<PriceApiProviderType>;
  readonly apiKeys: WalletCurrencyPriceApiKeys;
  readonly fetchImpl: typeof fetch;
}): Effect.Effect<CurrencyUsdPriceQuote, CurrencyPriceLookupError> =>
  Effect.gen(function* () {
    const apiKey = yield* getAlchemyApiKey(options.currency, options.providersAttempted, options.apiKeys);
    const url = new URL(`https://api.g.alchemy.com/prices/v1/${Redacted.value(apiKey)}/tokens/by-symbol`);

    url.searchParams.append("symbols", options.currency);

    const response = yield* requestJson({
      currency: options.currency,
      provider: "alchemy",
      providersAttempted: options.providersAttempted,
      url: url.toString(),
      init: {
        headers: {
          accept: "application/json",
        },
      },
      schema: AlchemySymbolPriceResponse,
      fetchImpl: options.fetchImpl,
    });

    const priceEntry = pipe(
      response.data,
      A.findFirst((entry) => entry.symbol === options.currency)
    );

    if (O.isNone(priceEntry)) {
      return yield*
        makeLookupError({
          currency: options.currency,
          provider: "alchemy",
          providersAttempted: options.providersAttempted,
          message: `Alchemy did not return a symbol quote for ${options.currency}.`,
        })

    }

    if (priceEntry.value.error != null) {
      return yield*
        makeLookupError({
          currency: options.currency,
          provider: "alchemy",
          providersAttempted: options.providersAttempted,
          message: `Alchemy returned an error for ${options.currency}: ${priceEntry.value.error}`,
        })

    }

    const usdPrice = findUsdAlchemyPrice(priceEntry.value.prices);

    if (O.isNone(usdPrice)) {
      return yield*
        makeLookupError({
          currency: options.currency,
          provider: "alchemy",
          providersAttempted: options.providersAttempted,
          message: `Alchemy did not include a USD price for symbol ${options.currency}.`,
        })

    }

    return makeProviderQuote({
      currency: options.currency,
      provider: "alchemy",
      reference: `symbol:${options.currency}`,
      usdPrice: usdPrice.value.value,
      quotedAt: usdPrice.value.lastUpdatedAt,
    });
  });

const resolveAlchemyContractQuote = (options: {
  readonly currency: WalletCurrency;
  readonly network: ExplorerNetwork;
  readonly providersAttempted: ReadonlyArray<PriceApiProviderType>;
  readonly apiKeys: WalletCurrencyPriceApiKeys;
  readonly fetchImpl: typeof fetch;
}): Effect.Effect<CurrencyUsdPriceQuote, CurrencyPriceLookupError> =>
  Effect.gen(function* () {
    const apiKey = yield* getAlchemyApiKey(options.currency, options.providersAttempted, options.apiKeys);
    const meta = getCurrencyMeta(options.currency);
    const chainData = pipe(
      meta.chainData,
      A.findFirst((entry) => entry.network === options.network)
    );

    if (O.isNone(chainData)) {
      return yield*
        makeLookupError({
          currency: options.currency,
          provider: "alchemy",
          providersAttempted: options.providersAttempted,
          message: `Alchemy contract lookup for ${options.currency} requires chain data on ${options.network}.`,
        })

    }

    const contract = chainData.value.contract;
    const alchemyNetwork = alchemyNetworkByCryptoNetwork[options.network];
    const body = yield* S.encodeEffect(
      S.fromJsonString(
        S.Struct({
          addresses: S.Array(
            S.Struct({
              network: S.String,
              address: CryptoWalletAddress,
            })
          ),
        })
      )
    )({
      addresses: [
        {
          network: alchemyNetwork,
          address: CryptoWalletAddress.makeUnsafe(contract),
        },
      ],
    }).pipe(
      Effect.mapError(() =>
        makeLookupError({
          currency: options.currency,
          provider: "alchemy",
          providersAttempted: options.providersAttempted,
          message: `Alchemy contract lookup for ${options.currency} requires chain data on ${options.network}.`,
        })
      )
    );

    const response = yield* requestJson({
      currency: options.currency,
      provider: "alchemy",
      providersAttempted: options.providersAttempted,
      url: `https://api.g.alchemy.com/prices/v1/${Redacted.value(apiKey)}/tokens/by-address`,
      init: {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body,
      },
      schema: AlchemyAddressPriceResponse,
      fetchImpl: options.fetchImpl,
    });

    const priceEntry = pipe(
      response.data,
      A.findFirst((entry) => entry.address.toLowerCase() === contract.toLowerCase())
    );

    if (O.isNone(priceEntry)) {
      return yield*
        makeLookupError({
          currency: options.currency,
          provider: "alchemy",
          providersAttempted: options.providersAttempted,
          message: `Alchemy did not return a contract quote for ${options.currency} on ${alchemyNetwork}.`,
        })

    }

    if (priceEntry.value.error != null) {
      return yield* makeLookupError({
          currency: options.currency,
          provider: "alchemy",
          providersAttempted: options.providersAttempted,
          message: `Alchemy returned an error for contract ${contract}: ${priceEntry.value.error}`,
        })

    }

    const usdPrice = findUsdAlchemyPrice(priceEntry.value.prices);

    if (O.isNone(usdPrice)) {
      return yield*
        makeLookupError({
          currency: options.currency,
          provider: "alchemy",
          providersAttempted: options.providersAttempted,
          message: `Alchemy did not include a USD price for contract ${contract}.`,
        })

    }

    return makeProviderQuote({
      currency: options.currency,
      provider: "alchemy",
      reference: `contract:${alchemyNetwork}:${contract}`,
      usdPrice: usdPrice.value.value,
      quotedAt: usdPrice.value.lastUpdatedAt,
    });
  });

const resolvePriceFromProvider = (options: {
  readonly currency: WalletCurrency;
  readonly providerData: PriceProviderData;
  readonly providersAttempted: ReadonlyArray<PriceApiProviderType>;
  readonly apiKeys: WalletCurrencyPriceApiKeys;
  readonly fetchImpl: typeof fetch;
}): Effect.Effect<CurrencyUsdPriceQuote, CurrencyPriceLookupError> => {
  switch (options.providerData.provider) {
    case "coingecko":
      return resolveCoinGeckoQuote({
        currency: options.currency,
        coinId: options.providerData.coinId,
        providersAttempted: options.providersAttempted,
        apiKeys: options.apiKeys,
        fetchImpl: options.fetchImpl,
      });
    case "coinapi":
      return resolveCoinApiQuote({
        currency: options.currency,
        assetId: options.providerData.assetId,
        providersAttempted: options.providersAttempted,
        apiKeys: options.apiKeys,
        fetchImpl: options.fetchImpl,
      });
    case "alchemy":
      return options.providerData.lookup === "symbol"
        ? resolveAlchemySymbolQuote({
            currency: options.currency,
            providersAttempted: options.providersAttempted,
            apiKeys: options.apiKeys,
            fetchImpl: options.fetchImpl,
          })
        : resolveAlchemyContractQuote({
            currency: options.currency,
            network: options.providerData.network,
            providersAttempted: options.providersAttempted,
            apiKeys: options.apiKeys,
            fetchImpl: options.fetchImpl,
          });
  }
};

const resolveFromProviders = (options: {
  readonly currency: WalletCurrency;
  readonly providers: ReadonlyArray<PriceProviderData>;
  readonly attempted: ReadonlyArray<PriceApiProviderType>;
  readonly apiKeys: WalletCurrencyPriceApiKeys;
  readonly fetchImpl: typeof fetch;
}): Effect.Effect<CurrencyUsdPriceQuote, CurrencyPriceLookupError> =>
  pipe(
    options.providers,
    A.match({
      onEmpty: () =>
        Effect.fail(
          makeLookupError({
            currency: options.currency,
            providersAttempted: options.attempted,
            message: `No configured provider could resolve a USD quote for ${options.currency}.`,
          })
        ),
      onNonEmpty: ([providerData, ...rest]) => {
        const attempted = A.append(options.attempted, providerData.provider);

        return resolvePriceFromProvider({
          currency: options.currency,
          providerData,
          providersAttempted: attempted,
          apiKeys: options.apiKeys,
          fetchImpl: options.fetchImpl,
        }).pipe(
          Effect.catch((error) =>
            rest.length === 0
              ? Effect.fail(
                  makeLookupError({
                    currency: options.currency,
                    provider: error.provider,
                    providersAttempted: attempted,
                    message: error.message,
                    cause: error.cause,
                  })
                )
              : resolveFromProviders({
                  currency: options.currency,
                  providers: rest,
                  attempted,
                  apiKeys: options.apiKeys,
                  fetchImpl: options.fetchImpl,
                })
          )
        );
      },
    })
  );

/**
 * Resolves the current USD price for a wallet currency using its preferred provider and fallbacks.
 *
 * @category DomainLogic
 * @since 0.0.0
 */
export const resolveWalletCurrencyUsdPrice = (
  currency: WalletCurrency,
  options?: ResolveWalletCurrencyUsdPriceOptions
): Effect.Effect<CurrencyUsdPriceQuote, CurrencyPriceLookupError> => {
  if (currency === "USD") {
    return Effect.succeed(makeStaticQuote(currency));
  }

  const meta = getCurrencyMeta(currency);

  if (O.isNone(meta.apiData)) {
    return Effect.fail(
      makeLookupError({
        currency,
        providersAttempted: [],
        message: `No price metadata is configured for ${currency}.`,
      })
    );
  }

  const fetchImpl = options?.fetch ?? fetch;
  const providers = [meta.apiData.value.preferred, ...meta.apiData.value.fallbacks];

  return Effect.gen(function* () {
    const apiKeys =
      options?.apiKeys === undefined
        ? yield* Effect.gen(function* () {
            return yield* loadWalletCurrencyPriceApiKeys;
          }).pipe(
            Effect.mapError((cause) =>
              makeLookupError({
                currency,
                providersAttempted: A.empty<PriceApiProvider>(),
                message: `Failed to load price API key configuration for ${currency}.`,
                cause,
              })
            )
          )
        : options.apiKeys;

    return yield* resolveFromProviders({
      currency,
      providers,
      attempted: A.empty<PriceApiProvider>(),
      apiKeys,
      fetchImpl,
    });
  });
};

/**
 * Resolves the current USD price for every configured wallet currency, preserving successes and failures.
 *
 * @category DomainLogic
 * @since 0.0.0
 */
export const resolveAllWalletCurrencyUsdPrices = (
  options?: ResolveWalletCurrencyUsdPriceOptions
): Effect.Effect<ReadonlyArray<WalletCurrencyUsdPriceLookupResult>> =>
  Effect.forEach(WalletCurrencyValues, (currency) =>
    resolveWalletCurrencyUsdPrice(currency, options).pipe(
      Effect.match({
        onFailure: (error) =>
          new WalletCurrencyUsdPriceLookupFailure({
            currency: error.currency,
            message: error.message,
            providersAttempted: error.providersAttempted,
          }),
        onSuccess: (quote) =>
          new WalletCurrencyUsdPriceLookupSuccess({
            quote,
          }),
      })
    )
  );
