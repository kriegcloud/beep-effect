/**
 * Scratchpad-local wallet currency schemas and annotation metadata.
 *
 * @module scratchpad/WalletCurrency
 * @since 0.0.0
 */

import { $ScratchId, type SegmentValue} from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { pipe, Result, Tuple } from "effect";
import { dual, cast } from "effect/Function";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { CryptoNetwork } from "./CryptoNetwork.ts";

const $I = $ScratchId.create("WalletCurrency");

/**
 * Typed error raised when wallet currency annotation metadata cannot be decoded.
 *
 * @category Errors
 * @since 0.0.0
 */
export class InvalidMetaValueError extends TaggedErrorClass<InvalidMetaValueError>($I`InvalidMetaValueError`)(
  "InvalidMetaValueError",
  {
    cause: S.DefectWithStack,
    message: S.String,
  },
  $I.annote("InvalidMetaValueError", {
    description: "Typed error raised when wallet currency annotation metadata cannot be decoded.",
  })
) {
  /**
   * Constructs an `InvalidMetaValueError` from a cause and a user-facing message.
   *
   * @since 0.0.0
   */
  static readonly make: {
    (cause: unknown, message: string): InvalidMetaValueError;
    (message: string): (cause: unknown) => InvalidMetaValueError;
  } = dual(
    2,
    (cause: unknown, message: string): InvalidMetaValueError => new InvalidMetaValueError({ cause, message })
  );
}

class ChainDataBase extends S.Class<ChainDataBase>($I`ChainDataBase`)(
  {
    currencyExplorerUrl: S.URLFromString,
    contract: S.String,
  },
  $I.annote("ChainDataBase", {
    description: "Base metadata fields for a contract-backed wallet currency chain listing.",
  })
) {}

/**
 * Tagged union of chain-specific contract metadata for wallet currencies.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const CurrencyChainData = CryptoNetwork.mapMembers((members) => {
  const make = <T extends CryptoNetwork>(network: S.Literal<T>) => {
    class Schema extends ChainDataBase.extend<Schema>(`${network.literal}ChainData`)({
      network: S.tag(network.literal),
    }) {}

    return Schema;
  };

  return pipe(
    members,
    Tuple.evolve([
      make,
      make,
      make,
      make,
    ])
  );
}).pipe(
  S.toTaggedUnion("network"),
  $I.annoteSchema("CurrencyChainData", {
    description: "Tagged union of chain-specific contract metadata for wallet currencies.",
  })
);

export type CurrencyChainData = typeof CurrencyChainData.Type;

/**
 * Supported provider identifiers for wallet currency price lookups.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const PriceApiProvider = LiteralKit([
  "coingecko",
  "coinapi",
  "alchemy",
] as const).pipe(
  $I.annoteSchema("PriceApiProvider", {
    description: "Supported provider identifiers for wallet currency price lookups.",
  })
);

export type PriceApiProvider = typeof PriceApiProvider.Type;

/**
 * Supported EVM networks that expose token contract explorer pages and Alchemy contract pricing.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ExplorerNetwork = LiteralKit(["ETH", "BNB", "AVALANCHE"] as const).pipe(
  $I.annoteSchema("ExplorerNetwork", {
    description: "Supported EVM networks that expose token contract explorer pages and Alchemy contract pricing.",
  })
);

export type ExplorerNetwork = typeof ExplorerNetwork.Type;

/**
 * Supported Alchemy lookup strategies for wallet currency price lookups.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const AlchemyPriceLookup = LiteralKit([
  "symbol",
  "contract",
] as const).pipe(
  $I.annoteSchema("AlchemyPriceLookup", {
    description: "Supported Alchemy lookup strategies for wallet currency price lookups.",
  })
);

class CoinGeckoPriceProviderData extends S.Class<CoinGeckoPriceProviderData>($I`CoinGeckoPriceProviderData`)(
  {
    provider: S.tag("coingecko"),
    coinId: S.String,
    coinUrl: S.optionalKey(S.URLFromString),
  },
  $I.annote("CoinGeckoPriceProviderData", {
    description: "CoinGecko-specific lookup metadata for wallet currency prices.",
  })
) {}

class CoinApiPriceProviderData extends S.Class<CoinApiPriceProviderData>($I`CoinApiPriceProviderData`)(
  {
    provider: S.tag("coinapi"),
    assetId: S.String,
  },
  $I.annote("CoinApiPriceProviderData", {
    description: "CoinAPI-specific lookup metadata for wallet currency prices.",
  })
) {}

class AlchemySymbolPriceProviderData extends S.Class<AlchemySymbolPriceProviderData>($I`AlchemySymbolPriceProviderData`)(
  {
    provider: S.tag("alchemy"),
    lookup: S.tag("symbol"),
  },
  $I.annote("AlchemySymbolPriceProviderData", {
    description: "Alchemy symbol-based lookup metadata for wallet currency prices.",
  })
) {}

class AlchemyContractPriceProviderData extends S.Class<AlchemyContractPriceProviderData>(
  $I`AlchemyContractPriceProviderData`
)(
  {
    provider: S.tag("alchemy"),
    lookup: S.tag("contract"),
    network: ExplorerNetwork,
  },
  $I.annote("AlchemyContractPriceProviderData", {
    description: "Alchemy contract-based lookup metadata for wallet currency prices on supported EVM networks.",
  })
) {}

const AlchemyPriceProviderData = S.Union([AlchemySymbolPriceProviderData, AlchemyContractPriceProviderData]).pipe(
  S.toTaggedUnion("lookup"),
  $I.annoteSchema("AlchemyPriceProviderData", {
    description: "Alchemy-specific lookup metadata for wallet currency prices.",
  })
);

/**
 * Tagged union of provider-specific lookup metadata for wallet currency prices.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const PriceProviderData = S.Union([
  CoinGeckoPriceProviderData,
  CoinApiPriceProviderData,
  AlchemyPriceProviderData,
]).pipe(
  $I.annoteSchema("PriceProviderData", {
    description: "Tagged union of provider-specific lookup metadata for wallet currency prices.",
  })
);

export type PriceProviderData = typeof PriceProviderData.Type;

export class CurrencyPriceApiData extends S.Class<CurrencyPriceApiData>($I`CurrencyPriceApiData`)(
  {
    preferred: PriceProviderData,
    fallbacks: PriceProviderData.pipe(
      S.Array,
      S.withConstructorDefault(() => O.some(A.empty<typeof PriceProviderData.Type>())),
      S.withDecodingDefaultKey(() => A.empty<typeof PriceProviderData.Encoded>())
    ),
  },
  $I.annote("CurrencyPriceApiData", {
    description: "Preferred and fallback provider metadata used to resolve wallet currency prices.",
  })
) {}

type PriceProviderDataInput = typeof PriceProviderData.Encoded;

type CurrencyPriceApiDataInput = {
  readonly preferred: PriceProviderDataInput;
  readonly fallbacks?: ReadonlyArray<PriceProviderDataInput>;
};

type CurrencyMetaInput = {
  readonly name: string;
  readonly image: string;
  readonly apiData?: typeof CurrencyPriceApiData.Encoded;
  readonly chainData?: ReadonlyArray<typeof CurrencyChainData.Encoded>;
};

export const WalletCurrencyValues = [
  "USD",
  "BTC",
  "ETH",
  "USDT",
  "BNB",
  "USDC",
  "AVAX",
  "CRO",
  "BUSD",
  "RPL",
  "SPELL",
  "MIM",
  "WMEMO",
  "NMSP",
  "GG",
  "WETH",
  "USDC.E",
  "USDT.E",
  "BSGG",
  "BLITZ",
  "TIME",
  "CROWN",
  "ANYUSDC",
  "ANYWMEMO",
  "CAKE-LP",
  "ENS #75614266978991624134891334910236910127142463849800469011228050864594955232439",
  "JLP",
  "MEMO",
  "SCROWN",
  "SGG",
  "SNMS",
  "THRONE",
  "THRONENODE #4172",
  "THRONENODE #4196",
  "THRONENODE #4204",
  "THRONENODE #4211",
  "THRONENODE #7693",
  "THRONENODE #4071",
  "THRONENODE #4085",
  "THRONENODE #4098",
  "THRONENODE #4115",
  "THRONENODE #4122",
  "THRONENODE #4134",
  "THRONENODE #4141",
  "THRONENODE #4149",
  "THRONENODE #4158",
  "THRONENODE #4182",
  "THRONENODE #4189",
  "WSGG",
  "WSNMS",
] as const;

export type WalletCurrencyCode = (typeof WalletCurrencyValues)[number];

const explorerBaseUrlByNetwork: Record<ExplorerNetwork, string> = {
  ETH: "https://etherscan.com/token/",
  BNB: "https://bscscan.com/token/",
  AVALANCHE: "https://snowscan.xyz/token/",
};

/**
 * Builds CoinGecko provider metadata from a coin slug.
 *
 * @since 0.0.0
 */
const makeCoinGeckoProvider = (coinId: string): PriceProviderDataInput => ({
  provider: "coingecko",
  coinId,
  coinUrl: `https://www.coingecko.com/en/coins/${coinId}`,
});

/**
 * Builds CoinAPI provider metadata from a CoinAPI asset ID.
 *
 * @since 0.0.0
 */
const makeCoinApiProvider = (assetId: string): PriceProviderDataInput => ({
  provider: "coinapi",
  assetId,
});

/**
 * Builds Alchemy provider metadata keyed by the wallet currency symbol.
 *
 * @since 0.0.0
 */
const makeAlchemySymbolProvider = (): PriceProviderDataInput => ({
  provider: "alchemy",
  lookup: "symbol",
});

/**
 * Builds Alchemy provider metadata keyed by a contract-bearing network.
 *
 * @since 0.0.0
 */
const makeAlchemyContractProvider = (network: ExplorerNetwork): PriceProviderDataInput => ({
  provider: "alchemy",
  lookup: "contract",
  network,
});

/**
 * Builds provider metadata with a preferred provider and ordered fallbacks.
 *
 * @since 0.0.0
 */
const makePriceApiData = (input: CurrencyPriceApiDataInput): typeof CurrencyPriceApiData.Encoded => ({
  preferred: input.preferred,
  fallbacks: input.fallbacks ?? [],
});

/**
 * Builds contract-backed chain metadata with its canonical block explorer URL.
 *
 * @since 0.0.0
 */
const makeChainData = <T extends ExplorerNetwork>(network: T, contract: string): typeof CurrencyChainData.Encoded => ({
  network,
  contract,
  currencyExplorerUrl: `${explorerBaseUrlByNetwork[network]}${contract}`,
});

/**
 * Display metadata attached to wallet currency schema annotations.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CurrencyMeta extends S.Class<CurrencyMeta>($I`CurrencyMeta`)(
  {
    name: S.String,
    image: S.URLFromString,
    apiData: S.OptionFromOptionalKey(CurrencyPriceApiData),
    chainData: CurrencyChainData.pipe(
      S.Array,
      S.withConstructorDefault(() => O.some(A.empty<typeof CurrencyChainData.Type>())),
      S.withDecodingDefaultKey(() => A.empty<typeof CurrencyChainData.Encoded>())
    ),
  },
  $I.annote("CurrencyMeta", {
    description: "Display metadata attached to wallet currency schema annotations.",
  })
) {
  /**
   * Decodes display metadata from structured input including optional API and chain data.
   *
   * @since 0.0.0
   */
  static readonly makeMeta = (input: CurrencyMetaInput): CurrencyMeta =>
    pipe(
      Result.try(() => new URL(input.image)),
      Result.flatMap((imageUrl) => {
        const encoded: typeof CurrencyMeta.Encoded = {
          name: input.name,
          image: imageUrl.toString(),
          chainData: input.chainData ?? [],
          ...(input.apiData === undefined ? {} : { apiData: input.apiData }),
        };

        return S.decodeResult(CurrencyMeta)(encoded);
      }),
      Result.getOrThrowWith(InvalidMetaValueError.make(`Invalid CurrencyMeta for ${input.name}.`))
    );
}

export const WalletCurrencyMetaByTicker: Readonly<Record<WalletCurrencyCode, CurrencyMeta>> = {
  USD: CurrencyMeta.makeMeta({
    name: "US Dollar",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/000/010/original.png?1544730914",
  }),
  BTC: CurrencyMeta.makeMeta({
    name: "Bitcoin",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/000/001/original.png?1544730911",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("bitcoin"),
      fallbacks: [
        makeCoinApiProvider("BTC"),
        makeAlchemySymbolProvider(),
      ],
    }),
  }),
  ETH: CurrencyMeta.makeMeta({
    name: "Ethereum",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/000/003/original.png?1750852760",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("ethereum"),
      fallbacks: [
        makeCoinApiProvider("ETH"),
        makeAlchemySymbolProvider(),
      ],
    }),
  }),
  USDT: CurrencyMeta.makeMeta({
    name: "Tether",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/000/008/original.png?1544730913",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("tether"),
      fallbacks: [
        makeCoinApiProvider("USDT"),
        makeAlchemyContractProvider("ETH"),
      ],
    }),
    chainData: [
      makeChainData("ETH", "0xdac17f958d2ee523a2206206994597c13d831ec7"),
      makeChainData("BNB", "0x55d398326f99059ff775485246999027b3197955"),
      makeChainData("AVALANCHE", "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7"),
    ],
  }),
  BNB: CurrencyMeta.makeMeta({
    name: "Binance Coin",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/001/749/original.png?1766133402",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("binancecoin"),
      fallbacks: [
        makeCoinApiProvider("BNB"),
        makeAlchemySymbolProvider(),
      ],
    }),
  }),
  USDC: CurrencyMeta.makeMeta({
    name: "USD Coin",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/003/054/original.png?1544735408",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("usd-coin"),
      fallbacks: [
        makeCoinApiProvider("USDC"),
        makeAlchemyContractProvider("ETH"),
      ],
    }),
    chainData: [
      makeChainData("ETH", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      makeChainData("BNB", "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"),
      makeChainData("AVALANCHE", "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"),
    ],
  }),
  AVAX: CurrencyMeta.makeMeta({
    name: "Avalanche",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/007/737/original.png?1624005686",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("avalanche-2"),
      fallbacks: [
        makeCoinApiProvider("AVAX"),
        makeAlchemySymbolProvider(),
      ],
    }),
  }),
  CRO: CurrencyMeta.makeMeta({
    name: "Cronos",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/003/219/original.png?1673517333",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("crypto-com-chain"),
      fallbacks: [
        makeCoinApiProvider("CRO"),
        makeAlchemyContractProvider("ETH"),
      ],
    }),
    chainData: [
      makeChainData("ETH", "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b"),
    ],
  }),
  BUSD: CurrencyMeta.makeMeta({
    name: "Binance USD",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/004/258/original.png?1569029837",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("binance-peg-busd"),
      fallbacks: [
        makeCoinApiProvider("BUSD"),
        makeAlchemyContractProvider("BNB"),
      ],
    }),
    chainData: [
      makeChainData("BNB", "0xe9e7cea3dedca5984780bafc599bd69add087d56"),
    ],
  }),
  RPL: CurrencyMeta.makeMeta({
    name: "Rocket Pool",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/002/630/original.png?1544735277",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("rocket-pool"),
      fallbacks: [
        makeCoinApiProvider("RPL"),
        makeAlchemyContractProvider("ETH"),
      ],
    }),
    chainData: [
      makeChainData("ETH", "0xd33526068d116ce69f19a9ee46f0bd304f21a51f"),
    ],
  }),
  SPELL: CurrencyMeta.makeMeta({
    name: "Spell Token",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/053/223/original.png?1629196704",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("spell-token"),
      fallbacks: [
        makeCoinApiProvider("SPELL"),
        makeAlchemyContractProvider("ETH"),
      ],
    }),
    chainData: [
      makeChainData("ETH", "0x090185f2135308bad17527004364ebcc2d37e5f6"),
      makeChainData("AVALANCHE", "0xce1bffbd5374dac86a2893119683f4911a2f7814"),
    ],
  }),
  MIM: CurrencyMeta.makeMeta({
    name: "Magic Internet Money",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/079/475/original.png?1632967012",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("magic-internet-money-avalanche"),
      fallbacks: [
        makeCoinApiProvider("MIM"),
        makeAlchemyContractProvider("AVALANCHE"),
      ],
    }),
    chainData: [
      makeChainData("AVALANCHE", "0x130966628846bfd36ff31a822705796e8cb8c18d"),
    ],
  }),
  WMEMO: CurrencyMeta.makeMeta({
    name: "Wrapped MEMO",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/134/106/original.png?1641806653",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("wrapped-memory"),
      fallbacks: [
        makeAlchemyContractProvider("AVALANCHE"),
      ],
    }),
    chainData: [
      makeChainData("AVALANCHE", "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b"),
    ],
  }),
  NMSP: CurrencyMeta.makeMeta({
    name: "Nemesis DAO",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/036/032/original.png?1731311562",
    apiData: makePriceApiData({
      preferred: makeAlchemyContractProvider("BNB"),
    }),
    chainData: [
      makeChainData("BNB", "0x8ac9dc3358a2db19fdd57f433ff45d1fc357afb3"),
    ],
  }),
  GG: CurrencyMeta.makeMeta({
    name: "GalaxyGoggle DAO",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/022/691/original.png?1638169987",
    apiData: makePriceApiData({
      preferred: makeAlchemyContractProvider("BNB"),
    }),
    chainData: [
      makeChainData("BNB", "0xcaf23964ca8db16d816eb314a56789f58fe0e10e"),
    ],
  }),
  WETH: CurrencyMeta.makeMeta({
    name: "Wrapped Ether",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/002/155/original.png?1544735115",
    apiData: makePriceApiData({
      preferred: makeCoinGeckoProvider("weth"),
      fallbacks: [
        makeCoinApiProvider("WETH"),
        makeAlchemyContractProvider("ETH"),
      ],
    }),
    chainData: [
      makeChainData("ETH", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
    ],
  }),
  "USDC.E": CurrencyMeta.makeMeta({
    name: "Bridged USDC",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/173/145/original.png?1643717278",
    apiData: makePriceApiData({
      preferred: makeAlchemyContractProvider("AVALANCHE"),
    }),
    chainData: [
      makeChainData("AVALANCHE", "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664"),
    ],
  }),
  "USDT.E": CurrencyMeta.makeMeta({
    name: "Tether Avalanche Bridged",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/173/121/original.png?1643717436",
    apiData: makePriceApiData({
      preferred: makeAlchemyContractProvider("AVALANCHE"),
    }),
    chainData: [
      makeChainData("AVALANCHE", "0xc7198437980c041c805a1edcba50c1ce5db95118"),
    ],
  }),
  BSGG: CurrencyMeta.makeMeta({
    name: "Betswap.gg",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/146/602/original.png?1641983021",
    apiData: makePriceApiData({
      preferred: makeAlchemyContractProvider("AVALANCHE"),
    }),
    chainData: [
      makeChainData("AVALANCHE", "0x63682bdc5f875e9bf69e201550658492c9763f89"),
    ],
  }),
  BLITZ: CurrencyMeta.makeMeta({
    name: "Blitz Labs",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/004/329/389/original.png?1652358113",
    apiData: makePriceApiData({
      preferred: makeAlchemyContractProvider("BNB"),
    }),
    chainData: [
      makeChainData("BNB", "0xf376807dcdbaa0d7fa86e7c9eacc58d11ad710e4"),
    ],
  }),
  TIME: CurrencyMeta.makeMeta({
    name: "Wonderland",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/006/159/original.png?1630624630",
  }),
  CROWN: CurrencyMeta.makeMeta({
    name: "MidasDAO CROWN",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/010/555/original.png?1643320340",
  }),
  ANYUSDC: CurrencyMeta.makeMeta({
    name: "Anyswap USDC",
    image: "https://app.koinly.io/missing/currencies.png",
  }),
  ANYWMEMO: CurrencyMeta.makeMeta({
    name: "Anyswap Wrapped MEMO",
    image: "https://app.koinly.io/missing/currencies.png",
  }),
  "CAKE-LP": CurrencyMeta.makeMeta({
    name: "Pancake LPs - 0x6b0a...9509aa",
    image: "https://app.koinly.io/missing/lp.png",
  }),
  "ENS #75614266978991624134891334910236910127142463849800469011228050864594955232439": CurrencyMeta.makeMeta({
    name: "Ethereum Name Service - 0x57f1...47ea85",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  JLP: CurrencyMeta.makeMeta({
    name: "Joe LP Token - 0x3f0d...bcdcc3",
    image: "https://app.koinly.io/missing/lp.png",
  }),
  MEMO: CurrencyMeta.makeMeta({
    name: "MEMOries",
    image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/178/140/original.png?1643796342",
  }),
  SCROWN: CurrencyMeta.makeMeta({
    name: "Staked MidasDAO",
    image: "https://app.koinly.io/missing/currencies.png",
  }),
  SGG: CurrencyMeta.makeMeta({
    name: "Staked GalaxyGoggle",
    image: "https://app.koinly.io/missing/currencies.png",
  }),
  SNMS: CurrencyMeta.makeMeta({
    name: "Staked Nemesis",
    image: "https://app.koinly.io/missing/currencies.png",
  }),
  THRONE: CurrencyMeta.makeMeta({
    name: "Wrapped sCROWN",
    image: "https://app.koinly.io/missing/currencies.png",
  }),
  "THRONENODE #4172": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4196": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4204": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4211": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #7693": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4071": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4085": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4098": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4115": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4122": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4134": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4141": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4149": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4158": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4182": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  "THRONENODE #4189": CurrencyMeta.makeMeta({
    name: "THRONE nodes - 0x2c64...db526d",
    image: "https://app.koinly.io/missing/nft.png",
  }),
  WSGG: CurrencyMeta.makeMeta({
    name: "Wrapped sGG",
    image: "https://app.koinly.io/missing/currencies.png",
  }),
  WSNMS: CurrencyMeta.makeMeta({
    name: "Wrapped sNMS",
    image: "https://app.koinly.io/missing/currencies.png",
  }),
};

/**
 * Gets the annotation metadata for a wallet currency literal.
 *
 * @category DomainLogic
 * @since 0.0.0
 */
export const getCurrencyMeta = (currency: WalletCurrencyCode): CurrencyMeta => WalletCurrencyMetaByTicker[currency];

declare module "effect/Schema" {
  interface Annotations {
    readonly currencyMeta: CurrencyMeta;
  }
}

const makeWalletCurrencyLiteral = <T extends WalletCurrencyCode>(literal: T, description: string): S.Literal<T> =>
  S.Literal(literal).pipe(
    $I.annoteSchema(cast<T, SegmentValue<T>>(literal), {
      description,
      currencyMeta: getCurrencyMeta(literal),
    })
  );

/**
 * US Dollar ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const USD = makeWalletCurrencyLiteral(
  "USD",
  "US Dollar ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the US Dollar wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type USD = typeof USD.Type;

/**
 * Bitcoin ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const BTC = makeWalletCurrencyLiteral(
  "BTC",
  "Bitcoin ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Bitcoin wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type BTC = typeof BTC.Type;

/**
 * Ethereum ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ETH = makeWalletCurrencyLiteral(
  "ETH",
  "Ethereum ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Ethereum wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ETH = typeof ETH.Type;

/**
 * Tether ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const USDT = makeWalletCurrencyLiteral(
  "USDT",
  "Tether ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Tether wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type USDT = typeof USDT.Type;

/**
 * Binance Coin ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const BNB = makeWalletCurrencyLiteral(
  "BNB",
  "Binance Coin ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Binance Coin wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type BNB = typeof BNB.Type;

/**
 * USD Coin ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const USDC = makeWalletCurrencyLiteral(
  "USDC",
  "USD Coin ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the USD Coin wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type USDC = typeof USDC.Type;

/**
 * Avalanche ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const AVAX = makeWalletCurrencyLiteral(
  "AVAX",
  "Avalanche ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Avalanche wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type AVAX = typeof AVAX.Type;

/**
 * Cronos ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const CRO = makeWalletCurrencyLiteral(
  "CRO",
  "Cronos ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Cronos wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type CRO = typeof CRO.Type;

/**
 * Binance USD ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const BUSD = makeWalletCurrencyLiteral(
  "BUSD",
  "Binance USD ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Binance USD wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type BUSD = typeof BUSD.Type;

/**
 * Rocket Pool ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const RPL = makeWalletCurrencyLiteral(
  "RPL",
  "Rocket Pool ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Rocket Pool wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type RPL = typeof RPL.Type;

/**
 * Spell Token ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const SPELL = makeWalletCurrencyLiteral(
  "SPELL",
  "Spell Token ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Spell Token wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type SPELL = typeof SPELL.Type;

/**
 * Magic Internet Money ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const MIM = makeWalletCurrencyLiteral(
  "MIM",
  "Magic Internet Money ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Magic Internet Money wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type MIM = typeof MIM.Type;

/**
 * Wrapped MEMO ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const WMEMO = makeWalletCurrencyLiteral(
  "WMEMO",
  "Wrapped MEMO ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Wrapped MEMO wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type WMEMO = typeof WMEMO.Type;

/**
 * Nemesis DAO ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const NMSP = makeWalletCurrencyLiteral(
  "NMSP",
  "Nemesis DAO ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Nemesis DAO wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type NMSP = typeof NMSP.Type;

/**
 * GalaxyGoggle DAO ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const GG = makeWalletCurrencyLiteral(
  "GG",
  "GalaxyGoggle DAO ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the GalaxyGoggle DAO wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type GG = typeof GG.Type;

/**
 * Wrapped Ether ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const WETH = makeWalletCurrencyLiteral(
  "WETH",
  "Wrapped Ether ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Wrapped Ether wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type WETH = typeof WETH.Type;

/**
 * Bridged USDC ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const USDC_E = makeWalletCurrencyLiteral(
  "USDC.E",
  "Bridged USDC ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Bridged USDC wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type USDC_E = typeof USDC_E.Type;

/**
 * Tether Avalanche Bridged ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const USDT_E = makeWalletCurrencyLiteral(
  "USDT.E",
  "Tether Avalanche Bridged ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Tether Avalanche Bridged wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type USDT_E = typeof USDT_E.Type;

/**
 * Betswap.gg ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const BSGG = makeWalletCurrencyLiteral(
  "BSGG",
  "Betswap.gg ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Betswap.gg wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type BSGG = typeof BSGG.Type;

/**
 * Blitz Labs ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const BLITZ = makeWalletCurrencyLiteral(
  "BLITZ",
  "Blitz Labs ticker schema enriched with display metadata for annotation-driven UI use."
);

/**
 * Runtime type for the Blitz Labs wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type BLITZ = typeof BLITZ.Type;

/**
 * Additional wallet currency ticker schemas synchronized from `currencies.json`.
 *
 * These entries currently carry display metadata only until provider metadata is
 * added for them.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const TIME = makeWalletCurrencyLiteral(
  "TIME",
  "TIME ticker schema enriched with display metadata for annotation-driven UI use."
);

export type TIME = typeof TIME.Type;

export const CROWN = makeWalletCurrencyLiteral(
  "CROWN",
  "CROWN ticker schema enriched with display metadata for annotation-driven UI use."
);

export type CROWN = typeof CROWN.Type;

export const ANYUSDC = makeWalletCurrencyLiteral(
  "ANYUSDC",
  "ANYUSDC ticker schema enriched with display metadata for annotation-driven UI use."
);

export type ANYUSDC = typeof ANYUSDC.Type;

export const ANYWMEMO = makeWalletCurrencyLiteral(
  "ANYWMEMO",
  "ANYWMEMO ticker schema enriched with display metadata for annotation-driven UI use."
);

export type ANYWMEMO = typeof ANYWMEMO.Type;

export const CAKE_LP = makeWalletCurrencyLiteral(
  "CAKE-LP",
  "CAKE-LP ticker schema enriched with display metadata for annotation-driven UI use."
);

export type CAKE_LP = typeof CAKE_LP.Type;

export const ENS_75614266978991624134891334910236910127142463849800469011228050864594955232439 = makeWalletCurrencyLiteral(
  "ENS #75614266978991624134891334910236910127142463849800469011228050864594955232439",
  "ENS #75614266978991624134891334910236910127142463849800469011228050864594955232439 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type ENS_75614266978991624134891334910236910127142463849800469011228050864594955232439 =
  typeof ENS_75614266978991624134891334910236910127142463849800469011228050864594955232439.Type;

export const JLP = makeWalletCurrencyLiteral(
  "JLP",
  "JLP ticker schema enriched with display metadata for annotation-driven UI use."
);

export type JLP = typeof JLP.Type;

export const MEMO = makeWalletCurrencyLiteral(
  "MEMO",
  "MEMO ticker schema enriched with display metadata for annotation-driven UI use."
);

export type MEMO = typeof MEMO.Type;

export const SCROWN = makeWalletCurrencyLiteral(
  "SCROWN",
  "SCROWN ticker schema enriched with display metadata for annotation-driven UI use."
);

export type SCROWN = typeof SCROWN.Type;

export const SGG = makeWalletCurrencyLiteral(
  "SGG",
  "SGG ticker schema enriched with display metadata for annotation-driven UI use."
);

export type SGG = typeof SGG.Type;

export const SNMS = makeWalletCurrencyLiteral(
  "SNMS",
  "SNMS ticker schema enriched with display metadata for annotation-driven UI use."
);

export type SNMS = typeof SNMS.Type;

export const THRONE = makeWalletCurrencyLiteral(
  "THRONE",
  "THRONE ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONE = typeof THRONE.Type;

export const THRONENODE_4172 = makeWalletCurrencyLiteral(
  "THRONENODE #4172",
  "THRONENODE #4172 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4172 = typeof THRONENODE_4172.Type;

export const THRONENODE_4196 = makeWalletCurrencyLiteral(
  "THRONENODE #4196",
  "THRONENODE #4196 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4196 = typeof THRONENODE_4196.Type;

export const THRONENODE_4204 = makeWalletCurrencyLiteral(
  "THRONENODE #4204",
  "THRONENODE #4204 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4204 = typeof THRONENODE_4204.Type;

export const THRONENODE_4211 = makeWalletCurrencyLiteral(
  "THRONENODE #4211",
  "THRONENODE #4211 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4211 = typeof THRONENODE_4211.Type;

export const THRONENODE_7693 = makeWalletCurrencyLiteral(
  "THRONENODE #7693",
  "THRONENODE #7693 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_7693 = typeof THRONENODE_7693.Type;

export const THRONENODE_4071 = makeWalletCurrencyLiteral(
  "THRONENODE #4071",
  "THRONENODE #4071 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4071 = typeof THRONENODE_4071.Type;

export const THRONENODE_4085 = makeWalletCurrencyLiteral(
  "THRONENODE #4085",
  "THRONENODE #4085 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4085 = typeof THRONENODE_4085.Type;

export const THRONENODE_4098 = makeWalletCurrencyLiteral(
  "THRONENODE #4098",
  "THRONENODE #4098 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4098 = typeof THRONENODE_4098.Type;

export const THRONENODE_4115 = makeWalletCurrencyLiteral(
  "THRONENODE #4115",
  "THRONENODE #4115 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4115 = typeof THRONENODE_4115.Type;

export const THRONENODE_4122 = makeWalletCurrencyLiteral(
  "THRONENODE #4122",
  "THRONENODE #4122 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4122 = typeof THRONENODE_4122.Type;

export const THRONENODE_4134 = makeWalletCurrencyLiteral(
  "THRONENODE #4134",
  "THRONENODE #4134 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4134 = typeof THRONENODE_4134.Type;

export const THRONENODE_4141 = makeWalletCurrencyLiteral(
  "THRONENODE #4141",
  "THRONENODE #4141 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4141 = typeof THRONENODE_4141.Type;

export const THRONENODE_4149 = makeWalletCurrencyLiteral(
  "THRONENODE #4149",
  "THRONENODE #4149 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4149 = typeof THRONENODE_4149.Type;

export const THRONENODE_4158 = makeWalletCurrencyLiteral(
  "THRONENODE #4158",
  "THRONENODE #4158 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4158 = typeof THRONENODE_4158.Type;

export const THRONENODE_4182 = makeWalletCurrencyLiteral(
  "THRONENODE #4182",
  "THRONENODE #4182 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4182 = typeof THRONENODE_4182.Type;

export const THRONENODE_4189 = makeWalletCurrencyLiteral(
  "THRONENODE #4189",
  "THRONENODE #4189 ticker schema enriched with display metadata for annotation-driven UI use."
);

export type THRONENODE_4189 = typeof THRONENODE_4189.Type;

export const WSGG = makeWalletCurrencyLiteral(
  "WSGG",
  "WSGG ticker schema enriched with display metadata for annotation-driven UI use."
);

export type WSGG = typeof WSGG.Type;

export const WSNMS = makeWalletCurrencyLiteral(
  "WSNMS",
  "WSNMS ticker schema enriched with display metadata for annotation-driven UI use."
);

export type WSNMS = typeof WSNMS.Type;

/**
 * Union schema of all supported wallet currency tickers.
 *
 * Each member is a reusable literal schema annotated with display metadata for
 * annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const WalletCurrency = S.Union([
  USD,
  BTC,
  ETH,
  USDT,
  BNB,
  USDC,
  AVAX,
  CRO,
  BUSD,
  RPL,
  SPELL,
  MIM,
  WMEMO,
  NMSP,
  GG,
  WETH,
  USDC_E,
  USDT_E,
  BSGG,
  BLITZ,
  TIME,
  CROWN,
  ANYUSDC,
  ANYWMEMO,
  CAKE_LP,
  ENS_75614266978991624134891334910236910127142463849800469011228050864594955232439,
  JLP,
  MEMO,
  SCROWN,
  SGG,
  SNMS,
  THRONE,
  THRONENODE_4172,
  THRONENODE_4196,
  THRONENODE_4204,
  THRONENODE_4211,
  THRONENODE_7693,
  THRONENODE_4071,
  THRONENODE_4085,
  THRONENODE_4098,
  THRONENODE_4115,
  THRONENODE_4122,
  THRONENODE_4134,
  THRONENODE_4141,
  THRONENODE_4149,
  THRONENODE_4158,
  THRONENODE_4182,
  THRONENODE_4189,
  WSGG,
  WSNMS,
]).pipe(
  $I.annoteSchema("WalletCurrency", {
    description: "Union schema of all supported wallet currency tickers composed from annotated literal member schemas.",
  })
);

/**
 * Runtime type for the supported wallet currency ticker union.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type WalletCurrency = typeof WalletCurrency.Type;
