import { Effect } from "effect";
import type { Entity, Runner, Status } from "./contracts";
import { model, track } from "./decorators";

export class DomainError extends Error {}
export class ValidationError extends Error {}

export interface Repo {
  save(value: string): Effect.Effect<void>;
}

export interface Logger {
  log(value: string): Effect.Effect<void>;
}

@model()
export abstract class BaseService<T extends Entity<string>> implements Runner {
  @track()
  protected readonly name = "base";

  protected _count = 0;

  constructor(public readonly entity: T) {}

  get count(): number {
    return this._count;
  }

  set count(value: number) {
    this._count = value;
  }

  protected mutate(next: number): number {
    this._count = next;
    return this._count;
  }

  protected touchStatus(status: Status): number {
    if (status === "busy") {
      return this._count;
    }

    return this.mutate(1);
  }

  abstract run(input: string): Effect.Effect<number, DomainError | ValidationError, Repo | Logger>;
}

export const compute = (input: string): Effect.Effect<number, DomainError | ValidationError, Repo | Logger> =>
  Effect.gen(function* () {
    if (input.length === 0) {
      return yield* Effect.fail(new ValidationError("empty"));
    }

    if (input === "boom") {
      throw new DomainError("boom");
    }

    return input.length;
  });

export const genericIdentity = <T extends DomainError>(value: T): T => value;
