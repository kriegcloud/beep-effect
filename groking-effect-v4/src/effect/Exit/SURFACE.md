# effect/Exit Surface

Total exports: 30

| Export | Kind | Overview |
|---|---|---|
| `asVoid` | `const` | Discards the success value of an Exit, replacing it with `void`. |
| `asVoidAll` | `const` | Combines multiple Exit values into a single `Exit<void, E>`. |
| `die` | `const` | Creates a failed Exit from a defect (unexpected error). |
| `Exit` | `type` | Represents the result of an Effect computation. |
| `fail` | `const` | Creates a failed Exit from a typed error value. |
| `failCause` | `const` | Creates a failed Exit from a Cause. |
| `Failure` | `interface` | A failed Exit containing a Cause. |
| `filterCause` | `const` | Extracts the Cause from a failed Exit for use in filter pipelines. |
| `filterFailure` | `const` | Extracts the Failure variant from an Exit for use in filter pipelines. |
| `filterSuccess` | `const` | Extracts the Success variant from an Exit for use in filter pipelines. |
| `filterValue` | `const` | Extracts the success value from an Exit for use in filter pipelines. |
| `findDefect` | `const` | Extracts the first defect from a failed Exit for use in filter pipelines. |
| `findError` | `const` | Extracts the first typed error value from a failed Exit for use in filter pipelines. |
| `findErrorOption` | `const` | Returns the first typed error from a failed Exit as an Option. |
| `getCause` | `const` | Returns the Cause of a failed Exit as an Option. |
| `getSuccess` | `const` | Returns the success value of an Exit as an Option. |
| `hasDies` | `const` | Tests whether a failed Exit contains defects (Die reasons). |
| `hasFails` | `const` | Tests whether a failed Exit contains typed errors (Fail reasons). |
| `hasInterrupts` | `const` | Tests whether a failed Exit contains interruptions (Interrupt reasons). |
| `interrupt` | `const` | Creates a failed Exit representing fiber interruption. |
| `isExit` | `const` | Tests whether an unknown value is an Exit. |
| `isFailure` | `const` | Tests whether an Exit is a Failure. |
| `isSuccess` | `const` | Tests whether an Exit is a Success. |
| `map` | `const` | Transforms the success value of an Exit using the given function. |
| `mapBoth` | `const` | Transforms both the success value and typed error of an Exit. |
| `mapError` | `const` | Transforms the typed error of a failed Exit using the given function. |
| `match` | `const` | Pattern matches on an Exit, handling both success and failure cases. |
| `succeed` | `const` | Creates a successful Exit containing the given value. |
| `Success` | `interface` | A successful Exit containing a value. |
| `void` | `const` | No summary found in JSDoc. |
