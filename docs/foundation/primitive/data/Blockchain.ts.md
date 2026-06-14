---
title: Blockchain.ts
nav_order: 1
parent: "@beep/data"
---

## Blockchain.ts overview

Common blockchain network ticker metadata.

**Example**

```ts
```typescript
import { Blockchain } from "@beep/data"

const ethTicker = Blockchain.Networks.Ethereum.ticker
console.log(ethTicker) // "ETH"

const btcTicker = Blockchain.Networks.Bitcoin.ticker
console.log(btcTicker) // "BTC"
```
```

Since v0.0.0

---
## Exports Grouped by Category

---

# constants

## Networks

Common blockchain network ticker metadata.

**Example**

```ts
```typescript
import { Blockchain } from "@beep/data"

const ethTicker = Blockchain.Networks.Ethereum.ticker
console.log(ethTicker) // "ETH"

const btcTicker = Blockchain.Networks.Bitcoin.ticker
console.log(btcTicker) // "BTC"
```
```

**Signature**

```ts
declare const Networks: { readonly Ethereum: { readonly ticker: "ETH"; }; readonly Solana: { readonly ticker: "SOL"; }; readonly Bitcoin: { readonly ticker: "BTC"; }; readonly "BNB Chain": { readonly ticker: "BNB"; }; readonly Base: { readonly ticker: "BASE"; }; readonly Tron: { readonly ticker: "TRX"; }; readonly Arbitrum: { readonly ticker: "ARB"; }; readonly Avalanche: { readonly ticker: "AVAX"; }; readonly Polygon: { readonly ticker: "POL"; }; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Blockchain.ts#L25)

Since v0.0.0