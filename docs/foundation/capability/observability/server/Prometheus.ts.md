---
title: Prometheus.ts
nav_order: 19
parent: "@beep/observability"
---

## Prometheus.ts overview

Prometheus metrics sanitization and HTTP route helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [layerPrometheusMetricsHttp](#layerprometheusmetricshttp)
- [observability](#observability)
  - [sanitizePrometheusMetrics](#sanitizeprometheusmetrics)
---

# layers

## layerPrometheusMetricsHttp

Create a sanitized Prometheus metrics route.

**Example**

```ts
```typescript
import { layerPrometheusMetricsHttp } from "@beep/observability/server"

const PrometheusLive = layerPrometheusMetricsHttp({ path: "/metrics" })
console.log(PrometheusLive)
```
```

**Signature**

```ts
declare const layerPrometheusMetricsHttp: (options?: PrometheusMetrics.HttpOptions | undefined) => Layer.Layer<never, never, HttpRouter.HttpRouter>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/Prometheus.ts#L49)

Since v0.0.0

# observability

## sanitizePrometheusMetrics

Strip duplicate terminal histogram buckets from Prometheus exposition text.

**Example**

```ts
```typescript
import { sanitizePrometheusMetrics } from "@beep/observability/server"

const raw = 'my_metric_bucket{le="Infinity"} 5\nmy_metric_bucket{le="1"} 3'
const clean = sanitizePrometheusMetrics(raw)
console.log(clean)
```
```

**Signature**

```ts
declare const sanitizePrometheusMetrics: (text: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/Prometheus.ts#L29)

Since v0.0.0