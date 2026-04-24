// import { sha512 } from "./_sha.js";
import {RandomValues} from "@beep/utils";
import {DateTimes} from "@beep/utils/DateTime";
import {Context, Effect, Layer, Schema} from "effect";

export const sha512 = (data: BufferSource) => Effect.promise(() => crypto.subtle.digest("SHA-512",
  data,
).then((buffer) => new Uint8Array(buffer)));

// Constants
const DEFAULT_LENGTH = 24;
const BIG_LENGTH = 32;
const INITIAL_COUNT_MAX = 476782367;

// Schema
export const Cuid = Schema.String.pipe(
  Schema.check(Schema.isPattern(
    /^[a-z][0-9a-z]+$/)),
  Schema.brand("@typed/id/CUID"),
);
export type Cuid = Schema.Schema.Type<typeof Cuid>;

export const isCuid: (value: string) => value is Cuid = Schema.is(Cuid);

// Types
export type CuidSeed = {
  readonly timestamp: number;
  readonly counter: number;
  readonly random: Uint8Array;
  readonly fingerprint: string;
};

export class CuidState extends Context.Service<CuidState>()("@typed/id/CuidState",
  {
    make: Effect.fn("CuidState.make")(function* (envData: string) {
      const {now} = yield* DateTimes;
      const getRandomValues = yield* RandomValues;
      const initialBytes = yield* getRandomValues(4);
      const initialValue = Math.abs((initialBytes[0] << 24) | (initialBytes[1] << 16) | (initialBytes[2] << 8) | initialBytes[3]) % INITIAL_COUNT_MAX;

      // Create fingerprint from environment data
      const fingerprint = (yield* hash(envData)).substring(0, BIG_LENGTH);

      let counter = initialValue;

      return Effect.gen(function* () {
        const timestamp = yield* now;
        const random = yield* getRandomValues(32);
        return {
          timestamp,
          counter: counter++,
          random,
          fingerprint,
        } satisfies CuidSeed;
      });
    }),
  },
) {
  static readonly next = Effect.flatten(CuidState.asEffect());

  static readonly Default = Layer.effect(CuidState, CuidState.make("node"))
    .pipe(Layer.provideMerge([
      DateTimes.Default,
      RandomValues.Default,
    ]));
}

export const cuid: Effect.Effect<Cuid, never, CuidState> = Effect.flatMap(CuidState.next,
  cuidFromSeed,
);

// Utilities
const ALPHABET = Array.from(
  {length: 26},
  (_, i) => String.fromCharCode(i + 97),
);
const encoder = new TextEncoder();

function createEntropy(length: number, random: Uint8Array): string {
  let entropy = "";
  let offset = 0;

  while (entropy.length < length) {
    const value = random[offset];
    entropy += Math.floor(value % 36).toString(36);
    offset = (offset + 1) % random.length;
  }

  return entropy;
}

function hash(input: string): Effect.Effect<string> {
  return Effect.map(sha512(encoder.encode(input)), (buffer) => {
    const view = new Uint8Array(buffer);
    let value = 0n;
    for (const byte of view) {
      value = (value << 8n) + BigInt(byte);
    }
    // Drop the first character because it will bias the histogram to the left
    return value.toString(36).slice(1);
  });
}

function cuidFromSeed({
  counter,
  fingerprint,
  random,
  timestamp,
}: CuidSeed): Effect.Effect<Cuid> {
  return Effect.gen(function* () {
    // First letter is always a random lowercase letter from the seed
    const firstLetter = ALPHABET[random[0] % ALPHABET.length];

    // Convert components to base36
    const time = timestamp.toString(36);
    const count = counter.toString(36);

    // Create entropy from remaining random bytes
    const salt = createEntropy(4, random.slice(1));

    // Hash all components together
    const hashInput = `${time}${salt}${count}${fingerprint}`;
    const hashed = yield* hash(hashInput);

    // Construct the final CUID
    const id = `${firstLetter}${hashed.substring(0, DEFAULT_LENGTH - 1)}`;

    return Cuid.make(id);
  });
}
