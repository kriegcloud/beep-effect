# effect/unstable/ai/Chat Surface

Total exports: 11

| Export | Kind | Overview |
|---|---|---|
| `Chat` | `class` | The `Chat` service tag for dependency injection. |
| `ChatNotFoundError` | `class` | An error that occurs when attempting to retrieve a persisted `Chat` that does not exist in the backing persistence store. |
| `empty` | `const` | Creates a new Chat service with empty conversation history. |
| `fromExport` | `const` | Creates a Chat service from previously exported chat data. |
| `fromJson` | `const` | Creates a Chat service from previously exported JSON chat data. |
| `fromPrompt` | `const` | Creates a new Chat service from an initial prompt. |
| `layerPersisted` | `const` | Creates a `Layer` new chat persistence service. |
| `makePersisted` | `const` | Creates a new chat persistence service. |
| `Persisted` | `interface` | Represents a `Chat` that is backed by persistence. |
| `Persistence` | `class` | The context tag for chat persistence. |
| `Service` | `interface` | Represents the interface that the `Chat` service provides. |
