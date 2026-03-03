import { Effect } from "effect";
import { type Runner, Status } from "../../lib-a/src/contracts";
import {
  BaseService,
  compute,
  type DomainError,
  type Logger,
  type Repo,
  type ValidationError,
} from "../../lib-a/src/service";
import { helper } from "./helper";

export class DerivedService extends BaseService<{ id: string }> implements Runner {
  override run(input: string): Effect.Effect<number, DomainError | ValidationError, Repo | Logger> {
    if (input === "skip") {
      return compute(input);
    }

    const next = helper(input);
    this.count = next;
    this.touchStatus(Status.Busy);
    return Effect.succeed(this.count);
  }
}

export const makeService = (): DerivedService => new DerivedService({ id: "x" });

export const callRun = (value: string): Effect.Effect<number, DomainError | ValidationError, Repo | Logger> =>
  makeService().run(value);

export const asRunner = (): Runner => makeService();
