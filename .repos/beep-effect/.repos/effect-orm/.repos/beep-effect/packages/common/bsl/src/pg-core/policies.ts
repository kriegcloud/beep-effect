import { entityKind } from "../entity";
import type { SQL } from "../sql/sql";
import type { PgRole } from "./roles";
import type { PgTable } from "./table";

export type PgPolicyToOption =
  | "public"
  | "current_role"
  | "current_user"
  | "session_user"
  | (string & {})
  | PgPolicyToOption[]
  | PgRole;

export interface PgPolicyConfig {
  as?: undefined | "permissive" | "restrictive";
  for?: undefined | "all" | "select" | "insert" | "update" | "delete";
  to?: undefined | PgPolicyToOption;
  using?: undefined | SQL;
  withCheck?: undefined | SQL;
}

export class PgPolicy implements PgPolicyConfig {
  static readonly [entityKind]: string = "PgPolicy";

  readonly as: PgPolicyConfig["as"];
  readonly for: PgPolicyConfig["for"];
  readonly to: PgPolicyConfig["to"];
  readonly using: PgPolicyConfig["using"];
  readonly withCheck: PgPolicyConfig["withCheck"];

  /** @internal */
  _linkedTable?: undefined | PgTable;

  constructor(
    readonly name: string,
    config?: undefined | PgPolicyConfig
  ) {
    if (config) {
      this.as = config.as;
      this.for = config.for;
      this.to = config.to;
      this.using = config.using;
      this.withCheck = config.withCheck;
    }
  }

  link(table: PgTable): this {
    this._linkedTable = table;
    return this;
  }
}

export function pgPolicy(name: string, config?: undefined | PgPolicyConfig) {
  return new PgPolicy(name, config);
}
