# effect/Scope Surface

Total exports: 13

| Export | Kind | Overview |
|---|---|---|
| `addFinalizer` | `const` | Adds a finalizer to a scope. The finalizer is a simple `Effect` that will be executed when the scope is closed, regardless of whether the scope closes successfully or with an er... |
| `addFinalizerExit` | `const` | Adds a finalizer to a scope that will be executed when the scope is closed. Finalizers are cleanup functions that receive the exit value of the scope. |
| `close` | `const` | Closes a scope, running all registered finalizers in the appropriate order. The exit value is passed to each finalizer. |
| `Closeable` | `interface` | A `Closeable` scope extends the base `Scope` interface with the ability to be closed, executing all registered finalizers. |
| `closeUnsafe` | `const` | No summary found in JSDoc. |
| `fork` | `const` | Creates a child scope from a parent scope. The child scope inherits the parent's finalization strategy unless overridden. |
| `forkUnsafe` | `const` | Creates a child scope from a parent scope synchronously without wrapping it in an `Effect`. The child scope inherits the parent's finalization strategy unless overridden. |
| `make` | `const` | Creates a new `Scope` with the specified finalizer strategy. |
| `makeUnsafe` | `const` | Creates a new `Scope` synchronously without wrapping it in an `Effect`. This is useful when you need a scope immediately but should be used with caution as it doesn't provide th... |
| `provide` | `const` | Provides a `Scope` to an `Effect`, removing the `Scope` requirement from its context. This allows you to run effects that require a scope by explicitly providing one. |
| `Scope` | `interface` | A `Scope` represents a context where resources can be acquired and automatically cleaned up when the scope is closed. Scopes can use either sequential or parallel finalization s... |
| `State` | `namespace` | The `State` namespace contains types representing the different states a scope can be in: Open (accepting new finalizers) or Closed (no longer accepting finalizers). |
| `use` | `const` | No summary found in JSDoc. |
