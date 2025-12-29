import { entityKind } from "../../entity";
import type { PgTable } from "../table";
import { PgColumn, PgColumnBuilder } from "./common";

export class PgMacaddrBuilder extends PgColumnBuilder<{
  dataType: "string macaddr";
  data: string;
  driverParam: string;
}> {
  static override readonly [entityKind]: string = "PgMacaddrBuilder";

  constructor(name: string) {
    super(name, "string macaddr", "PgMacaddr");
  }

  /** @internal */
  override build(table: PgTable<any>) {
    return new PgMacaddr(table, this.config as any);
  }
}

export class PgMacaddr extends PgColumn<"string macaddr"> {
  static override readonly [entityKind]: string = "PgMacaddr";

  getSQLType(): string {
    return "macaddr";
  }
}

export function macaddr(name?: undefined | string): PgMacaddrBuilder {
  return new PgMacaddrBuilder(name ?? "");
}
