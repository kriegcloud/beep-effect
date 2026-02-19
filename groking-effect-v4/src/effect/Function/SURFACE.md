# effect/Function Surface

Total exports: 24

| Export | Kind | Overview |
|---|---|---|
| `absurd` | `const` | The `absurd` function is a stub for cases where a value of type `never` is encountered in your code, meaning that it should be impossible for this code to be executed. |
| `apply` | `const` | Apply a function to a given value. |
| `coerceUnsafe` | `const` | Casts the result to the specified type. |
| `compose` | `const` | Composes two functions, `ab` and `bc` into a single function that takes in an argument `a` of type `A` and returns a result of type `C`. The result is obtained by first applying... |
| `constant` | `const` | Creates a constant value that never changes. |
| `constFalse` | `const` | A thunk that returns always `false`. |
| `constNull` | `const` | A thunk that returns always `null`. |
| `constTrue` | `const` | A thunk that returns always `true`. |
| `constUndefined` | `const` | A thunk that returns always `undefined`. |
| `constVoid` | `const` | A thunk that returns always `void`. |
| `dual` | `const` | Creates a function that can be used in a data-last (aka `pipe`able) or data-first style. |
| `flip` | `const` | Reverses the order of arguments for a curried function. |
| `flow` | `function` | Performs left-to-right function composition. The first argument may have any arity, the remaining arguments must be unary. |
| `FunctionN` | `type` | Represents a function with multiple arguments. |
| `FunctionTypeLambda` | `interface` | Type lambda for function types, used for higher-kinded type operations. |
| `hole` | `const` | Type hole simulation. Creates a placeholder for any type, primarily used during development. |
| `identity` | `const` | The identity function, i.e. A function that returns its input argument. |
| `LazyArg` | `type` | A lazy argument. |
| `memoize` | `function` | No summary found in JSDoc. |
| `pipe` | `function` | Pipes the value of an expression into a pipeline of functions. |
| `satisfies` | `const` | A function that ensures that the type of an expression matches some type, without changing the resulting type of that expression. |
| `SK` | `const` | The SK combinator, also known as the "S-K combinator" or "S-combinator", is a fundamental combinator in the lambda calculus and the SKI combinator calculus. |
| `tupled` | `const` | Creates a tupled version of this function: instead of `n` arguments, it accepts a single tuple argument. |
| `untupled` | `const` | Inverse function of `tupled` |
