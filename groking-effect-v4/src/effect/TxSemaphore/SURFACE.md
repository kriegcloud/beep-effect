# effect/TxSemaphore Surface

Total exports: 14

| Export | Kind | Overview |
|---|---|---|
| `acquire` | `const` | Acquires a single permit from the semaphore. If no permits are available, the effect will block until one becomes available. |
| `acquireN` | `const` | Acquires the specified number of permits from the semaphore. If not enough permits are available, the effect will block until they become available. |
| `available` | `const` | Gets the current number of available permits in the semaphore. |
| `capacity` | `const` | Gets the maximum capacity (total permits) of the semaphore. |
| `isTxSemaphore` | `const` | Determines if the provided value is a TxSemaphore. |
| `make` | `const` | Creates a new TxSemaphore with the specified number of permits. |
| `release` | `const` | Releases a single permit back to the semaphore, making it available for acquisition. |
| `releaseN` | `const` | Releases the specified number of permits back to the semaphore. |
| `tryAcquire` | `const` | Tries to acquire a single permit from the semaphore without blocking. Returns true if successful, false if no permits are available. |
| `tryAcquireN` | `const` | Tries to acquire the specified number of permits from the semaphore without blocking. Returns true if successful, false if not enough permits are available. |
| `TxSemaphore` | `interface` | A transactional semaphore that manages permits using Software Transactional Memory (STM) semantics. |
| `withPermit` | `const` | Executes an effect with a single permit from the semaphore. The permit is automatically acquired before execution and released afterwards, even if the effect fails or is interru... |
| `withPermits` | `const` | Executes an effect with the specified number of permits from the semaphore. The permits are automatically acquired before execution and released afterwards, even if the effect f... |
| `withPermitScoped` | `const` | Acquires a single permit from the semaphore in a scoped manner. The permit will be automatically released when the scope is closed, even if effects within the scope fail or are ... |
