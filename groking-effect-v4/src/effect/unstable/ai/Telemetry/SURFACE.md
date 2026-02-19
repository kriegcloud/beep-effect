# effect/unstable/ai/Telemetry Surface

Total exports: 17

| Export | Kind | Overview |
|---|---|---|
| `addGenAIAnnotations` | `const` | Applies GenAI telemetry attributes to an OpenTelemetry span. |
| `addSpanAttributes` | `const` | Creates a function to add attributes to a span with a given prefix and key transformation. |
| `AllAttributes` | `type` | All telemetry attributes which are part of the GenAI specification. |
| `AttributesWithPrefix` | `type` | Utility type for prefixing attribute names with a namespace. |
| `BaseAttributes` | `interface` | Telemetry attributes which are part of the GenAI specification and are namespaced by `gen_ai`. |
| `CurrentSpanTransformer` | `class` | Service key for providing a span transformer to large langauge model operations. |
| `FormatAttributeName` | `type` | Utility type for converting camelCase names to snake_case format. |
| `GenAITelemetryAttributeOptions` | `type` | Configuration options for GenAI telemetry attributes. |
| `GenAITelemetryAttributes` | `type` | The attributes used to describe telemetry in the context of Generative Artificial Intelligence (GenAI) models requests and responses. |
| `OperationAttributes` | `interface` | Telemetry attributes which are part of the GenAI specification and are namespaced by `gen_ai.operation`. |
| `RequestAttributes` | `interface` | Telemetry attributes which are part of the GenAI specification and are namespaced by `gen_ai.request`. |
| `ResponseAttributes` | `interface` | Telemetry attributes which are part of the GenAI specification and are namespaced by `gen_ai.response`. |
| `SpanTransformer` | `interface` | A function that can transform OpenTelemetry spans based on AI operation data. |
| `TokenAttributes` | `interface` | Telemetry attributes which are part of the GenAI specification and are namespaced by `gen_ai.token`. |
| `UsageAttributes` | `interface` | Telemetry attributes which are part of the GenAI specification and are namespaced by `gen_ai.usage`. |
| `WellKnownOperationName` | `type` | The `gen_ai.operation.name` attribute has the following list of well-known values. |
| `WellKnownSystem` | `type` | The `gen_ai.system` attribute has the following list of well-known values. |
