import { entityKind } from "../../entity";
import type { PgTable } from "../table";
import { PgColumn, PgColumnBuilder } from "./common";

export class PgIntegerBuilder extends PgColumnBuilder<{
  dataType: "number int32";
  data: number;
  driverParam: number | string;
}> {
  static override readonly [entityKind]: string = "PgIntegerBuilder";

  constructor(name: string) {
    super(name, "number int32", "PgInteger");
  }

  /** @internal */
  override build(table: PgTable<any>) {
    return new PgInteger(table, this.config as any);
  }
}

export class PgInteger extends PgColumn<"number int32"> {
  static override readonly [entityKind]: string = "PgInteger";

  getSQLType(): string {
    return "integer";
  }

  override mapFromDriverValue(value: number | string): number {
    if (typeof value === "string") {
      return Number.parseInt(value, 10);
    }
    return value;
  }
}
export function integer(name?: undefined | string): PgIntegerBuilder {
  return new PgIntegerBuilder(name ?? "");
}
