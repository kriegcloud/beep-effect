"use client";
import { clientRuntimeLayer } from "@beep/runtime-client/services/runtime/live-layer";
import { WorkerClient } from "@beep/runtime-client/worker/worker-client";
import {
  Atom,
  Result,
  useAtom,
  useAtomMount,

} from "@effect-atom/atom-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";

const makeAtomRuntime = Atom.context({
  memoMap: Atom.defaultMemoMap,
});

makeAtomRuntime.addGlobalLayer(clientRuntimeLayer);

const keepAliveRuntime = makeAtomRuntime(WorkerClient.Default);

const workerPrimeNumberAtom = keepAliveRuntime.fn(
  Effect.fnUntraced(function* () {
    const { client } = yield* WorkerClient;
    const upperBound = 10_000_000;

    yield* Effect.logInfo(`Requesting prime calculation up to ${upperBound}`);

    const [duration, result] = yield* Effect.timed(client.calculatePrimes({ upperBound }));

    yield* Effect.logInfo(`Found ${result} primes in ${Duration.format(duration)}`);

    return {
      duration,
      result,
    };
  })
);

const KeepAliveServices: React.FC = () => {
  useAtomMount(keepAliveRuntime);
  return null;
};

const Page = () => {
  const [workerPrimeNumberResult, getPrimeNumber] = useAtom(workerPrimeNumberAtom);
  return (
    <>
      <KeepAliveServices />
      <Box sx={{ width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card>
          <CardHeader title="Prime Number" />
          <CardContent>
            {Result.match(workerPrimeNumberResult, {
              onInitial: () => <Typography>Click the button to get a prime number</Typography>,
              onFailure: () => <Typography>Failed to get prime number</Typography>,
              onSuccess: (result) => (
                <Typography>
                  Found {result.value.result} primes in {Duration.format(result.value.duration)}
                </Typography>
              ),
            })}
          </CardContent>
          <CardActions>
            <Button onClick={() => getPrimeNumber()}>Get Prime Number</Button>
          </CardActions>
        </Card>
      </Box>
    </>
  );
};

export default Page;
