# effect/Pull Surface

Total exports: 15

| Export | Kind | Overview |
|---|---|---|
| `catchDone` | `const` | No summary found in JSDoc. |
| `doneExitFromCause` | `const` | Converts a Cause into an Exit, extracting halt leftovers as success values. |
| `Error` | `type` | Extracts the error type from a Pull type, excluding Done errors. |
| `ExcludeDone` | `type` | Excludes done errors from an error type union. |
| `filterDone` | `const` | Filters a Cause to extract only halt errors. |
| `filterDoneLeftover` | `const` | Filters a Cause to extract the leftover value from done errors. |
| `filterDoneVoid` | `const` | Filters a Cause to extract only halt errors. |
| `filterNoDone` | `const` | No summary found in JSDoc. |
| `isDoneCause` | `const` | Checks if a Cause contains any done errors. |
| `isDoneFailure` | `const` | Checks if a Cause failure is a done error. |
| `Leftover` | `type` | Extracts the leftover type from a Pull type. |
| `matchEffect` | `const` | Pattern matches on a Pull, handling success, failure, and done cases. |
| `Pull` | `interface` | No summary found in JSDoc. |
| `Services` | `type` | Extracts the service requirements (context) type from a Pull type. |
| `Success` | `type` | Extracts the success type from a Pull type. |
