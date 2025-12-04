import {Stream, Effect, Tuple, Chunk, pipe} from "effect";
import {constant} from "effect/Function";
import * as O from "effect/Option";

export const paginate =
  (size: number) =>
    <Element, E, R>(
      self: Effect.Effect<ReadonlyArray<Element>, E, R>
    ) => Stream.paginateChunkEffect(
      undefined,
      pipe(
        self,
        Effect.map((page) =>
          Tuple.make(
            Chunk.unsafeFromArray(page),
            page.length >= size
              ? O.some(undefined)
              : O.none()
          )),
        constant
      ),
    );