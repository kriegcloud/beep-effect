import { entityKind } from "./entity";
export class DrizzleError extends Error {
  static readonly [entityKind]: string = "DrizzleError";

  constructor({ message, cause }: { readonly message?: undefined | string; readonly cause?: undefined | unknown }) {
    super(message);
    this.name = "DrizzleError";
    this.cause = cause;
  }
}

export class DrizzleQueryError extends Error {
  static readonly [entityKind]: string = "DrizzleQueryError";
  public readonly query: string;
  public readonly params: any[];
  public override readonly cause?: undefined | Error;

  constructor(query: string, params: any[], cause?: undefined | Error) {
    super(`Failed query: ${query}\nparams: ${params}`);
    this.query = query;
    this.params = params;
    this.cause = cause;
    Error.captureStackTrace(this, DrizzleQueryError);

    // ES2022+: preserves original error on `.cause`
    if (cause) this.cause = cause;
  }
}

export class TransactionRollbackError extends DrizzleError {
  static override readonly [entityKind]: string = "TransactionRollbackError";

  constructor() {
    super({ message: "Rollback" });
  }
}
