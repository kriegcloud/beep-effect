import { entityKind } from "../../entity";
import { SQL, type SQLWrapper, sql } from "../../sql/sql";
import type { NeonAuthToken } from "../../utils";
import type { PgSession } from "../session";
import type { PgTable } from "../table";
import type { PgViewBase } from "../view-base";

export class PgCountBuilder<TSession extends PgSession<any, any, any>>
  extends SQL<number>
  implements Promise<number>, SQLWrapper<number>
{
  private sql: SQL<number>;
  private token?: NeonAuthToken;

  static override readonly [entityKind]: string = "PgCountBuilder";
  [Symbol.toStringTag] = "PgCountBuilder";

  private session: TSession;

  private static buildEmbeddedCount(
    source: PgTable | PgViewBase | SQL | SQLWrapper,
    filters?: undefined | SQL<unknown>
  ): SQL<number> {
    return sql<number>`(select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters})`;
  }

  private static buildCount(
    source: PgTable | PgViewBase | SQL | SQLWrapper,
    filters?: undefined | SQL<unknown>
  ): SQL<number> {
    return sql<number>`select count(*) as count from ${source}${sql.raw(" where ").if(filters)}${filters};`;
  }

  constructor(
    readonly params: {
      source: PgTable | PgViewBase | SQL | SQLWrapper;
      filters?: undefined | SQL<unknown>;
      session: TSession;
    }
  ) {
    super(PgCountBuilder.buildEmbeddedCount(params.source, params.filters).queryChunks);

    this.mapWith(Number);

    this.session = params.session;

    this.sql = PgCountBuilder.buildCount(params.source, params.filters);
  }

  /** @intrnal */
  setToken(token?: NeonAuthToken) {
    if (token) {
      this.token = token;
    }
    return this;
  }

  then<TResult1 = number, TResult2 = never>(
    onfulfilled?: undefined | ((value: number) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: undefined | ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.session.count(this.sql, this.token)).then(onfulfilled, onrejected);
  }

  catch(onRejected?: ((reason: any) => any) | null | undefined): Promise<number> {
    return this.then(undefined, onRejected);
  }

  finally(onFinally?: (() => void) | null | undefined): Promise<number> {
    return this.then(
      (value) => {
        onFinally?.();
        return value;
      },
      (reason) => {
        onFinally?.();
        throw reason;
      }
    );
  }
}
