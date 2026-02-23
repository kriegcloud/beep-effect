import { entityKind } from "../../entity";
import type { PgTable } from "../table";
import { PgColumn, PgColumnBuilder } from "./common";

export class PgMacaddr8Builder extends PgColumnBuilder<{
  dataType: "string macaddr8";
  data: string;
  driverParam: string;
}> {
  static override readonly [entityKind]: string = "PgMacaddr8Builder";

  constructor(name: string) {
    super(name, "string macaddr8", "PgMacaddr8");
  }

  /** @internal */
  override build(table: PgTable<any>) {
    return new PgMacaddr8(table, this.config as any);
  }
}

export class PgMacaddr8 extends PgColumn<"string macaddr8"> {
  static override readonly [entityKind]: string = "PgMacaddr8";

  getSQLType(): string {
    return "macaddr8";
  }
}

export function macaddr8(name?: undefined | string): PgMacaddr8Builder {
  return new PgMacaddr8Builder(name ?? "");
}
