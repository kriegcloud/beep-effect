import type { Effect } from "effect";
import type { DomainError, Logger, Repo } from "./service";

export interface Runner {
  run(input: string): Effect.Effect<number, DomainError, Repo | Logger>;
}

export type Entity<T extends string> = {
  id: T;
};

export type Maybe<T> = T | undefined;

export enum Status {
  Idle = "idle",
  Busy = "busy",
}

export enum Flags {
  On = 1,
  Off = 0,
}
