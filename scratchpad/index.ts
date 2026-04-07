import { $ScratchId } from "@beep/identity";
import { Effect, Config, Tuple, pipe, ServiceMap, Layer} from "effect";
import * as S from "effect/Schema";
import { TaggedErrorClass, CryptoWalletAddressRedacted, LiteralKit} from "@beep/schema";
import { dual } from "effect/Function";

const $I = $ScratchId.create("index");

export class DomainError extends TaggedErrorClass<DomainError>($I`DomainError`)(
  "DomainError",
  {
    message: S.String,
    cause: S.DefectWithStack
  }
) {
  public static readonly make: {
    (cause: unknown, message: string): DomainError,
    (message: string): (cause: unknown) => DomainError
  } =  dual(2, (cause: S.Schema.Type<typeof S.DefectWithStack>, message: string): DomainError => new DomainError({
    cause,
    message
  }));
}

export const CryptoNetwork = LiteralKit(
  [
    "ETH",
    "BNB",
    "AVALANCHE",
    "BTC"
  ]
).pipe(
  $I.annoteSchema("CryptoNetwork", {
    description: "Supported blockchain networks for crypto wallet operations."
  })
);

export type CryptoNetwork = typeof CryptoNetwork.Type;



export const OwnedCryptoWallet = CryptoNetwork.mapMembers((members) => {
  const common = {
    address:  CryptoWalletAddressRedacted,
    name: S.String,
    owner: S.String,
  }

  const make = <T extends CryptoNetwork>(literal: S.Literal<T>) => S.Struct({
      network: S.tag(literal.literal),
      ...common
    })
  return pipe(
    members,
    Tuple.evolve([
      make,
      make,
      make,
      make
    ])
  )
}).pipe(
  S.toTaggedUnion("network"),
  $I.annoteSchema("OwnedCryptoWallet", {
    description: "A crypto wallet with ownership information and network association."
  })
);

export type OwnedCryptoWallet = typeof OwnedCryptoWallet.Type;

export class CryptoServiceConfigShape extends S.Class<CryptoServiceConfigShape>($I`CryptoServiceConfigShape`)(
  {
    beaconchainInApiKey: S.String.pipe(S.Redacted),
    etherScanApiKey: S.String.pipe(S.Redacted),
    cryptoWallets: S.NonEmptyArray(OwnedCryptoWallet)
  }
) {}

const cryptoServiceConfigEffect = Effect.gen(function* () {
  const { etherScanApiKey, beaconchainInApiKey} = yield* Config.all({
    beaconchainInApiKey: Config.redacted("CRYPTO_BEACONCHAIN_IN_API_KEY"),
    etherScanApiKey: Config.redacted("CRYPTO_ETHERSCAN_IN_API_KEY")
  });

  const cryptoWallets = [
    OwnedCryptoWallet.cases.BTC.makeUnsafe(
      {
        name: "TOM TREZOR BTC",
        address: CryptoWalletAddressRedacted.makeRedacted("bc1q0stapewvdxup0p9s3t48l6juyfhtjj8fz77k4k"),
        owner: "TOM"
      }
    ),
      OwnedCryptoWallet.cases.ETH.makeUnsafe(
      {
        name: "TBK RP Node Wallet",
        address: CryptoWalletAddressRedacted.makeRedacted("0xc23B28337896AB92d7e8Ed0303cec0609A58143B"),
        owner: "TBK"
      }
    ),
      OwnedCryptoWallet.cases.ETH.makeUnsafe(
      {
        name: "Ben Orig Wallet",
        address: CryptoWalletAddressRedacted.makeRedacted("0x6f6ab74eD6eB64983BEE610100A1938F1853C2f7"),
        owner: "BEN"
      }
    ),
      OwnedCryptoWallet.cases.ETH.makeUnsafe(
      {
        name: "Ben's Paper Wallet",
        address: CryptoWalletAddressRedacted.makeRedacted("0x86857373a4714194fc83784A5064CdFeca75f2f9"),
        owner: "BEN"
      }
    ),
      OwnedCryptoWallet.cases.ETH.makeUnsafe(
      {
        name: "Tom's Trezor",
        address: CryptoWalletAddressRedacted.makeRedacted("0x544fe14294044733F6A53d1F31f56d7B5E0256b9"),
        owner: "TOM"
      }
    ),
      OwnedCryptoWallet.cases.ETH.makeUnsafe(
      {
        name: "kate's trezor",
        address: CryptoWalletAddressRedacted.makeRedacted("0x562F7909cc7522C87D1c3C53fCf1adbBDC71358E"),
        owner: "KATE"
      }
    ),
      OwnedCryptoWallet.cases.ETH.makeUnsafe(
      {
        name: "ben's trezor",
        address: CryptoWalletAddressRedacted.makeRedacted("0x5FF9c1FC5C3239EDAe60CEbB727EAaB0C8dD298f"),
        owner: "BEN"
      }
    ),
      OwnedCryptoWallet.cases.ETH.makeUnsafe(
      {
        name: "TBK RP Node Wallet",
        address: CryptoWalletAddressRedacted.makeRedacted("0xc23B28337896AB92d7e8Ed0303cec0609A58143B"),
        owner: "TBK"
      }
    ),
      OwnedCryptoWallet.cases.AVALANCHE.makeUnsafe(
      {
        name: "tbk-metamask-2",
        address: CryptoWalletAddressRedacted.makeRedacted("0x7F68038ff73D27b98D2dA633D3e52d5dDCdE3537"),
        owner: "TBK"
      }
    ),
      OwnedCryptoWallet.cases.BNB.makeUnsafe(
      {
        name: "tbk-metamask-2",
        address: CryptoWalletAddressRedacted.makeRedacted("0x7F68038ff73D27b98D2dA633D3e52d5dDCdE3537"),
        owner: "TBK"
      }
    ),
          OwnedCryptoWallet.cases.ETH.makeUnsafe(
      {
        name: "tbk-metamask-2",
        address: CryptoWalletAddressRedacted.makeRedacted("0x7F68038ff73D27b98D2dA633D3e52d5dDCdE3537"),
        owner: "TBK"
      }
    ),
          OwnedCryptoWallet.cases.AVALANCHE.makeUnsafe(
      {
        name: "tbk-metamask-1 (AVAX)",
        address: CryptoWalletAddressRedacted.makeRedacted("0x661D063e916cC8D82F82c56fa7C16bA1D77073dA"),
        owner: "TBK"
      }
    ),
          OwnedCryptoWallet.cases.BNB.makeUnsafe(
      {
        name: "tbk-metamask-1",
        address: CryptoWalletAddressRedacted.makeRedacted("0x661D063e916cC8D82F82c56fa7C16bA1D77073dA"),
        owner: "TBK"
      }
    ),
          OwnedCryptoWallet.cases.ETH.makeUnsafe(
      {
        name: "tbk-metamask-2",
        address: CryptoWalletAddressRedacted.makeRedacted("0x661D063e916cC8D82F82c56fa7C16bA1D77073dA"),
        owner: "TBK"
      }
    )
  ]as const;


  return CryptoServiceConfig.of(new CryptoServiceConfigShape({
    cryptoWallets,
    etherScanApiKey,
    beaconchainInApiKey
    })
  )
}).pipe(Effect.mapError(DomainError.make("Failed to load crypto service" +
  " configuration")))

export class CryptoServiceConfig extends ServiceMap.Service<CryptoServiceConfig, CryptoServiceConfigShape>()($I`CryptoServiceConfig`) {
  static readonly layer = Layer.effect(
    CryptoServiceConfig,
    cryptoServiceConfigEffect
  )
}




