/**
 * Scratchpad-local wallet currency schemas and annotation metadata.
 *
 * @module scratchpad/WalletCurrency
 * @since 0.0.0
 */

import { $ScratchId } from "@beep/identity";
import { OptionFromOptionalNullishKey, TaggedErrorClass } from "@beep/schema";
import { pipe, Result, Tuple} from "effect";
import { dual } from "effect/Function";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {CryptoNetwork} from "./CryptoNetwork.ts";

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
  } = dual(2, (cause: unknown, message: string): InvalidMetaValueError => new InvalidMetaValueError({ cause, message }));
}

class ChainDataBase extends S.Class<ChainDataBase>($I`ChainDataBase`)({
  currencyExplorerUrl: S.URLFromString,
  contract: S.String,
}, $I.annote("ChainDataBase", {
    description: "base metadata fields for a currencies chain",
  })) {}

class CurrencyApiData extends S.Class<CurrencyApiData>($I`CurrencyApiData`)(
  {
    coingeckoUrl: OptionFromOptionalNullishKey(S.URLFromString, { onNoneEncoding: null }),
    coingeckoApiId: S.OptionFromOptionalKey(S.String)
  },
  $I.annote("CurrencyApiData", {
    description: "metadata fields for a currencies price api on coin" +
      " gecko",
  })
) {}

export const CurrencyChainData = CryptoNetwork.mapMembers((members) => {
  const make = <T extends CryptoNetwork>(network: S.Literal<T>) => {
    class schema extends ChainDataBase.extend<schema>(`${network.literal}ChainData`)({
      network: S.tag(network.literal)
    }) {

    }

    return schema
  }

  return pipe(
    members,
    Tuple.evolve(
      [
        make,
        make,
        make,
        make,
      ]
    )
  )
}).pipe(
  S.toTaggedUnion("network")
)

type CurrencyMetaInput = {
  readonly name: string;
  readonly image: string;
  readonly apiData?: typeof CurrencyApiData.Encoded;
  readonly chainData?: ReadonlyArray<typeof CurrencyChainData.Encoded>;
};

type ExplorerNetwork = Exclude<CryptoNetwork, "BTC">;

const explorerBaseUrlByNetwork: Record<ExplorerNetwork, string> = {
  ETH: "https://etherscan.com/token/",
  BNB: "https://bscscan.com/token/",
  AVALANCHE: "https://snowscan.xyz/token/",
};

/**
 * Builds CoinGecko annotation metadata from a coin slug.
 *
 * @since 0.0.0
 */
const makeCoinGeckoApiData = (coingeckoApiId: string): typeof CurrencyApiData.Encoded => ({
  coingeckoApiId,
  coingeckoUrl: `https://www.coingecko.com/en/coins/${coingeckoApiId}`,
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
    apiData: S.OptionFromOptionalKey(CurrencyApiData),
    chainData: CurrencyChainData.pipe(
      S.Array,
      S.withConstructorDefault(() => O.some(A.empty<typeof CurrencyChainData.Type>())),
      S.withDecodingDefaultKey(() => A.empty<typeof CurrencyChainData.Encoded>())
    )
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
  static readonly makeMeta = (input: CurrencyMetaInput): CurrencyMeta => pipe(
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
    Result.getOrThrowWith(
      InvalidMetaValueError.make(`Invalid CurrencyMeta for ${input.name}.`)
    )
  );
}

declare module "effect/Schema" {
  interface Annotations {
    readonly currencyMeta: CurrencyMeta;
  }
}

/**
 * US Dollar ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const USD = S.Literal("USD").pipe(
  S.annotate(
    $I.annote("USD", {
      description: "US Dollar ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "US Dollar",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/000/010/original.png?1544730914",
      }),
    })
  )
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
export const BTC = S.Literal("BTC").pipe(
  S.annotate(
    $I.annote("BTC", {
      description: "Bitcoin ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "Bitcoin",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/000/001/original.png?1544730911",
        apiData: makeCoinGeckoApiData("bitcoin"),
      }),
    })
  )
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
export const ETH = S.Literal("ETH").pipe(
  S.annotate(
    $I.annote("ETH", {
      description: "Ethereum ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "Ethereum",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/000/003/original.png?1750852760",
        apiData: makeCoinGeckoApiData("ethereum"),
      }),
    })
  )
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
export const USDT = S.Literal("USDT").pipe(
  S.annotate(
    $I.annote("USDT", {
      description: "Tether ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "Tether",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/000/008/original.png?1544730913",
        apiData: makeCoinGeckoApiData("tether"),
        chainData: [
          makeChainData("ETH", "0xdac17f958d2ee523a2206206994597c13d831ec7"),
          makeChainData("BNB", "0x55d398326f99059ff775485246999027b3197955"),
          makeChainData("AVALANCHE", "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7"),
        ],
      }),
    })
  )
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
export const BNB = S.Literal("BNB").pipe(
  S.annotate(
    $I.annote("BNB", {
      description: "Binance Coin ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "Binance Coin",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/001/749/original.png?1766133402",
        apiData: makeCoinGeckoApiData("binancecoin"),
      }),
    })
  )
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
export const USDC = S.Literal("USDC").pipe(
  S.annotate(
    $I.annote("USDC", {
      description: "USD Coin ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "USD Coin",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/003/054/original.png?1544735408",
        apiData: makeCoinGeckoApiData("usd-coin"),
        chainData: [
          makeChainData("ETH", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
          makeChainData("BNB", "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"),
          makeChainData("AVALANCHE", "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"),
        ],
      }),
    })
  )
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
export const AVAX = S.Literal("AVAX").pipe(
  S.annotate(
    $I.annote("AVAX", {
      description: "Avalanche ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "Avalanche",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/007/737/original.png?1624005686",
        apiData: makeCoinGeckoApiData("avalanche-2"),
      }),
    })
  )
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
export const CRO = S.Literal("CRO").pipe(
  S.annotate(
    $I.annote("CRO", {
      description: "Cronos ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "Cronos",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/003/219/original.png?1673517333",
        apiData: makeCoinGeckoApiData("crypto-com-chain"),
        chainData: [
          makeChainData("ETH", "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b"),
        ],
      }),
    })
  )
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
export const BUSD = S.Literal("BUSD").pipe(
  S.annotate(
    $I.annote("BUSD", {
      description: "Binance USD ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "Binance USD",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/004/258/original.png?1569029837",
        apiData: makeCoinGeckoApiData("binance-peg-busd"),
        chainData: [
          makeChainData("BNB", "0xe9e7cea3dedca5984780bafc599bd69add087d56"),
        ],
      }),
    })
  )
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
export const RPL = S.Literal("RPL").pipe(
  S.annotate(
    $I.annote("RPL", {
      description: "Rocket Pool ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "Rocket Pool",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/002/630/original.png?1544735277",
        apiData: makeCoinGeckoApiData("rocket-pool"),
        chainData: [
          makeChainData("ETH", "0xd33526068d116ce69f19a9ee46f0bd304f21a51f"),
        ],
      }),
    })
  )
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
export const SPELL = S.Literal("SPELL").pipe(
  S.annotate(
    $I.annote("SPELL", {
      description: "Spell Token ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "Spell Token",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/053/223/original.png?1629196704",
        apiData: makeCoinGeckoApiData("spell-token"),
        chainData: [
          makeChainData("ETH", "0x090185f2135308bad17527004364ebcc2d37e5f6"),
          makeChainData("AVALANCHE", "0xce1bffbd5374dac86a2893119683f4911a2f7814"),
        ],
      }),
    })
  )
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
export const MIM = S.Literal("MIM").pipe(
  S.annotate(
      $I.annote("MIM", {
        description: "Magic Internet Money ticker schema enriched with display metadata for annotation-driven UI use.",
        currencyMeta: CurrencyMeta.makeMeta({
          name: "Magic Internet Money",
          image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/079/475/original.png?1632967012",
          apiData: makeCoinGeckoApiData("magic-internet-money-avalanche"),
          chainData: [
            makeChainData("AVALANCHE", "0x130966628846bfd36ff31a822705796e8cb8c18d"),
          ],
        }),
      })
  )
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
export const WMEMO = S.Literal("WMEMO").pipe(
  S.annotate(
      $I.annote("WMEMO", {
        description: "Wrapped MEMO ticker schema enriched with display metadata for annotation-driven UI use.",
        currencyMeta: CurrencyMeta.makeMeta({
          name: "Wrapped MEMO",
          image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/134/106/original.png?1641806653",
          apiData: makeCoinGeckoApiData("wrapped-memory"),
          chainData: [
            makeChainData("AVALANCHE", "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b"),
          ],
        }),
      })
  )
);

/**
 * Runtime type for the MoonDayPlus wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type MD_PLUS = typeof MD_PLUS.Type;

/**
 * Nemesis DAO ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const NMSP = S.Literal("NMSP").pipe(
  S.annotate(
      $I.annote("NMSP", {
        description: "Nemesis DAO ticker schema enriched with display metadata for annotation-driven UI use.",
        currencyMeta: CurrencyMeta.makeMeta({
          name: "Nemesis DAO",
          image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/036/032/original.png?1731311562",
          chainData: [
            makeChainData("BNB", "0x8ac9dc3358a2db19fdd57f433ff45d1fc357afb3"),
          ],
        }),
      })
  )
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
export const GG = S.Literal("GG").pipe(
  S.annotate(
      $I.annote("GG", {
        description: "GalaxyGoggle DAO ticker schema enriched with display metadata for annotation-driven UI use.",
        currencyMeta: CurrencyMeta.makeMeta({
          name: "GalaxyGoggle DAO",
          image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/022/691/original.png?1638169987",
          chainData: [
            makeChainData("BNB", "0xcaf23964ca8db16d816eb314a56789f58fe0e10e"),
          ],
        }),
      })
  )
);

/**
 * Runtime type for the GalaxyGoggle DAO wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type GG = typeof GG.Type;



/**
 * WETH ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const WETH = S.Literal("WETH").pipe(
  S.annotate(
      $I.annote("WETH", {
        description: "WETH ticker schema enriched with display metadata for annotation-driven UI use.",
        currencyMeta: CurrencyMeta.makeMeta({
          name: "WETH",
          image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/002/155/original.png?1544735115",
          apiData: makeCoinGeckoApiData("weth"),
          chainData: [
            makeChainData("ETH", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
          ],
        }),
      })
  )
);

/**
 * Runtime type for the WETH wallet currency ticker.
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
export const USDC_E = S.Literal("USDC.E").pipe(
  S.annotate(
      $I.annote("USDC.E", {
        description: "Bridged USDC ticker schema enriched with display metadata for annotation-driven UI use.",
        currencyMeta: CurrencyMeta.makeMeta({
          name: "Bridged USDC",
          image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/173/145/original.png?1643717278",
          chainData: [
            makeChainData("AVALANCHE", "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664"),
          ],
        }),
      })
  )
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
export const USDT_E = S.Literal("USDT.E").pipe(
  S.annotate(
      $I.annote("USDT.E", {
        description: "Tether Avalanche Bridged ticker schema enriched with display metadata for annotation-driven UI use.",
        currencyMeta: CurrencyMeta.makeMeta({
          name: "Tether Avalanche Bridged",
          image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/173/121/original.png?1643717436",
          chainData: [
            makeChainData("AVALANCHE", "0xc7198437980c041c805a1edcba50c1ce5db95118"),
          ],
        }),
      })
  )
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
export const BSGG = S.Literal("BSGG").pipe(
  S.annotate(
      $I.annote("BSGG", {
        description: "Betswap.gg ticker schema enriched with display metadata for annotation-driven UI use.",
        currencyMeta: CurrencyMeta.makeMeta({
          name: "Betswap.gg",
          image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/146/602/original.png?1641983021",
          chainData: [
            makeChainData("AVALANCHE", "0x63682bdc5f875e9bf69e201550658492c9763f89"),
          ],
        }),
      })
  )
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
export const BLITZ = S.Literal("BLITZ").pipe(
  S.annotate(
      $I.annote("BLITZ", {
        description: "Blitz Labs ticker schema enriched with display metadata for annotation-driven UI use.",
        currencyMeta: CurrencyMeta.makeMeta({
          name: "Blitz Labs",
          image: "https://koinly.s3.amazonaws.com/images/currencies/icons/004/329/389/original.png?1652358113",
          chainData: [
            makeChainData("BNB", "0xf376807dcdbaa0d7fa86e7c9eacc58d11ad710e4"),
          ],
        }),
      })
  )
);

/**
 * Runtime type for the Blitz Labs wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type BLITZ = typeof BLITZ.Type;


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
