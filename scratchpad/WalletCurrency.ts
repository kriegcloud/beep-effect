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
import {CryptoNetwork} from "./index.ts";

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
  static readonly makeMeta = (input: typeof CurrencyMeta.Encoded): CurrencyMeta => pipe(
    Result.try(() => new URL(input.image)),
    Result.flatMap((imageUrl) =>
      S.decodeResult(CurrencyMeta)({
        name: input.name,
        image: imageUrl.toString(),
        apiData: input.apiData ?? {},
      })
    ),
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
 * OMG Network ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const OMG = S.Literal("OMG").pipe(
  S.annotate(
    $I.annote("OMG", {
      description: "OMG Network ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "OMG Network",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/001/728/original.png?1624006432",
      }),
    })
  )
);

/**
 * Runtime type for the OMG Network wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type OMG = typeof OMG.Type;

/**
 * BitClave ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const CAT = S.Literal("CAT").pipe(
  S.annotate(
    $I.annote("CAT", {
      description: "BitClave ticker schema enriched with display metadata for annotation-driven UI use.",
      currencyMeta: CurrencyMeta.makeMeta({
        name: "BitClave",
        image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/002/100/original.png?1544735098",
      }),
    })
  )
);

/**
 * Runtime type for the BitClave wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type CAT = typeof CAT.Type;

/**
 * Streamr DATAcoin ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const DATA = S.Literal("DATA").pipe(
  S.annotate(
      $I.annote("DATA", {
        description: "Streamr DATAcoin ticker schema enriched with display metadata for annotation-driven UI use.",
        currencyMeta: CurrencyMeta.makeMeta({
          name: "Streamr DATAcoin",
          image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/001/961/original.png?1544735052",
        }),
      })
  )
);

/**
 * Runtime type for the Streamr DATAcoin wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type DATA = typeof DATA.Type;

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
        }),
      })
  )
);

/**
 * Runtime type for the Wrapped MEMO wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type WMEMO = typeof WMEMO.Type;

/**
 * MoonDayPlus ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const MD_PLUS = S.Literal("MD+").pipe(
  S.annotate(
      $I.annote("MD+", {
        description: "MoonDayPlus ticker schema enriched with display metadata for annotation-driven UI use.",
        currencyMeta: CurrencyMeta.makeMeta({
          name: "MoonDayPlus",
          image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/022/870/original.png?1612471058",
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
 * Web3 Inu ticker schema enriched with display metadata for annotation-driven UI use.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const WEB3 = S.Literal("WEB3").pipe(
  S.annotate(
      $I.annote("WEB3", {
        description: "Web3 Inu ticker schema enriched with display metadata for annotation-driven UI use.",
        currencyMeta: CurrencyMeta.makeMeta({
          name: "Web3 Inu",
          image: "https://koinly.s3.amazonaws.com/images/currencies/icons/000/141/791/original.png?1641324866",
        }),
      })
  )
);

/**
 * Runtime type for the Web3 Inu wallet currency ticker.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type WEB3 = typeof WEB3.Type;

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
  OMG,
  CAT,
  DATA,
  MIM,
  WMEMO,
  MD_PLUS,
  NMSP,
  GG,
  WEB3,
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
