# effect/unstable/observability/PrometheusMetrics Surface

Total exports: 6

| Export | Kind | Overview |
|---|---|---|
| `format` | `const` | Format all metrics in the registry to Prometheus exposition format. |
| `FormatOptions` | `interface` | Options for formatting metrics. |
| `formatUnsafe` | `const` | Synchronously format all metrics in the registry to Prometheus exposition format. |
| `HttpOptions` | `interface` | Options for exporting Prometheus metrics over HTTP. |
| `layerHttp` | `const` | Creates a Layer that registers a `/metrics` HTTP endpoint for Prometheus scraping. |
| `MetricNameMapper` | `type` | A function that transforms metric names before formatting. |
