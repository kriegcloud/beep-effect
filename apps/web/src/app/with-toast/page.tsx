"use client";
import { useRuntime } from "@beep/runtime-client";
import { withToast } from "@beep/ui/common";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

export class MyError extends Data.TaggedError("MyError")<{
  readonly message: string;
}> {}

const effectFail = Effect.fn("effectFail")(
  function* () {
    yield* Effect.sleep(Duration.seconds(2));
    return yield* new MyError({ message: "Failed" });
  },
  withToast({
    onWaiting: () => "waiting for failure...",
    onSuccess: () => "this shouldn't happen",
    onFailure: (error) => (O.isSome(error) ? error.value.message : "unknown error"),
  })
);

const effectSucceed = Effect.fn("effectSucceed")(
  function* () {
    yield* Effect.sleep(Duration.seconds(2));
    return yield* Effect.succeed("Beep");
  },
  withToast({
    onWaiting: () => "waiting for success...",
    onSuccess: () => "Success yay!",
    onFailure: "unknown error this shouldn't happen",
  })
);

export default function WithToastPage() {
  const runtime = useRuntime();

  const onClickError = async () => {
    await runtime.runPromise(effectFail().pipe(Effect.catchAll(Console.warn)));
  };

  const onClickSucceed = async () => {
    await runtime.runPromise(effectSucceed());
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack spacing={2}>
        <Button variant={"outlined"} onClick={onClickError} color={"error"}>
          Click me to fail
        </Button>
        <Button variant={"outlined"} onClick={onClickSucceed} color={"success"}>
          Click me to succeed
        </Button>
      </Stack>
    </Box>
  );
}
