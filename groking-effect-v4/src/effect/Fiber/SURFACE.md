# effect/Fiber Surface

Total exports: 12

| Export | Kind | Overview |
|---|---|---|
| `await` | `const` | No summary found in JSDoc. |
| `awaitAll` | `const` | Waits for all fibers in the provided iterable to complete and returns an array of their exit values. |
| `Fiber` | `interface` | A runtime fiber is a lightweight thread that executes Effects. Fibers are the unit of concurrency in Effect. They provide a way to run multiple Effects concurrently while mainta... |
| `getCurrent` | `const` | Returns the current fiber if called from within a fiber context, otherwise returns `undefined`. |
| `interrupt` | `const` | Interrupts a fiber, causing it to stop executing and clean up any acquired resources. |
| `interruptAll` | `const` | Interrupts all fibers in the provided iterable, causing them to stop executing and clean up any acquired resources. |
| `interruptAllAs` | `const` | Interrupts all fibers in the provided iterable using the specified fiber ID as the interrupting fiber. This allows you to control which fiber is considered the source of the int... |
| `interruptAs` | `const` | Interrupts a fiber with a specific fiber ID as the interruptor. This allows tracking which fiber initiated the interruption. |
| `isFiber` | `const` | Tests if a value is a Fiber. This is a type guard that can be used to determine if an unknown value is a Fiber instance. |
| `join` | `const` | Joins a fiber, blocking until it completes. If the fiber succeeds, returns its value. If it fails, the error is propagated. |
| `joinAll` | `const` | No summary found in JSDoc. |
| `runIn` | `const` | Links the lifetime of a fiber to the provided scope. |
