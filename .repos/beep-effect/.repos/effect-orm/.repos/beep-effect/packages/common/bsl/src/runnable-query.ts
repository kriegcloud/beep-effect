import type { Dialect } from "./column-builder.ts";
import type { PreparedQuery } from "./session";

export interface RunnableQuery<T, TDialect extends Dialect.Type> {
  readonly _: {
    readonly dialect: TDialect;
    readonly result: T;
  };

  /** @internal */
  _prepare(): PreparedQuery;
}
