import * as A from "effect/Array";
import * as F from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Str from "effect/String";

export const searchPattern = (buffer: Buffer, pattern: Buffer | string): number =>
  F.pipe(
    pattern,
    O.liftPredicate(Str.isString),
    O.match({
      onNone: () => pattern as Buffer<ArrayBufferLike>,
      onSome: (pattern) => Buffer.from(pattern),
    }),
    (pattern) => buffer.indexOf(pattern)
  );

export const bufferToHex = (buffer: Buffer, maxBytes = 16): string =>
  F.pipe(buffer.subarray(0, maxBytes).toString("hex"), Str.toUpperCase);

export function calculateEntropy(buffer: Buffer): number {
  const frequencies = MutableHashMap.empty<number, number>();

  for (const byte of buffer) {
    MutableHashMap.modifyAt(frequencies, byte, (existingOpt) =>
      F.pipe(
        existingOpt,
        O.match({
          onNone: () => O.some(1),
          onSome: (count) => O.some(count + 1),
        })
      )
    );
  }

  const len = buffer.length;
  const counts = MutableHashMap.values(frequencies);

  return F.pipe(
    counts,
    A.reduce(0, (entropy, count) => {
      const probability = count / len;
      return entropy - probability * Math.log2(probability);
    })
  );
}
