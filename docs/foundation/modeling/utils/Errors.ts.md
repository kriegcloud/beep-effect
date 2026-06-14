---
title: Errors.ts
nav_order: 5
parent: "@beep/utils"
---

## Errors.ts overview

Error-channel mapping helpers for dual `Effect.mapError` wrappers.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [mapCauseError](#mapcauseerror)
  - [mapToError](#maptoerror)
- [type-level](#type-level)
  - [ErrorMapper (type alias)](#errormapper-type-alias)
---

# error-handling

## mapCauseError

Builds a dual mapper that preserves the original failure as constructor input.

**Example**

```ts
import { Err } from "@beep/utils";
import { Effect, pipe } from "effect";

class CommandError {
  readonly cause: unknown;
  readonly message: string;

  constructor(cause: unknown, message: string) {
    this.cause = cause;
    this.message = message;
  }

  static readonly mapError = Err.mapCauseError(
    (cause: unknown, message: string) => new CommandError(cause, message)
  );
}

const error = Effect.runSync(
  pipe(Effect.fail("spawn failed"), CommandError.mapError("Failed to spawn command."), Effect.flip)
);
console.log(error.cause);
```

**Signature**

```ts
declare const mapCauseError: <Error, Args extends Array<unknown>>(build: (cause: unknown, ...args: Args) => Error) => ErrorMapper<Error, Args>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Errors.ts#L95)

Since v0.0.0

## mapToError

Builds a dual mapper that replaces the original failure with a target error.

**Example**

```ts
import { Err } from "@beep/utils";
import { Effect, pipe } from "effect";
import { dual } from "effect/Function";

class ExitError {
  readonly exitCode: number;

  constructor(exitCode: number) {
    this.exitCode = exitCode;
  }

  static readonly mapError = Err.mapToError((exitCode: number) => new ExitError(exitCode));
}

const error = Effect.runSync(pipe(Effect.fail("ignored"), ExitError.mapError(1), Effect.flip));

console.log(error.exitCode);

class JoinedError {
  static readonly new: {
    (prefix: string, suffix: string): string;
    (suffix: string): (prefix: string) => string;
  } = dual(2, (prefix: string, suffix: string): string => `${prefix}${suffix}`);

  static readonly mapError = Err.mapToError(this.new);
}

const joined = Effect.runSync(
  pipe(Effect.fail("hello "), JoinedError.mapError("world"), Effect.flip)
);
console.log(joined);
```

**Signature**

```ts
declare const mapToError: { <Args extends Array<unknown>, Input, Error>(build: (...args: Args) => ErrorBuilderFromInput<Input, Error>): ErrorMapper<Error, Args, Input>; <Error, Args extends Array<unknown>>(build: (...args: Args) => Error): ErrorMapper<Error, Args>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Errors.ts#L166)

Since v0.0.0

# type-level

## ErrorMapper (type alias)

Dual data-first/data-last mapper for converting an effect's error channel.

**Example**

```ts
import { Err } from "@beep/utils";
import { Effect } from "effect";

class CommandError {
  readonly cause: unknown;
  readonly message: string;

  constructor(cause: unknown, message: string) {
    this.cause = cause;
    this.message = message;
  }

  static readonly mapError: Err.ErrorMapper<CommandError, [message: string]> =
    Err.mapCauseError((cause, message) => new CommandError(cause, message));
}

const error = Effect.runSync(
  Effect.flip(CommandError.mapError(Effect.fail("spawn failed"), "Failed to spawn command."))
);
console.log(error.message);
```

**Signature**

```ts
type ErrorMapper<Error, Args, Input> = {
  <A, E extends Input, R>(self: Effect.Effect<A, E, R>, ...args: Args): Effect.Effect<A, Error, R>;
  (...args: Args): <A, E extends Input, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, Error, R>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Errors.ts#L44)

Since v0.0.0