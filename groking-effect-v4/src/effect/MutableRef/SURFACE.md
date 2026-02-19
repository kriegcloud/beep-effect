# effect/MutableRef Surface

Total exports: 17

| Export | Kind | Overview |
|---|---|---|
| `compareAndSet` | `const` | Atomically sets the value to newValue if the current value equals oldValue. Returns true if the value was updated, false otherwise. Uses Effect's Equal interface for value compa... |
| `decrement` | `const` | Decrements a numeric MutableRef by 1 and returns the reference. |
| `decrementAndGet` | `const` | Decrements a numeric MutableRef by 1 and returns the new value. |
| `get` | `const` | Gets the current value of the MutableRef. |
| `getAndDecrement` | `const` | Decrements a numeric MutableRef by 1 and returns the previous value. |
| `getAndIncrement` | `const` | Increments a numeric MutableRef by 1 and returns the previous value. |
| `getAndSet` | `const` | Sets the MutableRef to a new value and returns the previous value. |
| `getAndUpdate` | `const` | Updates the MutableRef with the result of applying a function to its current value, and returns the previous value. |
| `increment` | `const` | Increments a numeric MutableRef by 1 and returns the reference. |
| `incrementAndGet` | `const` | Increments a numeric MutableRef by 1 and returns the new value. |
| `make` | `const` | Creates a new MutableRef with the specified initial value. |
| `MutableRef` | `interface` | No summary found in JSDoc. |
| `set` | `const` | Sets the MutableRef to a new value and returns the reference. |
| `setAndGet` | `const` | Sets the MutableRef to a new value and returns the new value. |
| `toggle` | `const` | Toggles a boolean MutableRef (true becomes false, false becomes true) and returns the reference. |
| `update` | `const` | Updates the MutableRef with the result of applying a function to its current value, and returns the reference. |
| `updateAndGet` | `const` | Updates the MutableRef with the result of applying a function to its current value, and returns the new value. |
