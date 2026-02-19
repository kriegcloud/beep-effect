# effect/SubscriptionRef Surface

Total exports: 25

| Export | Kind | Overview |
|---|---|---|
| `changes` | `const` | Creates a stream that emits the current value and all subsequent changes to the `SubscriptionRef`. |
| `get` | `const` | Retrieves the current value of the `SubscriptionRef`. |
| `getAndSet` | `const` | Atomically retrieves the current value and sets a new value, notifying subscribers of the change. |
| `getAndUpdate` | `const` | Atomically retrieves the current value and updates it with the result of applying a function, notifying subscribers of the change. |
| `getAndUpdateEffect` | `const` | Atomically retrieves the current value and updates it with the result of applying an effectful function, notifying subscribers of the change. |
| `getAndUpdateSome` | `const` | Atomically retrieves the current value and optionally updates it with the result of applying a function that returns an `Option`, notifying subscribers only if the value changes. |
| `getAndUpdateSomeEffect` | `const` | Atomically retrieves the current value and optionally updates it with the result of applying an effectful function that returns an `Option`, notifying subscribers only if the va... |
| `getUnsafe` | `const` | Unsafely retrieves the current value of the `SubscriptionRef`. |
| `isSubscriptionRef` | `const` | No summary found in JSDoc. |
| `make` | `const` | Constructs a new `SubscriptionRef` from an initial value. |
| `modify` | `const` | Atomically modifies the `SubscriptionRef` with a function that computes a return value and a new value, notifying subscribers of the change. |
| `modifyEffect` | `const` | Atomically modifies the `SubscriptionRef` with an effectful function that computes a return value and a new value, notifying subscribers of the change. |
| `modifySome` | `const` | Atomically modifies the `SubscriptionRef` with a function that computes a return value and optionally a new value, notifying subscribers only if the value changes. |
| `modifySomeEffect` | `const` | Atomically modifies the `SubscriptionRef` with an effectful function that computes a return value and optionally a new value, notifying subscribers only if the value changes. |
| `set` | `const` | Sets the value of the `SubscriptionRef`, notifying all subscribers of the change. |
| `setAndGet` | `const` | Sets the value of the `SubscriptionRef` and returns the new value, notifying all subscribers of the change. |
| `SubscriptionRef` | `interface` | No summary found in JSDoc. |
| `update` | `const` | Updates the value of the `SubscriptionRef` with the result of applying a function, notifying subscribers of the change. |
| `updateAndGet` | `const` | Updates the value of the `SubscriptionRef` with the result of applying a function and returns the new value, notifying subscribers of the change. |
| `updateAndGetEffect` | `const` | Updates the value of the `SubscriptionRef` with the result of applying an effectful function and returns the new value, notifying subscribers of the change. |
| `updateEffect` | `const` | Updates the value of the `SubscriptionRef` with the result of applying an effectful function, notifying subscribers of the change. |
| `updateSome` | `const` | Optionally updates the value of the `SubscriptionRef` with the result of applying a function that returns an `Option`, notifying subscribers only if the value changes. |
| `updateSomeAndGet` | `const` | Optionally updates the value of the `SubscriptionRef` with the result of applying a function that returns an `Option` and returns the new value, notifying subscribers only if th... |
| `updateSomeAndGetEffect` | `const` | Optionally updates the value of the `SubscriptionRef` with the result of applying an effectful function that returns an `Option` and returns the new value, notifying subscribers... |
| `updateSomeEffect` | `const` | Optionally updates the value of the `SubscriptionRef` with the result of applying an effectful function that returns an `Option`, notifying subscribers only if the value changes. |
