# effect/ScopedRef Surface

Total exports: 6

| Export | Kind | Overview |
|---|---|---|
| `fromAcquire` | `const` | Creates a new `ScopedRef` from an effect that resourcefully produces a value. |
| `get` | `const` | Retrieves the current value of the scoped reference. |
| `getUnsafe` | `const` | Retrieves the current value of the scoped reference. |
| `make` | `const` | Creates a new `ScopedRef` from the specified value. This method should not be used for values whose creation require the acquisition of resources. |
| `ScopedRef` | `interface` | A `ScopedRef` is a reference whose value is associated with resources, which must be released properly. You can both get the current value of any `ScopedRef`, as well as set it ... |
| `set` | `const` | Sets the value of this reference to the specified resourcefully-created value. Any resources associated with the old value will be released. |
