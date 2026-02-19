# effect/unstable/process/ChildProcess Surface

Total exports: 34

| Export | Kind | Overview |
|---|---|---|
| `AdditionalFdConfig` | `type` | Configuration for additional file descriptors to expose to the child process. |
| `Command` | `type` | A command that can be executed as a child process. |
| `CommandInput` | `type` | Input type for child process stdin. |
| `CommandOptions` | `interface` | Options for command execution. |
| `CommandOutput` | `type` | Output type for child process stdout/stderr. |
| `Encoding` | `type` | The encoding format to use for binary data. |
| `exitCode` | `const` | No summary found in JSDoc. |
| `fdName` | `const` | Create an fd name from its numeric index. |
| `isCommand` | `const` | Check if a value is a `Command`. |
| `isPipedCommand` | `const` | Check if a command is a `PipedCommand`. |
| `isStandardCommand` | `const` | Check if a command is a `StandardCommand`. |
| `KillOptions` | `interface` | Options that can be used to control how a child process is terminated. |
| `lines` | `const` | No summary found in JSDoc. |
| `make` | `const` | Create a command from a template literal, options + template, or array form. |
| `parseFdName` | `const` | Parse an fd name like "fd3" to its numeric index. Returns undefined if the name is invalid. |
| `PipedCommand` | `interface` | A pipeline of commands where the output of one is piped to the input of the next. |
| `PipeFromOption` | `type` | Specifies which stream to pipe from the source subprocess. |
| `PipeOptions` | `interface` | Options for controlling how commands are piped together. |
| `pipeTo` | `const` | Pipe the output of one command to the input of another. |
| `PipeToOption` | `type` | Specifies which input to pipe to on the destination subprocess. |
| `prefix` | `const` | Prefix a command with another command. |
| `setCwd` | `const` | Set the current working directory for a command. |
| `setEnv` | `const` | Set environment variables for a command. |
| `Signal` | `type` | A signal that can be sent to a child process. |
| `spawn` | `const` | Spawn a command and return a handle for interaction. |
| `StandardCommand` | `interface` | A standard command with pre-parsed command and arguments. |
| `StderrConfig` | `interface` | Configuration for the child process standard error stream. |
| `StdinConfig` | `interface` | Configuration for the child process standard input stream. |
| `StdoutConfig` | `interface` | Configuration for the child process standard output stream. |
| `streamLines` | `const` | No summary found in JSDoc. |
| `streamString` | `const` | No summary found in JSDoc. |
| `string` | `const` | No summary found in JSDoc. |
| `TemplateExpression` | `type` | Template expression type for interpolated values. |
| `TemplateExpressionItem` | `type` | Valid template expression item types. |
