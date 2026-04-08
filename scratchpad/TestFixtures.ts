export const fixtureEvmAddressLowercase = "0x52908400098527886e0f7030069857d2e4169ee7";
export const fixtureEvmAddressChecksummed = "0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE";
export const fixtureBitcoinAddress = "16L5yRNPTuciSgXGHqYwn9N6NeoKqopAu";
export const fixtureValidatorPublicKey =
  "0x94c4002c93ce4911ae929129e444413f0b05ee5b97e5a99a95b609a0e61318332cfd601fc48e3853bf5a1cdd2be5f572";
export const fixtureTransactionHash =
  "0xabababababababababababababababababababababababababababababababab";
export const fixtureMissingPurchaseTransactionHash =
  "0xcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd";

export const fixtureWalletsJson = `[
  {
    "network": "BTC",
    "name": "Alice BTC Vault",
    "address": "${fixtureBitcoinAddress}",
    "owner": "ALICE"
  },
  {
    "network": "ETH",
    "name": "Alice ETH Wallet",
    "address": "${fixtureEvmAddressLowercase}",
    "owner": "ALICE"
  },
  {
    "network": "BNB",
    "name": "Ops BNB Wallet",
    "address": "${fixtureEvmAddressChecksummed}",
    "owner": "OPS"
  }
]`;

export const fixtureRPMinipoolStatusOutputsJson = `{
  "minipools": [
    {
      "address": "${fixtureEvmAddressLowercase}",
      "penalties": 0,
      "status": "staking",
      "status_updated": "2026-04-07, 18:45 +0000 UTC",
      "node_fee_percent": 14.5,
      "node_deposit_eth": 8,
      "rp_eth_assigned": "2026-04-06, 18:45 +0000 UTC",
      "rp_deposit_eth": 16,
      "minipool_balance_el_eth": 1.25,
      "minipool_balance_el_your_portion_eth": 0.625,
      "available_refund_eth": 0.5,
      "total_el_rewards_eth": 0.75,
      "validator_pubkey": "${fixtureValidatorPublicKey}",
      "validator_index": 12345,
      "validator_active": true,
      "beacon_balance_cl_eth": 32,
      "beacon_balance_cl_your_portion_eth": 16,
      "use_latest_delegate": true,
      "delegate_address": "${fixtureEvmAddressChecksummed}",
      "rollback_delegate": null,
      "effective_delegate": "${fixtureEvmAddressChecksummed}"
    }
  ],
  "finalized_minipools_hidden": 0
}`;

export const fixtureKoinlyTransactionsCsv = `ID (read-only),Parent ID (read-only),Date (UTC),Type,Tag,From Wallet (read-only),From Wallet ID,From Amount,From Currency,To Wallet (read-only),To Wallet ID,To Amount,To Currency,Fee Amount,Fee Currency,Net Worth Amount,Net Worth Currency,Fee Worth Amount,Fee Worth Currency,Net Value (read-only),Fee Value (read-only),Value Currency (read-only),Deleted,From Source (read-only),To Source (read-only),Negative Balances (read-only),Missing Rates (read-only),Missing Cost Basis (read-only),Synced To Accounting At (UTC read-only),TxSrc,TxDest,TxHash,Description
770AF28689FFAB912F2353F051CE04DA,,2022-01-11 04:36:39,transfer,,Alice ETH;alice_eth,563023FC99E3BB4080D567C64BAE69E9,10.0,USDC;3054,Exchange Wallet;exchange_wallet,1C1E2D4CC882CE767F89E5C8EC66930A,10.0,USDC;3054,0.0,,10.0,USD;10,,,10.0,0.0,USD;10,false,api,csv,false,false,,,${fixtureEvmAddressLowercase},,${fixtureTransactionHash},Fixture transfer
05A743544C3E45FADB99CE5152379DD8,,2022-01-12 05:10:00,withdrawal,,Treasury Wallet;treasury_wallet,E12E1849081B3971DB3B4F078AC1920F,41.113674,ETH;15114338,,,0.0,,0.0,,2092.07,USD;10,,,2092.07,0.0,USD;10,false,api,,true,false,2092.07,,${fixtureEvmAddressChecksummed},${fixtureEvmAddressLowercase},${fixtureMissingPurchaseTransactionHash},Fixture missing purchase
2A54CC831040E91FAC0C597299CC018B,,2022-01-18 00:24:17,deposit,reward,,,0.0,,Exchange Wallet;exchange_wallet,1C1E2D4CC882CE767F89E5C8EC66930A,23.52954423,USDC;3054,0.0,,23.52954423,USD;10,0.0,,23.52954423,0.0,USD;10,false,,csv,false,false,,,,,,Fixture reward`;

export const fixtureMissingPurchaseTransactionsJson = `{
  "transactions": [
    {
      "id": "32254ABD28588F4BD5E7CA9942E681EA",
      "type": "crypto_withdrawal",
      "from": {
        "amount": "41.113674",
        "currency": {
          "id": 15114338,
          "type": "crypto",
          "symbol": "ETH",
          "name": "ETH",
          "fiat": false,
          "crypto": true,
          "nft": false,
          "token_address": "${fixtureEvmAddressLowercase}"
        },
        "wallet": {
          "id": "E12E1849081B3971DB3B4F078AC1920F",
          "name": "Treasury Wallet",
          "display_address": "${fixtureEvmAddressChecksummed}"
        },
        "cost_basis": "0.0",
        "ledger_id": "D82564106556F3EB0ED04FB44F64A02A",
        "source": "api"
      },
      "to": null,
      "net_value": "2092.07",
      "fee_value": "0.0",
      "date": "2023-05-31T07:53:47.000Z",
      "label": null,
      "description": "Fixture missing purchase transaction",
      "synced": true,
      "manual": false,
      "txhash": "${fixtureMissingPurchaseTransactionHash}",
      "txsrc": "${fixtureEvmAddressChecksummed}",
      "txdest": "${fixtureEvmAddressLowercase}",
      "contract_address": "${fixtureEvmAddressLowercase}",
      "negative_balances": {
        "balance": "-281.213674",
        "amount": "-41.113674",
        "value": "2092.07",
        "symbol": "ETH",
        "ledger_id": "D82564106556F3EB0ED04FB44F64A02A"
      },
      "missing_rates": false,
      "missing_cost_basis": "2092.07",
      "from_source": "api",
      "to_source": null,
      "parent_transaction_id": null,
      "has_children": false,
      "reviewed_at": "2026-03-08T20:03:09.253Z"
    }
  ],
  "meta": {
    "page": 1
  }
}`;

export const scratchpadCryptoFixtureEnv = {
  CRYPTO_BEACONCHAIN_IN_API_KEY: "beaconchain-fixture-key",
  CRYPTO_ETHERSCAN_API_KEY: "etherscan-fixture-key",
  CRYPTO_RP_MINIPOOL_STATUS_OUTPUTS_JSON: fixtureRPMinipoolStatusOutputsJson,
  CRYPTO_TBK_WALLETS_JSON: fixtureWalletsJson,
  CRYPTO_TBK_TRANSACTIONS_CSV: fixtureKoinlyTransactionsCsv,
  CRYPTO_MISSING_PURCHASE_TXNS_JSON: fixtureMissingPurchaseTransactionsJson,
} as const;
