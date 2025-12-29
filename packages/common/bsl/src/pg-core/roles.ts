import { entityKind } from "../entity";

export interface PgRoleConfig {
  createDb?: undefined | boolean;
  createRole?: undefined | boolean;
  inherit?: undefined | boolean;
}

export class PgRole implements PgRoleConfig {
  static readonly [entityKind]: string = "PgRole";

  /** @internal */
  _existing?: undefined | boolean;

  /** @internal */
  readonly createDb: PgRoleConfig["createDb"];
  /** @internal */
  readonly createRole: PgRoleConfig["createRole"];
  /** @internal */
  readonly inherit: PgRoleConfig["inherit"];

  constructor(
    readonly name: string,
    config?: undefined | PgRoleConfig
  ) {
    if (config) {
      this.createDb = config.createDb;
      this.createRole = config.createRole;
      this.inherit = config.inherit;
    }
  }

  existing(): this {
    this._existing = true;
    return this;
  }
}

export function pgRole(name: string, config?: undefined | PgRoleConfig) {
  return new PgRole(name, config);
}
