# effect/unstable/cluster/RunnerHealth Surface

Total exports: 6

| Export | Kind | Overview |
|---|---|---|
| `layerK8s` | `const` | A layer which will check the Kubernetes API to see if a Runner is healthy. |
| `layerNoop` | `const` | A layer which will **always** consider a Runner healthy. |
| `layerPing` | `const` | A layer which will ping a Runner directly to check if it is healthy. |
| `makeK8s` | `const` | No summary found in JSDoc. |
| `makePing` | `const` | No summary found in JSDoc. |
| `RunnerHealth` | `class` | Represents the service used to check if a Runner is healthy. |
