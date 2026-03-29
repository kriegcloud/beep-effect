/**
 * Contains blockchain related constant data.
 *
 * @module @beep/data/crypto
 * @since 0.0.0
 */

/**
 * Common blockchain network ticker metadata.
 *
 * @category Constants
 * @since 0.0.0
 */
export const Networks = {
  Ethereum: {
    ticker: "ETH",
  },
  Solana: {
    ticker: "SOL",
  },
  Bitcoin: {
    ticker: "BTC",
  },
  "BNB Chain": {
    ticker: "BNB",
  },
  Base: {
    ticker: "BASE",
  },
  Tron: {
    ticker: "TRX",
  },
  Arbitrum: {
    ticker: "ARB",
  },
  Avalanche: {
    ticker: "AVAX",
  },
  Polygon: {
    ticker: "POL",
  },
} as const;
