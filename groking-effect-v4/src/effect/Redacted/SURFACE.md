# effect/Redacted Surface

Total exports: 6

| Export | Kind | Overview |
|---|---|---|
| `isRedacted` | `const` | No summary found in JSDoc. |
| `make` | `const` | This function creates a `Redacted<A>` instance from a given value `A`, securely hiding its content. |
| `makeEquivalence` | `const` | Generates an equivalence relation for `Redacted<A>` values based on an equivalence relation for the underlying values `A`. This function is useful for comparing `Redacted` insta... |
| `Redacted` | `interface` | No summary found in JSDoc. |
| `value` | `const` | Retrieves the original value from a `Redacted` instance. Use this function with caution, as it exposes the sensitive data. |
| `wipeUnsafe` | `const` | Erases the underlying value of a `Redacted` instance, rendering it unusable. This function is intended to ensure that sensitive data does not remain in memory longer than necess... |
