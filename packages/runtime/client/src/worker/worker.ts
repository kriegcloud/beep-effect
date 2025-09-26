import * as BrowserRuntime from "@effect/platform-browser/BrowserRuntime";
import * as BrowserWorkerRunner from "@effect/platform-browser/BrowserWorkerRunner";
import * as RpcServer from "@effect/rpc/RpcServer";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { FilterError, WorkerRpc } from "./worker-rpc";

const isPrime = (num: number): boolean => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i = i + 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
};

const Live = WorkerRpc.toLayer(
  Effect.gen(function* () {
    yield* Effect.logInfo("Worker started");

    return {
      filterData: (req) =>
        Effect.gen(function* () {
          yield* Effect.logInfo(
            `Worker received request to filter ${req.data.length} items with threshold ${req.threshold}`
          );

          yield* Effect.sleep("3 seconds");

          if (req.threshold < 0) {
            yield* Effect.logError("Worker received invalid threshold");
            return yield* new FilterError({ message: "Threshold cannot be negative" });
          }

          const filtered = req.data.filter((n) => n > req.threshold);
          yield* Effect.logInfo(`Worker finished filtering. Returning ${filtered.length} items.`);
          return filtered;
        }),
      calculatePrimes: ({ upperBound }) =>
        Effect.gen(function* () {
          yield* Effect.logInfo(`Worker received request to calculate primes up to ${upperBound}`);

          let count = 0;
          for (let i = 2; i <= upperBound; i++) {
            if (isPrime(i)) {
              count += 1;
            }
          }

          yield* Effect.logInfo(`Worker finished calculating primes. Found ${count} primes.`);
          return count;
        }),
    };
  })
);

const RpcWorkerServer = RpcServer.layer(WorkerRpc).pipe(
  Layer.provide(Live),
  Layer.provide(RpcServer.layerProtocolWorkerRunner),
  Layer.provide(BrowserWorkerRunner.layer)
);

BrowserRuntime.runMain(
  BrowserWorkerRunner.launch(RpcWorkerServer).pipe(Effect.tapErrorCause((error) => Effect.logError("[Worker]", error)))
);
