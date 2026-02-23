import { type Chunk, type Effect, Random } from "effect";

export function shuffle<T>(array: readonly T[], seed: string): Effect.Effect<Chunk.Chunk<T>, never, never> {
  const seededRandom = Random.make(seed);
  return seededRandom.shuffle(array);
}
