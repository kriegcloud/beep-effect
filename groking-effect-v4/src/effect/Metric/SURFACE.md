# effect/Metric Surface

Total exports: 42

| Export | Kind | Overview |
|---|---|---|
| `boundariesFromIterable` | `const` | A helper method to create histogram bucket boundaries from an iterable set of values. |
| `counter` | `const` | Represents a Counter metric that tracks cumulative numerical values over time. Counters can be incremented and decremented and provide a running total of changes. |
| `Counter` | `interface` | A Counter metric that tracks cumulative values that typically only increase. |
| `CounterState` | `interface` | State interface for Counter metrics containing the current count and increment mode. |
| `CurrentMetricAttributes` | `const` | Service class for managing the current metric attributes context. |
| `CurrentMetricAttributesKey` | `const` | Service key for the current metric attributes context. |
| `disableRuntimeMetrics` | `const` | Disables automatic collection of fiber runtime metrics for the provided Effect. |
| `disableRuntimeMetricsLayer` | `const` | A Layer that disables automatic collection of fiber runtime metrics. |
| `dump` | `const` | Returns a human-readable string representation of all currently registered metrics in a tabular format. |
| `enableRuntimeMetrics` | `const` | Enables automatic collection of fiber runtime metrics for the provided Effect. |
| `enableRuntimeMetricsLayer` | `const` | A Layer that enables automatic collection of fiber runtime metrics across an entire Effect application. |
| `exponentialBoundaries` | `const` | A helper method to create histogram bucket boundaries with exponentially increasing values. |
| `FiberRuntimeMetrics` | `const` | Service class for managing fiber runtime metrics collection. |
| `FiberRuntimeMetricsImpl` | `const` | Default implementation of the fiber runtime metrics service. |
| `FiberRuntimeMetricsKey` | `const` | Service key for the fiber runtime metrics service. |
| `FiberRuntimeMetricsService` | `interface` | Interface for the fiber runtime metrics service that tracks fiber lifecycle events. |
| `frequency` | `const` | Creates a `Frequency` metric which can be used to count the number of occurrences of a string. |
| `Frequency` | `interface` | A Frequency metric interface that counts occurrences of discrete string values. |
| `FrequencyState` | `interface` | State interface for Frequency metrics containing occurrence counts for discrete string values. |
| `gauge` | `const` | Represents a `Gauge` metric that tracks and reports a single numerical value at a specific moment. |
| `Gauge` | `interface` | A Gauge metric that tracks instantaneous values that can go up or down. |
| `GaugeState` | `interface` | State interface for Gauge metrics containing the current instantaneous value. |
| `histogram` | `const` | Represents a `Histogram` metric that records observations into buckets. |
| `Histogram` | `interface` | A Histogram metric that records observations in configurable buckets to analyze value distributions. |
| `HistogramState` | `interface` | State interface for Histogram metrics containing bucket distributions and aggregate statistics. |
| `isMetric` | `const` | Returns `true` if the specified value is a `Metric`, otherwise returns `false`. |
| `linearBoundaries` | `const` | A helper method to create histogram bucket boundaries with linearly increasing values. |
| `mapInput` | `const` | Returns a new metric that is powered by this one, but which accepts updates of the specified new type, which must be transformable to the input type of this metric. |
| `Metric` | `interface` | A `Metric<Input, State>` represents a concurrent metric which accepts update values of type `Input` and are aggregated to a value of type `State`. |
| `MetricRegistry` | `const` | Service class for accessing the current metric registry. |
| `modify` | `const` | Modifies the metric with the specified input. |
| `snapshot` | `const` | Captures a snapshot of all registered metrics in the current context. |
| `snapshotUnsafe` | `const` | Synchronously captures a snapshot of all registered metrics using the provided service context. |
| `summary` | `const` | Creates a `Summary` metric that records observations and calculates quantiles which takes a value as input and uses the current time. |
| `Summary` | `interface` | A Summary metric that calculates quantiles over a sliding time window of observations. |
| `SummaryState` | `interface` | State interface for Summary metrics containing quantile calculations and aggregate statistics. |
| `summaryWithTimestamp` | `const` | Creates a `Summary` metric that records observations and calculates quantiles which takes a value and the current timestamp as input. |
| `timer` | `const` | Creates a timer metric, based on a `Histogram`, which keeps track of durations in milliseconds. |
| `update` | `const` | Updates the metric with the specified input. |
| `value` | `const` | Retrieves the current state of the specified `Metric`. |
| `withAttributes` | `const` | Returns a new metric that applies the specified attributes to all operations. |
| `withConstantInput` | `const` | Returns a new metric that is powered by this one, but which accepts updates of any type, and translates them to updates with the specified constant update value. |
