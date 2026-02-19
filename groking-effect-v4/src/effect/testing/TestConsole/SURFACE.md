# effect/testing/TestConsole Surface

Total exports: 6

| Export | Kind | Overview |
|---|---|---|
| `errorLines` | `const` | Returns an array of all items that have been logged by the program using `Console.error` thus far. |
| `layer` | `const` | Creates a `Layer` which constructs a `TestConsole`. This layer can be used to provide a TestConsole implementation for testing purposes. |
| `logLines` | `const` | Returns an array of all items that have been logged by the program using `Console.log` thus far. |
| `make` | `const` | Creates a new TestConsole instance that captures all console output. The returned TestConsole implements the Console interface and provides additional methods to retrieve logged... |
| `TestConsole` | `interface` | A `TestConsole` provides a testable implementation of the Console interface. It captures all console output for testing purposes while maintaining full compatibility with the st... |
| `testConsoleWith` | `const` | Retrieves the `TestConsole` service for this test and uses it to run the specified workflow. |
